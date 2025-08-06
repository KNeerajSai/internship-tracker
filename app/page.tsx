"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import InternshipCard from "./components/InternshipCard";
import AddInternshipForm from "./components/AddInternshipForm";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function Home() {
  const [internships, setInternships] = useState<Array<Schema["Internship"]["type"]>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const { data } = await client.models.Internship.list();
      setInternships(data);
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = async (internshipData: any) => {
    try {
      await client.models.Internship.create(internshipData);
      fetchInternships();
      setShowForm(false);
    } catch (error) {
      console.error("Error adding internship:", error);
    }
  };

  const handleDeleteInternship = async (id: string) => {
    try {
      await client.models.Internship.delete({ id });
      fetchInternships();
    } catch (error) {
      console.error("Error deleting internship:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading internships...</div>
      </div>
    );
  }

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
          <div className="mb-8">
            <AddInternshipForm
              onSubmit={handleAddInternship}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No internships added yet.</p>
            <p className="text-gray-400">Click "Add Internship" to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {internships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onDelete={handleDeleteInternship}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
