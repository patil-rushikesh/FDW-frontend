import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

const ALLOWED_ROLES = ["Professor", "Associate Professor", "Assistant Professor"];

const AssignExternal = () => {
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users`);
        if (!res.ok) throw new Error("Failed to fetch faculty data");
        const data = await res.json();
        const filtered = data.filter(
          (f) =>
            (f.desg === "HOD" || f.desg === "Dean") && ALLOWED_ROLES.includes(f.role)
        );
        const facultyPromises = filtered.map(async (f) => {
          const [evaluationStatus, directorMarks] = await Promise.all([
            getEvaluationStatus(f._id, f.dept),
            f.isDirectorMarksGiven ? getDirectorMarks(f._id) : Promise.resolve(null)
          ]);
          return {
            id: f._id,
            name: f.name,
            department: f.dept,
            designation: f.desg,
            role: f.role,
            status: evaluationStatus,
            isDirectorMarksGiven: f.isDirectorMarksGiven || false,
            directorMarks: directorMarks
          };
        });
        const formatted = await Promise.all(facultyPromises);
        setInternalFacultyList(formatted);
      } catch (e) {
        toast.error("Failed to load faculty list");
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  const getDirectorMarks = async (facultyId) => {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/director_interaction_marks/${facultyId}`);
    if (res.ok) {
      const data = await res.json();
      return data.marks.director_marks || null;
    }
    return null;
  };
  const getEvaluationStatus = async (facultyId, department) => {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/getEvaluationStatus/${facultyId}/${department}`);
    if (res.ok) {
      const data = await res.json();
      return data.status || null;
    }
    return null;
  };


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Assign External to Faculties</h1>
          <p className="text-indigo-100 text-sm">Manage External assignments for each faculty</p>
        </div>

        <div className="p-6">
          {loading && internalFacultyList.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-500">Loading faculty List...</p>
            </div>
          ) : internalFacultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No faculty members available. Please add internal faculty first.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {internalFacultyList
                .filter((internal) => internal.status === "Interaction_pending" || internal.status === "done")
                .map((internal) => {
                  return (
                    <div
                      key={internal.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Internal Faculty Header */}
                      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{internal.name}</h3>
                          <p className="text-sm text-gray-600">
                            {internal.designation} • {internal.department}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          {internal.isDirectorMarksGiven ? (
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                <CheckCircle size={14} className="mr-1" />
                                Marks : {internal.directorMarks} / 100
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                navigate(`/director-evaluate/${internal.id}`, {
                                  state: { faculty: internal, department: internal.department },
                                })
                              }
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2 transition-colors"
                              title="Evaluate faculty"
                            >
                              <FileText size={16} />
                              <span>Evaluate</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AssignExternal;
