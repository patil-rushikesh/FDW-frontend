import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  X,
  Plus,
  UserPlus,
  UserCheck,
  Search,
  Users,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const ALLOWED_ROLES = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
];

const AssignFacultyToExternal = () => {
  const [externalFacultyList, setExternalFacultyList] = useState([]);
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedExternal, setSelectedExternal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDept, setUserDept] = useState("");

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load external faculty
    const savedExternalFaculty = localStorage.getItem("externalFaculty");
    if (savedExternalFaculty) {
      try {
        setExternalFacultyList(JSON.parse(savedExternalFaculty));
      } catch (error) {
        console.error("Error parsing external faculty data:", error);
      }
    }

    // Load existing assignments
    const savedAssignments = localStorage.getItem("facultyAssignments");
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error("Error parsing assignments data:", error);
      }
    }
  }, []);

  // Get user data and department
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log("User data from localStorage:", userData); // Debug log
    if (userData) {
      setUserDept(userData.dept);
      console.log("Set user department:", userData.dept); // Debug log
    }
  }, []);

  // Fetch faculty list using the same API as VerificationPanel
  useEffect(() => {
    const fetchFaculties = async () => {
      if (!userDept) {
        console.log("No user department found");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/users");
        if (!response.ok) throw new Error("Failed to fetch faculty data");

        const data = await response.json();
        console.log("Fetched data:", data); // Debug log

        // Filter faculties by department and allowed roles
        const departmentFaculties = data.filter(
          (faculty) =>
            faculty.dept === userDept &&
            faculty.role !== "HOD" &&
            ALLOWED_ROLES.includes(faculty.role)
        );
        console.log("Filtered faculties:", departmentFaculties); // Debug log

        // Transform the data to match your component's structure
        const formattedFaculties = departmentFaculties.map((faculty) => ({
          id: faculty._id,
          name: faculty.name,
          department: faculty.dept,
          employeeId: faculty.empId, // Update this line to match your API field name
          role: faculty.role,
        }));
        console.log("Formatted faculties:", formattedFaculties); // Debug log

        setInternalFacultyList(formattedFaculties);
      } catch (err) {
        console.error("Error loading faculty data:", err);
        toast.error("Failed to load faculty list");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [userDept]);

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("facultyAssignments", JSON.stringify(assignments));
  }, [assignments]);

  const openAssignModal = (externalFaculty) => {
    setSelectedExternal(externalFaculty);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedExternal(null);
    setSearchQuery("");
  };

  const handleAssignFaculty = (internalFacultyId) => {
    if (!selectedExternal) return;

    const externalId = selectedExternal.id;

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setAssignments((prev) => {
        // Initialize if not exists
        const currentAssignments = prev[externalId] || [];

        // Check if already assigned
        if (currentAssignments.includes(internalFacultyId)) {
          toast.error("This faculty is already assigned");
          setLoading(false);
          return prev;
        }

        // Add to assignments
        const newAssignments = {
          ...prev,
          [externalId]: [...currentAssignments, internalFacultyId],
        };

        toast.success("Faculty assigned successfully");
        setLoading(false);
        return newAssignments;
      });
    }, 500);
  };

  const handleRemoveFaculty = (externalId, internalFacultyId) => {
    setAssignments((prev) => {
      const currentAssignments = prev[externalId] || [];
      return {
        ...prev,
        [externalId]: currentAssignments.filter(
          (id) => id !== internalFacultyId
        ),
      };
    });
    toast.success("Faculty removed from assignment");
  };

  // Filter internal faculty based on search query
  const filteredInternalFaculty = internalFacultyList.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the assigned faculty details for an external faculty
  const getAssignedFacultyDetails = (externalId) => {
    const assignedIds = assignments[externalId] || [];
    return internalFacultyList.filter((faculty) =>
      assignedIds.includes(faculty.id)
    );
  };

  // Add this helper function after your existing helper functions
  const isFacultyAssignedToAnyExternal = (facultyId) => {
    // Check if faculty is assigned to any external reviewer
    return Object.values(assignments).some((assignedFaculties) =>
      assignedFaculties.includes(facultyId)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">
            Assign Faculty to External Reviewers
          </h1>
          <p className="text-indigo-100 text-sm">
            Manage which faculty members are assigned to each external reviewer
          </p>
        </div>

        <div className="p-6">
          {externalFacultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                No external faculty members available. Please add external
                faculty first.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {externalFacultyList.map((external) => {
                const assignedFaculty = getAssignedFacultyDetails(external.id);

                return (
                  <div
                    key={external.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* External Faculty Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {external.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {external.designation} •{" "}
                          {external.organization || "Not specified"}
                        </p>
                      </div>
                      <button
                        onClick={() => openAssignModal(external)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                      >
                        <UserPlus size={16} />
                        <span>Assign Faculty</span>
                      </button>
                    </div>

                    {/* Assigned Faculty List */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Assigned Faculty Members
                      </h4>
                      {assignedFaculty.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">
                          No faculty members assigned yet
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {assignedFaculty.map((faculty) => (
                            <li
                              key={faculty.id}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center">
                                <User
                                  size={16}
                                  className="text-gray-500 mr-2"
                                />
                                <span className="text-gray-800">
                                  {faculty.name}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                  ({faculty.department})
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveFaculty(external.id, faculty.id)
                                }
                                className="text-red-600 hover:text-red-800"
                                title="Remove assignment"
                              >
                                <X size={16} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {modalOpen && selectedExternal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Assign Faculty to {selectedExternal.name}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {selectedExternal.designation} at{" "}
                  {selectedExternal.organization || "Not specified"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-indigo-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Faculty Selection Table */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-4">
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute top-2.5 left-3 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search faculty by name or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Selected Faculties Section */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Allocated Faculties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(assignments[selectedExternal.id] || []).length > 0 ? (
                      assignments[selectedExternal.id].map((facultyId) => {
                        const faculty = internalFacultyList.find(
                          (f) => f.id === facultyId
                        );
                        return (
                          <span
                            key={facultyId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {faculty?.name} ({faculty?.department})
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        No faculties allocated yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Faculty Table */}
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw
                      className="animate-spin text-blue-600"
                      size={24}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-gray-600">Select</th>
                          <th className="px-6 py-3 text-gray-600">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-gray-600">Name</th>
                          <th className="px-6 py-3 text-gray-600">
                            Department
                          </th>
                          <th className="px-6 py-3 text-gray-600">Role</th>
                          <th className="px-6 py-3 text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInternalFaculty.map((faculty) => {
                          const isAssigned = (
                            assignments[selectedExternal.id] || []
                          ).includes(faculty.id);
                          const isAssignedToOther =
                            !isAssigned &&
                            isFacultyAssignedToAnyExternal(faculty.id);

                          return (
                            <tr
                              key={faculty.id}
                              className={`border-b ${
                                isAssigned || isAssignedToOther
                                  ? "bg-gray-50 opacity-60"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() =>
                                    handleAssignFaculty(faculty.id)
                                  }
                                  disabled={loading || isAssignedToOther}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                                />
                              </td>
                              <td className="px-6 py-4">
                                {faculty.employeeId || faculty.empId || faculty.id || "N/A"}{" "}
                                {/* Add fallback options */}
                              </td>
                              <td className="px-6 py-4 font-medium">
                                {faculty.name}
                              </td>
                              <td className="px-6 py-4">
                                {faculty.department}
                              </td>
                              <td className="px-6 py-4">{faculty.role}</td>
                              <td className="px-6 py-4">
                                {isAssigned ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Assigned
                                  </span>
                                ) : isAssignedToOther ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Assigned to Other
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignFacultyToExternal;
