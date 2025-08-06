import type { Schema } from "../../amplify/data/resource";

interface InternshipCardProps {
  internship: Schema["Internship"]["type"];
  onDelete: (id: string) => void;
}

const statusColors = {
  applied: "bg-yellow-100 text-yellow-800",
  interview: "bg-blue-100 text-blue-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-purple-100 text-purple-800",
};

export default function InternshipCard({ internship, onDelete }: InternshipCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{internship.company}</h3>
          <p className="text-gray-600">{internship.position}</p>
        </div>
        <button
          onClick={() => internship.id && onDelete(internship.id)}
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
            statusColors[internship.status as keyof typeof statusColors]
          }`}
        >
          {internship.status?.toUpperCase()}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Applied:</strong> {formatDate(internship.applicationDate)}
        </p>
        
        {internship.salary && (
          <p>
            <strong>Salary:</strong> {internship.salary}
          </p>
        )}

        {internship.contactEmail && (
          <p>
            <strong>Contact:</strong> 
            <a 
              href={`mailto:${internship.contactEmail}`}
              className="text-blue-600 hover:underline ml-1"
            >
              {internship.contactEmail}
            </a>
          </p>
        )}

        {internship.applicationUrl && (
          <p>
            <strong>Application:</strong> 
            <a 
              href={internship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              View Link
            </a>
          </p>
        )}
      </div>

      {internship.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">{internship.description}</p>
        </div>
      )}

      {internship.notes && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 italic">Notes: {internship.notes}</p>
        </div>
      )}
    </div>
  );
}