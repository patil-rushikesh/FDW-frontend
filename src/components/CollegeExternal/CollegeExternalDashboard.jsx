import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle, FileText, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Defines which faculty roles are eligible for review
const ALLOWED_ROLES = ["Professor", "Associate Professor", "Assistant Professor"];
// Defines which faculty designations are eligible for review
const ALLOWED_DESG = ["HOD", "Dean", "Professor"]; // Adjusted to be more inclusive

const CollegeExternalDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [externalId, setExternalId] = useState("");
  const [internalFacultyList, setInternalFacultyList] = useState([]);

  // Effect to get the logged-in external user's ID
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData && userData._id) {
        setExternalId(userData._id);
      } else {
        throw new Error("User not logged in or session expired");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Please log in again.");
      navigate('/login'); // Redirect to login if no user data
    }
  }, [navigate]);

  // Effect to fetch all necessary data once the externalId is known
  useEffect(() => {
    if (!externalId) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, marksResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_BASE_URL}/users`),
          fetch(`${import.meta.env.VITE_BASE_URL}/external_interaction_marks/${externalId}`)
        ]);

        if (!usersResponse.ok) throw new Error("Failed to fetch faculty list");
        if (!marksResponse.ok) throw new Error("Failed to fetch evaluation marks");

        const allUsers = await usersResponse.json();
        const marksData = await marksResponse.json();
        const allEvaluatedMarks = marksData.data || {};

        const eligibleFaculty = allUsers.filter(
          (user) => ALLOWED_ROLES.includes(user.role) && ALLOWED_DESG.includes(user.desg)
        );
        const getEvaluationStatus = async (facultyId, department) => {
          const res = await fetch(`${import.meta.env.VITE_BASE_URL}/getEvaluationStatus/${facultyId}/${department}`);
          if (res.ok) {
            const data = await res.json();
            return data.status || null;
          }
          return null;
        };
        const formattedFacultyPromises = eligibleFaculty.map(async (faculty) => {
          const externalMarks = allEvaluatedMarks[faculty._id] || null;
          const [evaluationStatus] = await Promise.all([
            getEvaluationStatus(faculty._id, faculty.dept)
          ]);
          return {
            id: faculty._id,
            name: faculty.name,
            department: faculty.dept,
            designation: faculty.desg,
            externalMarks: externalMarks,
            status: evaluationStatus
          };
        });
        const formattedFacultyList = await Promise.all(formattedFacultyPromises);
        setInternalFacultyList(formattedFacultyList);

      } catch (e) {
        setError(e.message);
        toast.error(e.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [externalId]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">External Reviewer Dashboard</h1>
          <p className="text-indigo-100 text-sm">Evaluate faculty members assigned for review.</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-500">Loading Faculty List...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto" />
              <p className="mt-2 font-semibold">An error occurred:</p>
              <p>{error}</p>
            </div>
          ) : internalFacultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No faculty members are currently available for review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {internalFacultyList
                .filter((faculty) => faculty.status === "Interaction_pending" || faculty.status === "done")
                .map((faculty) => (
                  <div key={faculty.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{faculty.name}</h3>
                        <p className="text-sm text-gray-600">
                          {faculty.designation} • {faculty.department}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {faculty.externalMarks ? (
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                              <CheckCircle size={16} className="mr-2" />
                              {/* --- CORRECTED DISPLAY: Access the .marks property --- */}
                              Evaluated: {faculty.externalMarks.marks} / 100
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              /* --- CORRECTED NAVIGATION: Route to an external-specific page --- */
                              navigate(`/evaluate-authority/${faculty.id}`, {
                                state: { faculty: faculty },
                              })
                            }
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            title="Evaluate faculty"
                          >
                            <FileText size={16} />
                            <span>Evaluate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeExternalDashboard;