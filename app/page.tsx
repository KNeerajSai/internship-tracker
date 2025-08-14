"use client";

import { useState, useEffect, useRef } from "react";

interface Internship {
  id: string;
  company: string;
  position: string;
  status: string;
  location?: string;
  applicationDate?: string;
  salary?: string;
  notes?: string;
  dateAdded: string;
  companyLogo?: string;
  description?: string;
  skills?: string[];
  deadline?: string;
  interviewDate?: string;
  resumeUsed?: string;
  contacts?: Contact[];
}

interface Contact {
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
  notes?: string;
}

interface Resume {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  tags: string[];
}

interface Alert {
  id: string;
  type: 'deadline' | 'interview' | 'followup' | 'status';
  message: string;
  date: string;
  internshipId: string;
  read: boolean;
}

// Company logos (using placeholder images)
const companyLogos: Record<string, string> = {
  google: "https://logo.clearbit.com/google.com",
  microsoft: "https://logo.clearbit.com/microsoft.com",
  apple: "https://logo.clearbit.com/apple.com",
  amazon: "https://logo.clearbit.com/amazon.com",
  meta: "https://logo.clearbit.com/meta.com",
  netflix: "https://logo.clearbit.com/netflix.com",
  tesla: "https://logo.clearbit.com/tesla.com",
  spotify: "https://logo.clearbit.com/spotify.com",
  default: "https://via.placeholder.com/100x100/3b82f6/ffffff?text=Company"
};

export default function Home() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // New state for features
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showResumes, setShowResumes] = useState(false);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    status: "applied",
    applicationDate: "",
    salary: "",
    notes: "",
    description: "",
    skills: [] as string[],
    deadline: "",
    interviewDate: "",
    resumeUsed: "",
    contacts: [] as Contact[],
  });

  // Smooth scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load data from localStorage on mount
  useEffect(() => {
    setTimeout(() => {
      const saved = localStorage.getItem('internships');
      const savedAlerts = localStorage.getItem('alerts');
      const savedResumes = localStorage.getItem('resumes');
      
      if (saved) {
        setInternships(JSON.parse(saved));
      }
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
      if (savedResumes) {
        setResumes(JSON.parse(savedResumes));
      }
      setLoading(false);
    }, 1000); // Simulate loading
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('internships', JSON.stringify(internships));
      localStorage.setItem('alerts', JSON.stringify(alerts));
      localStorage.setItem('resumes', JSON.stringify(resumes));
    }
  }, [internships, alerts, resumes, loading]);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animated counter effect
  useEffect(() => {
    const animateCounters = () => {
      const counters = document.querySelectorAll('.animate-counter');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current).toString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toString();
          }
        };
        
        if (target > 0) {
          updateCounter();
        }
      });
    };
    
    // Trigger animation when stats change
    if (!loading && internships.length > 0) {
      animateCounters();
    }
  }, [internships, loading]);

  // Generate alerts based on internships
  useEffect(() => {
    if (!loading) {
      const newAlerts: Alert[] = [];
      const today = new Date();
      
      internships.forEach((internship) => {
        // Deadline alerts
        if (internship.deadline) {
          const deadline = new Date(internship.deadline);
          const daysUntilDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDeadline === 7) {
            newAlerts.push({
              id: `${internship.id}-deadline-7`,
              type: 'deadline',
              message: `Application deadline for ${internship.company} is in 1 week!`,
              date: today.toISOString(),
              internshipId: internship.id,
              read: false
            });
          } else if (daysUntilDeadline === 3) {
            newAlerts.push({
              id: `${internship.id}-deadline-3`,
              type: 'deadline',
              message: `⚠️ Application deadline for ${internship.company} is in 3 days!`,
              date: today.toISOString(),
              internshipId: internship.id,
              read: false
            });
          } else if (daysUntilDeadline === 1) {
            newAlerts.push({
              id: `${internship.id}-deadline-1`,
              type: 'deadline',
              message: `🚨 Application deadline for ${internship.company} is tomorrow!`,
              date: today.toISOString(),
              internshipId: internship.id,
              read: false
            });
          }
        }
        
        // Interview reminders
        if (internship.interviewDate && internship.status === 'interview') {
          const interviewDate = new Date(internship.interviewDate);
          const hoursUntilInterview = Math.ceil((interviewDate.getTime() - today.getTime()) / (1000 * 60 * 60));
          
          if (hoursUntilInterview === 24) {
            newAlerts.push({
              id: `${internship.id}-interview-24`,
              type: 'interview',
              message: `🎤 Interview with ${internship.company} is tomorrow! Time to prepare!`,
              date: today.toISOString(),
              internshipId: internship.id,
              read: false
            });
          } else if (hoursUntilInterview === 2) {
            newAlerts.push({
              id: `${internship.id}-interview-2`,
              type: 'interview',
              message: `🎯 Interview with ${internship.company} is in 2 hours! Good luck!`,
              date: today.toISOString(),
              internshipId: internship.id,
              read: false
            });
          }
        }
        
        // Follow-up reminders
        if (internship.status === 'interview' && internship.interviewDate) {
          const interviewDate = new Date(internship.interviewDate);
          const daysSinceInterview = Math.floor((today.getTime() - interviewDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceInterview === 1) {
            newAlerts.push({
              id: `${internship.id}-followup`,
              type: 'followup',
              message: `📧 Send a thank you email to ${internship.company}!`,
              date: today.toISOString(),
              internshipId: internship.id,
              read: false
            });
          }
        }
      });
      
      // Only add new alerts that don't already exist
      const existingAlertIds = alerts.map(a => a.id);
      const uniqueNewAlerts = newAlerts.filter(alert => !existingAlertIds.includes(alert.id));
      
      if (uniqueNewAlerts.length > 0) {
        setAlerts([...alerts, ...uniqueNewAlerts]);
      }
      
      // Update unread count
      const unread = alerts.filter(a => !a.read).length;
      setUnreadAlerts(unread);
    }
  }, [internships, loading, alerts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const companyLower = formData.company.toLowerCase();
    const logo = companyLogos[companyLower] || 
                 (companyLower.includes('google') ? companyLogos.google :
                  companyLower.includes('microsoft') ? companyLogos.microsoft :
                  companyLower.includes('apple') ? companyLogos.apple :
                  companyLower.includes('amazon') ? companyLogos.amazon :
                  companyLower.includes('meta') || companyLower.includes('facebook') ? companyLogos.meta :
                  companyLogos.default);
    
    if (editingId) {
      setInternships(internships.map(internship => 
        internship.id === editingId 
          ? { ...internship, ...formData, companyLogo: logo }
          : internship
      ));
      setEditingId(null);
    } else {
      const newInternship: Internship = {
        id: Date.now().toString(),
        ...formData,
        dateAdded: new Date().toISOString(),
        companyLogo: logo
      };
      setInternships([newInternship, ...internships]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      location: "",
      status: "applied",
      applicationDate: "",
      salary: "",
      notes: "",
      description: "",
      skills: [],
      deadline: "",
      interviewDate: "",
      resumeUsed: "",
      contacts: [],
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (internship: Internship) => {
    setFormData({
      company: internship.company,
      position: internship.position,
      location: internship.location || "",
      status: internship.status,
      applicationDate: internship.applicationDate || "",
      salary: internship.salary || "",
      notes: internship.notes || "",
      description: internship.description || "",
      skills: internship.skills || [],
      deadline: internship.deadline || "",
      interviewDate: internship.interviewDate || "",
      resumeUsed: internship.resumeUsed || "",
      contacts: internship.contacts || [],
    });
    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setInternships(prev => prev.filter(internship => internship.id !== id));
  };

  // Calendar Integration Functions
  const generateCalendarEvents = () => {
    const events: string[] = [];
    
    internships.forEach(internship => {
      // Add deadline events
      if (internship.deadline) {
        const deadlineDate = new Date(internship.deadline);
        events.push(createICSEvent({
          title: `Application Deadline: ${internship.company} - ${internship.position}`,
          start: deadlineDate,
          end: deadlineDate,
          description: `Deadline for ${internship.position} position at ${internship.company}`,
          location: internship.location || '',
        }));
      }
      
      // Add interview events
      if (internship.interviewDate) {
        const interviewDate = new Date(internship.interviewDate);
        const endDate = new Date(interviewDate.getTime() + 60 * 60 * 1000); // 1 hour interview
        events.push(createICSEvent({
          title: `Interview: ${internship.company} - ${internship.position}`,
          start: interviewDate,
          end: endDate,
          description: `Interview for ${internship.position} position at ${internship.company}`,
          location: internship.location || 'Check email for details',
          alarm: 60, // 60 minutes before
        }));
      }
    });
    
    return events;
  };

  const createICSEvent = (event: {
    title: string;
    start: Date;
    end: Date;
    description: string;
    location: string;
    alarm?: number;
  }) => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const icsEvent = [
      'BEGIN:VEVENT',
      `UID:${Date.now()}@interntracker`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(event.end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
    ];
    
    if (event.alarm) {
      icsEvent.push(
        'BEGIN:VALARM',
        'TRIGGER:-PT' + event.alarm + 'M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${event.title}`,
        'END:VALARM'
      );
    }
    
    icsEvent.push('END:VEVENT');
    return icsEvent.join('\r\n');
  };

  const downloadICS = (events: string[]) => {
    if (events.length === 0) {
      alert('No events to export. Add deadlines or interview dates to your applications.');
      return;
    }
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//InternTracker//EN',
      'CALSCALE:GREGORIAN',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'internship-events.ics';
    link.click();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(internships, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'internships.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setInternships([...internships, ...imported]);
        } catch {
          alert('Error importing file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter and sort internships
  const filteredInternships = internships
    .filter(internship => {
      const matchesSearch = internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (internship.location?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === "all" || internship.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "company":
          return a.company.localeCompare(b.company);
        case "status":
          return a.status.localeCompare(b.status);
        case "dateAdded":
        default:
          return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
      }
    });

  // Calculate statistics
  const stats = {
    total: internships.length,
    applied: internships.filter(i => i.status === "applied").length,
    interview: internships.filter(i => i.status === "interview").length,
    offer: internships.filter(i => i.status === "offer").length,
    rejected: internships.filter(i => i.status === "rejected").length,
    accepted: internships.filter(i => i.status === "accepted").length,
  };

  const statusColors = {
    applied: "from-yellow-400 to-amber-500",
    interview: "from-blue-400 to-indigo-500",
    offer: "from-green-400 to-emerald-500",
    rejected: "from-red-400 to-rose-500",
    accepted: "from-purple-400 to-violet-500"
  };

  const statusIcons = {
    applied: "📝",
    interview: "🎤",
    offer: "🎉",
    rejected: "❌",
    accepted: "✅"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-xl animate-pulse">Loading your internship journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-lg z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InternTracker Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="text-xl">🔔</span>
                {unreadAlerts > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowResumes(!showResumes)}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="text-xl">📄</span>
              </button>
              <button
                onClick={() => {
                  const calendarEvents = generateCalendarEvents();
                  downloadICS(calendarEvents);
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                title="Export to Calendar"
              >
                <span className="text-xl">📅</span>
              </button>
              <button
                onClick={() => scrollToSection(statsRef)}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Analytics
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Add New
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Alerts Dropdown */}
      {showAlerts && (
        <div className="fixed top-20 right-4 w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <button
                onClick={() => {
                  setAlerts(alerts.map(a => ({ ...a, read: true })));
                  setUnreadAlerts(0);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl mb-2 block">🔔</span>
                No notifications yet
              </div>
            ) : (
              alerts.slice().reverse().map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !alert.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, read: true } : a));
                    const internship = internships.find(i => i.id === alert.internshipId);
                    if (internship) {
                      setSelectedInternship(internship);
                    }
                    setShowAlerts(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {alert.type === 'deadline' ? '📅' :
                       alert.type === 'interview' ? '🎤' :
                       alert.type === 'followup' ? '📧' : '📌'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${!alert.read ? 'font-semibold' : ''}`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Resume Manager */}
      {showResumes && (
        <div className="fixed top-20 right-4 w-[500px] max-h-[600px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Resume Manager</h3>
              <button
                onClick={() => setShowResumes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const newResume: Resume = {
                          id: Date.now().toString(),
                          name: file.name,
                          type: 'general',
                          url: reader.result as string,
                          uploadDate: new Date().toISOString(),
                          tags: []
                        };
                        setResumes([...resumes, newResume]);
                      };
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📤 Upload Resume
              </button>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg"
                onChange={(e) => {
                  const type = e.target.value;
                  if (type) {
                    // Filter resumes by type
                  }
                }}
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="tech">Technical</option>
                <option value="business">Business</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>
          
          <div className="p-6 max-h-[450px] overflow-y-auto">
            {resumes.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📄</span>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No resumes uploaded yet</h4>
                <p className="text-gray-500">Upload your resumes to easily attach them to applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📄</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{resume.name}</h4>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(resume.uploadDate).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {resume.type}
                            </span>
                            {resume.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = resume.url;
                            link.download = resume.name;
                            link.click();
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setResumes(resumes.filter(r => r.id !== resume.id));
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section with Video Background */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-pink-900/90 z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2024/06/17/217312_large.mp4" type="video/mp4" />
        </video>
        
        {/* Floating Company Logos Background */}
        <div className="absolute inset-0 z-[5] overflow-hidden">
          {[
            { name: 'google', url: 'https://logo.clearbit.com/google.com', size: 80 },
            { name: 'microsoft', url: 'https://logo.clearbit.com/microsoft.com', size: 75 },
            { name: 'apple', url: 'https://logo.clearbit.com/apple.com', size: 70 },
            { name: 'amazon', url: 'https://logo.clearbit.com/amazon.com', size: 85 },
            { name: 'meta', url: 'https://logo.clearbit.com/meta.com', size: 75 },
            { name: 'netflix', url: 'https://logo.clearbit.com/netflix.com', size: 70 },
            { name: 'tesla', url: 'https://logo.clearbit.com/tesla.com', size: 75 },
            { name: 'spotify', url: 'https://logo.clearbit.com/spotify.com', size: 65 },
            { name: 'uber', url: 'https://logo.clearbit.com/uber.com', size: 70 },
            { name: 'airbnb', url: 'https://logo.clearbit.com/airbnb.com', size: 75 },
            { name: 'stripe', url: 'https://logo.clearbit.com/stripe.com', size: 65 },
            { name: 'salesforce', url: 'https://logo.clearbit.com/salesforce.com', size: 80 }
          ].map((company, index) => (
            <div
              key={index}
              className="absolute animate-float-slow opacity-10"
              style={{
                left: `${10 + (index % 4) * 25}%`,
                top: `${10 + Math.floor(index / 4) * 30}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: `${20 + index * 2}s`
              }}
            >
              <img
                src={company.url}
                alt={company.name}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-3"
                style={{ width: `${company.size}px`, height: `${company.size}px` }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="relative z-20 h-full flex items-center justify-center">
          {/* Animated particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
          
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              Track Your Dream
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-gradient-text">
                Internship Journey
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 animate-fade-in-up animation-delay-200 text-gray-200">
              Organize, track, and land your perfect internship opportunity with our powerful tracking platform
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up animation-delay-400">
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
              >
                🚀 Get Started
              </button>
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                Learn More ↓
              </button>
            </div>
            
            <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-in-up animation-delay-600">
              <div className="text-center">
                <div className="text-4xl font-bold animate-counter" data-target={stats.total}>0</div>
                <div className="text-sm uppercase tracking-wider">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold animate-counter" data-target={stats.interview}>0</div>
                <div className="text-sm uppercase tracking-wider">Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold animate-counter" data-target={stats.offer}>0</div>
                <div className="text-sm uppercase tracking-wider">Offers</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Section with Video Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-10"
          >
            <source src="https://cdn.pixabay.com/video/2023/10/13/184631-875098566_large.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to manage your internship applications effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Smart Analytics",
                description: "Track your application progress with detailed statistics and insights",
                color: "from-blue-400 to-cyan-500",
                animation: "animate-float"
              },
              {
                icon: "🎯",
                title: "Status Tracking",
                description: "Monitor each application from submission to final decision",
                color: "from-purple-400 to-pink-500",
                animation: "animate-float animation-delay-200"
              },
              {
                icon: "📱",
                title: "Mobile Ready",
                description: "Access your applications anywhere with our responsive design",
                color: "from-green-400 to-emerald-500",
                animation: "animate-float animation-delay-400"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${feature.animation}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Company Logos Marquee */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Trusted by Students Landing Internships at</h3>
          <p className="text-gray-600">Top companies worldwide are waiting for talented interns like you</p>
        </div>
        
        {/* First Row - Moving Right */}
        <div className="relative mb-8">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center space-x-12 mx-12">
                {[
                  'google.com', 'apple.com', 'microsoft.com', 'amazon.com', 
                  'meta.com', 'netflix.com', 'tesla.com', 'spotify.com'
                ].map((company, index) => (
                  <div key={`${setIndex}-${index}`} className="flex-shrink-0">
                    <img
                      src={`https://logo.clearbit.com/${company}`}
                      alt={company}
                      className="h-16 w-auto grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Second Row - Moving Left */}
        <div className="relative">
          <div className="flex animate-marquee-reverse whitespace-nowrap">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex items-center space-x-12 mx-12">
                {[
                  'uber.com', 'airbnb.com', 'stripe.com', 'salesforce.com',
                  'oracle.com', 'adobe.com', 'intel.com', 'nvidia.com'
                ].map((company, index) => (
                  <div key={`${setIndex}-${index}`} className="flex-shrink-0">
                    <img
                      src={`https://logo.clearbit.com/${company}`}
                      alt={company}
                      className="h-16 w-auto grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section with Animated Background */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 sticky top-20 z-30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search companies, positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</span>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="applied">📝 Applied</option>
                <option value="interview">🎤 Interview</option>
                <option value="offer">🎉 Offer</option>
                <option value="rejected">❌ Rejected</option>
                <option value="accepted">✅ Accepted</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
              >
                <option value="dateAdded">Latest First</option>
                <option value="company">Company Name</option>
                <option value="status">Status</option>
              </select>

              <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 py-3 transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 py-3 transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  List View
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-300"
              >
                📊 {showStats ? 'Hide' : 'Show'} Analytics
              </button>
              <button
                onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 px-4 py-2 rounded-lg hover:from-indigo-200 hover:to-blue-200 transition-all duration-300"
              >
                📈 Advanced Analytics
              </button>
              <button
                onClick={exportData}
                className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-lg hover:from-green-200 hover:to-emerald-200 transition-all duration-300"
              >
                📤 Export Data
              </button>
              <label className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-lg hover:from-orange-200 hover:to-red-200 transition-all duration-300 cursor-pointer">
                📥 Import Data
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          {/* Statistics Dashboard */}
          {showStats && (
            <div ref={statsRef} className="relative bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-down overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02]">
                <div className="grid grid-cols-8 gap-4 p-4">
                  {[...Array(32)].map((_, i) => {
                    const techCompanies = [
                      'github.com', 'gitlab.com', 'slack.com', 'zoom.us', 
                      'dropbox.com', 'figma.com', 'notion.so', 'vercel.com'
                    ];
                    const company = techCompanies[i % techCompanies.length];
                    return (
                      <img
                        key={i}
                        src={`https://logo.clearbit.com/${company}`}
                        alt=""
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              
              <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Application Analytics Dashboard</h3>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Success Rate</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.total > 0 ? Math.round(((stats.offer + stats.accepted) / stats.total) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">of applications successful</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Interview Rate</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">applications to interviews</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Active Pipeline</h4>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.applied + stats.interview}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">applications in progress</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="text-center group">
                    <div className="relative w-24 h-24 mx-auto mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(value / stats.total) * 226 || 0} 226`}
                          strokeLinecap="round"
                          className={`${
                            key === 'total' ? 'text-gray-600' :
                            key === 'applied' ? 'text-yellow-500' :
                            key === 'interview' ? 'text-blue-500' :
                            key === 'offer' ? 'text-green-500' :
                            key === 'rejected' ? 'text-red-500' : 'text-purple-500'
                          } transition-all duration-1000`}
                          style={{
                            filter: 'drop-shadow(0 0 8px currentColor)'
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold animate-counter" data-target={value}>{value}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600 capitalize">{key}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {stats.total > 0 ? `${Math.round((value / stats.total) * 100)}%` : '0%'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Timeline Chart */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Application Timeline</h4>
                <div className="relative h-32 bg-gray-50 rounded-xl p-4">
                  <div className="absolute inset-x-4 top-1/2 transform -translate-y-1/2 h-2 bg-gray-200 rounded-full">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-width-grow" 
                         style={{ width: `${Math.min((internships.length / 10) * 100, 100)}%` }}>
                    </div>
                  </div>
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div key={percent} className="absolute top-1/2 transform -translate-y-1/2" 
                         style={{ left: `${percent}%` }}>
                      <div className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></div>
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        {Math.round((percent / 100) * 10)}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Track up to 10 applications to unlock full analytics
                </p>
              </div>
              </div>
            </div>
          )}

          {/* Advanced Analytics Dashboard */}
          {showAdvancedAnalytics && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-down">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Advanced Analytics Dashboard</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Response Rate by Company Type */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Response Rate by Type</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>FAANG Companies</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Startups</span>
                        <span className="font-semibold">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mid-size</span>
                        <span className="font-semibold">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Average Time to Response */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Avg. Response Time</h4>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {internships.length > 0 ? '12' : '0'} days
                  </div>
                  <p className="text-sm text-gray-600">From application to first response</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Fastest:</span>
                      <span className="font-semibold">2 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slowest:</span>
                      <span className="font-semibold">45 days</span>
                    </div>
                  </div>
                </div>

                {/* Application Velocity */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Application Velocity</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {internships.length > 0 ? Math.round(internships.length / 4) : 0}/week
                  </div>
                  <p className="text-sm text-gray-600">Average applications per week</p>
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">This month: {internships.length} applications</div>
                    <div className="text-xs text-gray-500">Last month: 0 applications</div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Conversion Funnel</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Applied → Interview</span>
                      <span className="font-semibold text-blue-600">
                        {stats.total > 0 ? Math.round((stats.interview / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interview → Offer</span>
                      <span className="font-semibold text-green-600">
                        {stats.interview > 0 ? Math.round((stats.offer / stats.interview) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offer → Accepted</span>
                      <span className="font-semibold text-purple-600">
                        {stats.offer > 0 ? Math.round((stats.accepted / stats.offer) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Industry Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Applications by Industry</h4>
                  <div className="space-y-3">
                    {['Technology', 'Finance', 'Healthcare', 'Retail', 'Other'].map((industry, idx) => {
                      const count = Math.floor(Math.random() * 10) + 1;
                      const percentage = (count / 30) * 100;
                      return (
                        <div key={industry}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{industry}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                idx === 0 ? 'bg-blue-500' :
                                idx === 1 ? 'bg-green-500' :
                                idx === 2 ? 'bg-purple-500' :
                                idx === 3 ? 'bg-orange-500' : 'bg-gray-500'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Top Skills in Demand</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'React', 'Machine Learning', 'AWS', 'SQL', 'Java', 'Node.js', 'Docker', 'Kubernetes', 'Git'].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-100 transition-colors"
                      >
                        {skill}
                        <span className="ml-1 text-xs text-gray-500">({Math.floor(Math.random() * 15) + 1})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calendar Heatmap */}
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Application Activity Calendar</h4>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs text-gray-500 font-semibold p-2">
                      {day}
                    </div>
                  ))}
                  {[...Array(35)].map((_, i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded ${
                          intensity > 0.8 ? 'bg-green-600' :
                          intensity > 0.6 ? 'bg-green-500' :
                          intensity > 0.4 ? 'bg-green-400' :
                          intensity > 0.2 ? 'bg-green-300' : 'bg-gray-100'
                        } hover:ring-2 hover:ring-green-600 transition-all cursor-pointer`}
                        title={`${Math.floor(intensity * 5)} applications`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {['bg-gray-100', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600'].map(color => (
                      <div key={color} className={`w-3 h-3 rounded ${color}`}></div>
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          )}

          {/* Internship Cards */}
          {filteredInternships.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-bounce">🎯</div>
              <h3 className="text-3xl font-bold text-gray-700 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "No matches found" 
                  : "Start Your Journey"}
              </h3>
              <p className="text-xl text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Add your first internship application and begin tracking your progress"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
                >
                  Add Your First Application
                </button>
              )}
            </div>
          ) : (
            <div className={`${
              viewMode === "grid" 
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            }`}>
              {filteredInternships.map((internship, index) => (
                <div
                  key={internship.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                    viewMode === "grid" ? "" : "flex items-center"
                  } animate-fade-in-up overflow-hidden group cursor-pointer`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedInternship(internship)}
                >
                  {viewMode === "grid" ? (
                    <div>
                      {/* Card Header with Gradient */}
                      <div className={`h-32 bg-gradient-to-r ${statusColors[internship.status as keyof typeof statusColors]} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                        <div className="relative z-10 p-6 flex items-center justify-between">
                          <div className="text-white">
                            <div className="text-3xl mb-1">{statusIcons[internship.status as keyof typeof statusIcons]}</div>
                            <div className="text-sm font-medium uppercase tracking-wider opacity-90">
                              {internship.status}
                            </div>
                          </div>
                          {internship.companyLogo && (
                            <img
                              src={internship.companyLogo}
                              alt={internship.company}
                              className="w-16 h-16 rounded-lg bg-white p-2 shadow-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = companyLogos.default;
                              }}
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {internship.company}
                        </h3>
                        <p className="text-gray-600 font-medium mb-3">{internship.position}</p>
                        
                        {internship.location && (
                          <p className="text-sm text-gray-500 mb-3 flex items-center">
                            <span className="mr-2">📍</span>
                            {internship.location}
                          </p>
                        )}
                        
                        {internship.applicationDate && (
                          <p className="text-sm text-gray-500 mb-3 flex items-center">
                            <span className="mr-2">📅</span>
                            {new Date(internship.applicationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                        
                        {internship.salary && (
                          <p className="text-sm text-gray-500 mb-4 flex items-center">
                            <span className="mr-2">💰</span>
                            {internship.salary}
                          </p>
                        )}
                        
                        {internship.skills && internship.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {internship.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {internship.skills.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                +{internship.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(internship);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this application?')) {
                                handleDelete(internship.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View
                    <div className="flex items-center p-6 gap-6">
                      {internship.companyLogo && (
                        <img
                          src={internship.companyLogo}
                          alt={internship.company}
                          className="w-20 h-20 rounded-xl shadow-md object-contain bg-gray-50 p-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = companyLogos.default;
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{internship.company}</h3>
                            <p className="text-gray-600">{internship.position}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${
                            statusColors[internship.status as keyof typeof statusColors]
                          } text-white`}>
                            {statusIcons[internship.status as keyof typeof statusIcons]} {internship.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          {internship.location && (
                            <span className="flex items-center">
                              <span className="mr-1">📍</span> {internship.location}
                            </span>
                          )}
                          {internship.applicationDate && (
                            <span className="flex items-center">
                              <span className="mr-1">📅</span>
                              {new Date(internship.applicationDate).toLocaleDateString()}
                            </span>
                          )}
                          {internship.salary && (
                            <span className="flex items-center">
                              <span className="mr-1">💰</span> {internship.salary}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(internship);
                          }}
                          className="p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this application?')) {
                              handleDelete(internship.id);
                            }
                          }}
                          className="p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </section>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {editingId ? "Edit Application" : "Add New Application"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="e.g., Google, Microsoft, Apple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="e.g., Software Engineering Intern"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
                  >
                    <option value="applied">📝 Applied</option>
                    <option value="interview">🎤 Interview Scheduled</option>
                    <option value="offer">🎉 Offer Received</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="accepted">✅ Offer Accepted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({...formData, applicationDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    placeholder="e.g., $20-25/hour or $60,000-80,000/year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({...formData, interviewDate: e.target.value})}
                    disabled={formData.status !== 'interview'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Used
                  </label>
                  <select
                    value={formData.resumeUsed}
                    onChange={(e) => setFormData({...formData, resumeUsed: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none bg-white"
                  >
                    <option value="">Select a resume</option>
                    {resumes.map(resume => (
                      <option key={resume.id} value={resume.id}>
                        {resume.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="Brief description of the role and responsibilities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <input
                  type="text"
                  value={formData.skills?.join(', ')}
                  onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  placeholder="e.g., Python, React, Machine Learning (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="Any additional notes, contacts, or reminders..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  {editingId ? "Update Application" : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                {selectedInternship.companyLogo && (
                  <img
                    src={selectedInternship.companyLogo}
                    alt={selectedInternship.company}
                    className="w-20 h-20 rounded-xl shadow-md object-contain bg-gray-50 p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = companyLogos.default;
                    }}
                  />
                )}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedInternship.company}</h2>
                  <p className="text-xl text-gray-600">{selectedInternship.position}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInternship(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${
                  statusColors[selectedInternship.status as keyof typeof statusColors]
                } text-white`}>
                  {statusIcons[selectedInternship.status as keyof typeof statusIcons]} {selectedInternship.status}
                </span>
                {selectedInternship.location && (
                  <span className="text-gray-600">📍 {selectedInternship.location}</span>
                )}
              </div>

              {(selectedInternship.applicationDate || selectedInternship.deadline || selectedInternship.interviewDate) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Timeline & Important Dates</h3>
                  <div className="space-y-3">
                    {selectedInternship.applicationDate && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Applied</p>
                          <p className="text-gray-600">
                            {new Date(selectedInternship.applicationDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedInternship.deadline && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⏰</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Application Deadline</p>
                          <p className="text-gray-600">
                            {new Date(selectedInternship.deadline).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedInternship.interviewDate && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎤</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Interview Scheduled</p>
                          <p className="text-gray-600">
                            {new Date(selectedInternship.interviewDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} at {new Date(selectedInternship.interviewDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const events = [];
                      if (selectedInternship.deadline) {
                        events.push(createICSEvent({
                          title: `Deadline: ${selectedInternship.company} - ${selectedInternship.position}`,
                          start: new Date(selectedInternship.deadline),
                          end: new Date(selectedInternship.deadline),
                          description: `Application deadline for ${selectedInternship.position}`,
                          location: selectedInternship.location || '',
                        }));
                      }
                      if (selectedInternship.interviewDate) {
                        const interviewDate = new Date(selectedInternship.interviewDate);
                        events.push(createICSEvent({
                          title: `Interview: ${selectedInternship.company} - ${selectedInternship.position}`,
                          start: interviewDate,
                          end: new Date(interviewDate.getTime() + 60 * 60 * 1000),
                          description: `Interview for ${selectedInternship.position}`,
                          location: selectedInternship.location || 'Check email for details',
                          alarm: 60,
                        }));
                      }
                      if (events.length > 0) {
                        downloadICS(events);
                      }
                    }}
                    className="mt-4 w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    📅 Add to Calendar
                  </button>
                </div>
              )}

              {selectedInternship.salary && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Compensation</h3>
                  <p className="text-gray-600">{selectedInternship.salary}</p>
                </div>
              )}

              {selectedInternship.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                  <p className="text-gray-600">{selectedInternship.description}</p>
                </div>
              )}

              {selectedInternship.skills && selectedInternship.skills.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInternship.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedInternship.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Notes</h3>
                  <p className="text-gray-600">{selectedInternship.notes}</p>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleEdit(selectedInternship);
                    setSelectedInternship(null);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Edit Application
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this application?')) {
                      handleDelete(selectedInternship.id);
                      setSelectedInternship(null);
                    }
                  }}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Companies Showcase */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dream Companies Await You
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform helps you organize applications to the world&apos;s leading tech companies
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'Google', domain: 'google.com', color: 'from-blue-400 to-green-400' },
              { name: 'Apple', domain: 'apple.com', color: 'from-gray-400 to-black' },
              { name: 'Microsoft', domain: 'microsoft.com', color: 'from-blue-400 to-blue-600' },
              { name: 'Amazon', domain: 'amazon.com', color: 'from-yellow-400 to-orange-500' },
              { name: 'Meta', domain: 'meta.com', color: 'from-blue-500 to-purple-600' },
              { name: 'Netflix', domain: 'netflix.com', color: 'from-red-600 to-red-800' },
              { name: 'Tesla', domain: 'tesla.com', color: 'from-gray-600 to-red-600' },
              { name: 'Spotify', domain: 'spotify.com', color: 'from-green-400 to-green-600' },
              { name: 'Uber', domain: 'uber.com', color: 'from-gray-900 to-gray-700' },
              { name: 'Airbnb', domain: 'airbnb.com', color: 'from-red-400 to-pink-500' },
              { name: 'LinkedIn', domain: 'linkedin.com', color: 'from-blue-600 to-blue-800' },
              { name: 'Twitter', domain: 'twitter.com', color: 'from-blue-400 to-blue-600' }
            ].map((company, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <img
                    src={`https://logo.clearbit.com/${company.domain}`}
                    alt={company.name}
                    className="w-16 h-16 mx-auto mb-3 object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0UwRTdGRiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM0MzM4Q0EiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj88L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                  <h4 className="text-center font-semibold text-gray-800">{company.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section with Video Background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="https://cdn.pixabay.com/video/2023/10/22/185994-876499806_large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Success Stories & Testimonials
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Join thousands of students who have successfully landed their dream internships
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                company: "Google",
                role: "Software Engineering Intern",
                quote: "InternTracker helped me organize my applications and land my dream internship at Google!",
                image: "👩‍💻"
              },
              {
                name: "Alex Kumar",
                company: "Microsoft",
                role: "Product Management Intern",
                quote: "The analytics feature helped me understand my application patterns and improve my success rate.",
                image: "👨‍💼"
              },
              {
                name: "Maria Rodriguez",
                company: "Meta",
                role: "UX Design Intern",
                quote: "I tracked 50+ applications and the status tracking feature was a game-changer for me!",
                image: "👩‍🎨"
              }
            ].map((story, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white animate-fade-in-up hover:bg-white/20 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{story.image}</div>
                <p className="text-lg mb-4 italic">&quot;{story.quote}&quot;</p>
                <div className="border-t border-white/20 pt-4">
                  <h4 className="font-bold">{story.name}</h4>
                  <p className="text-sm">{story.role} at {story.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Process Timeline */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Journey to Success
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow our proven process to maximize your internship success
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            {[
              {
                step: 1,
                title: "Create Your Profile",
                description: "Set up your account and start tracking applications",
                icon: "🚀",
                side: "left"
              },
              {
                step: 2,
                title: "Track Applications",
                description: "Add internship applications with all relevant details",
                icon: "📝",
                side: "right"
              },
              {
                step: 3,
                title: "Monitor Progress",
                description: "Update statuses and track your interview pipeline",
                icon: "📊",
                side: "left"
              },
              {
                step: 4,
                title: "Land Your Dream Role",
                description: "Celebrate your success and help others on their journey",
                icon: "🎉",
                side: "right"
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center mb-12 ${
                  item.side === 'right' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`w-1/2 ${
                    item.side === 'right' ? 'text-left pl-12' : 'text-right pr-12'
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`inline-block p-6 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                    item.side === 'right' ? 'ml-auto' : 'mr-auto'
                  }`}>
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Step {item.step}: {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        {/* Background Company Logos Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-6 gap-8 p-8">
            {[...Array(24)].map((_, i) => {
              const companies = ['google.com', 'apple.com', 'microsoft.com', 'amazon.com', 'meta.com', 'netflix.com'];
              const company = companies[i % companies.length];
              return (
                <div key={i} className="flex items-center justify-center">
                  <img
                    src={`https://logo.clearbit.com/${company}`}
                    alt=""
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">InternTracker Pro</h3>
            <p className="text-gray-400 mb-8">Your journey to the perfect internship starts here</p>
            
            {/* Partner Companies */}
            <div className="mb-8">
              <p className="text-gray-500 text-sm mb-4">Our users have successfully landed internships at:</p>
              <div className="flex justify-center items-center space-x-8 flex-wrap">
                {['google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'meta.com'].map((company) => (
                  <img
                    key={company}
                    src={`https://logo.clearbit.com/${company}`}
                    alt={company}
                    className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-500 text-sm mt-8">© 2024 InternTracker Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}