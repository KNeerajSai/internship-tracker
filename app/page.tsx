"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";

// Import amplify_outputs.json if it exists, otherwise use empty config
let outputs: Record<string, unknown> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  outputs = require("../amplify_outputs.json");
} catch {
  console.log("amplify_outputs.json not found - backend not deployed yet");
}
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
      // Check if backend is configured
      if (!outputs.aws_project_region) {
        console.log("Backend not deployed yet");
        setInternships([]);
        setLoading(false);
        return;
      }
      
      const { data } = await client.models.Internship.list();
      setInternships(data);
    } catch (error) {
      console.error("Error fetching internships:", error);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = async (internshipData: Record<string, unknown>) => {
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
            disabled={!outputs.aws_project_region}
            className={`px-4 py-2 rounded-lg ${
              outputs.aws_project_region 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
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

        {!outputs.aws_project_region ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Backend Not Deployed</h2>
              <p className="text-yellow-700 mb-4">The Amplify backend is still deploying. This usually takes 5-10 minutes.</p>
              <p className="text-sm text-yellow-600">The app will automatically connect once deployment is complete.</p>
            </div>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No internships added yet.</p>
            <p className="text-gray-400">Click &quot;Add Internship&quot; to get started!</p>
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
