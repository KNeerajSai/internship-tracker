"use client";

import { useState, useEffect } from "react";

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
}

export default function Home() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    status: "applied",
    applicationDate: "",
    salary: "",
    notes: ""
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('internships');
    if (saved) {
      setInternships(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever internships change
  useEffect(() => {
    localStorage.setItem('internships', JSON.stringify(internships));
  }, [internships]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing internship
      setInternships(internships.map(internship => 
        internship.id === editingId 
          ? { ...internship, ...formData }
          : internship
      ));
      setEditingId(null);
    } else {
      // Create new internship
      const newInternship: Internship = {
        id: Date.now().toString(),
        ...formData,
        dateAdded: new Date().toISOString()
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
      notes: ""
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
      notes: internship.notes || ""
    });
    setEditingId(internship.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this internship?")) {
      setInternships(internships.filter(internship => internship.id !== id));
    }
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
    applied: "bg-yellow-100 text-yellow-800 border-yellow-200",
    interview: "bg-blue-100 text-blue-800 border-blue-200",
    offer: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    accepted: "bg-purple-100 text-purple-800 border-purple-200"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Internship Tracker
              </h1>
              <p className="text-gray-600 mt-2">Track your internship applications with style</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📊 Stats
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ➕ Add Internship
              </button>
              <button
                onClick={exportData}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📤 Export
              </button>
              <label className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer">
                📥 Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-slide-down">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📈 Application Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="text-2xl font-bold text-gray-800">{value}</div>
                  <div className="text-sm text-gray-600 capitalize">{key}</div>
                  {key !== 'total' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          key === 'applied' ? 'bg-yellow-400' :
                          key === 'interview' ? 'bg-blue-400' :
                          key === 'offer' ? 'bg-green-400' :
                          key === 'rejected' ? 'bg-red-400' : 'bg-purple-400'
                        }`}
                        style={{ width: `${stats.total > 0 ? (value / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="dateAdded">Date Added</option>
              <option value="company">Company</option>
              <option value="status">Status</option>
            </select>

            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 p-3 transition-all duration-300 ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-50 hover:bg-gray-100"}`}
              >
                🔲 Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 p-3 transition-all duration-300 ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-50 hover:bg-gray-100"}`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {editingId ? "✏️ Edit Internship" : "➕ Add New Internship"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                      🏢 Company *
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                      💼 Position *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter position title"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                      📍 Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                      📊 Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                      📅 Application Date
                    </label>
                    <input
                      type="date"
                      value={formData.applicationDate}
                      onChange={(e) => setFormData({...formData, applicationDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                      💰 Salary
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      placeholder="e.g., $60,000/year or $30/hour"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-blue-600">
                    📝 Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                    placeholder="Add any additional notes..."
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {editingId ? "Update" : "Add"} Internship
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Cards Section */}
        {filteredInternships.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No internships found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filters" 
                : "Click 'Add Internship' to get started!"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ➕ Add Your First Internship
              </button>
            )}
          </div>
        ) : (
          <div className={`${viewMode === "grid" 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-4"} animate-fade-in`}>
            {filteredInternships.map((internship, index) => (
              <div 
                key={internship.id} 
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                  viewMode === "grid" ? "p-6" : "p-4 flex items-center gap-4"
                } animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{internship.company}</h3>
                        <p className="text-gray-600 font-medium">{internship.position}</p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(internship)}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(internship.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {internship.location && (
                      <p className="text-sm text-gray-500 mb-3 flex items-center">
                        📍 {internship.location}
                      </p>
                    )}

                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        statusColors[internship.status as keyof typeof statusColors] || statusColors.applied
                      } transition-all duration-300 hover:scale-105`}>
                        {internship.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {internship.applicationDate && (
                        <p className="flex items-center">
                          <span className="font-semibold">📅 Applied:</span>
                          <span className="ml-2">{new Date(internship.applicationDate).toLocaleDateString()}</span>
                        </p>
                      )}
                      
                      {internship.salary && (
                        <p className="flex items-center">
                          <span className="font-semibold">💰 Salary:</span>
                          <span className="ml-2">{internship.salary}</span>
                        </p>
                      )}
                    </div>

                    {internship.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700 line-clamp-3">{internship.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  // List View
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{internship.company}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          statusColors[internship.status as keyof typeof statusColors] || statusColors.applied
                        }`}>
                          {internship.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{internship.position}</p>
                      {internship.location && (
                        <p className="text-sm text-gray-500">📍 {internship.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {internship.applicationDate && (
                        <span className="text-sm text-gray-500">
                          {new Date(internship.applicationDate).toLocaleDateString()}
                        </span>
                      )}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(internship)}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(internship.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
