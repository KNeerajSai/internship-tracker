"use client";

import { useState } from "react";

interface Internship {
  id: string;
  company: string;
  position: string;
  status: string;
  location?: string;
  applicationDate?: string;
  salary?: string;
  notes?: string;
}

export default function Home() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    status: "applied",
    applicationDate: "",
    salary: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInternship: Internship = {
      id: Date.now().toString(),
      ...formData
    };
    setInternships([...internships, newInternship]);
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
  };

  const handleDelete = (id: string) => {
    setInternships(internships.filter(internship => internship.id !== id));
  };

  const statusColors = {
    applied: "bg-yellow-100 text-yellow-800",
    interview: "bg-blue-100 text-blue-800",
    offer: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    accepted: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Internship Tracker</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Internship
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Internship</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({...formData, applicationDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g., $60,000/year"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Internship
                </button>
              </div>
            </form>
          </div>
        )}

        {internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No internships added yet.</p>
            <p className="text-gray-400">Click &quot;Add Internship&quot; to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {internships.map((internship) => (
              <div key={internship.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{internship.company}</h3>
                    <p className="text-gray-600">{internship.position}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(internship.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>

                {internship.location && (
                  <p className="text-sm text-gray-500 mb-2">📍 {internship.location}</p>
                )}

                <div className="mb-4">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[internship.status as keyof typeof statusColors] || statusColors.applied
                    }`}
                  >
                    {internship.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {internship.applicationDate && (
                    <p>
                      <strong>Applied:</strong> {new Date(internship.applicationDate).toLocaleDateString()}
                    </p>
                  )}
                  
                  {internship.salary && (
                    <p>
                      <strong>Salary:</strong> {internship.salary}
                    </p>
                  )}
                </div>

                {internship.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{internship.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
