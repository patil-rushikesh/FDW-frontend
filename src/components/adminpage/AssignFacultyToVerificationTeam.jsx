import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Save,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar"; // Import AdminSidebar component
import Navbar from "../layout/Navbar"; // Import Navbar component

const AssignFacultyToVerificationTeam = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [committeeData, setCommitteeData] = useState({});
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFaculties, setSelectedFaculties] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add state for sidebar
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const navigate = useNavigate();

  const departments = [
    "Computer",
    "IT",
    "Mechanical",
    "Civil",
    "ENTC",
    "Computer(Regional)",
    "AIML",
    "ASH",
  ];

  // Fetch committee data when department changes
  useEffect(() => {
    const fetchCommitteeData = async () => {
      if (!selectedDepartment) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost:5000/${selectedDepartment}/verification-committee`
        );
        if (!response.ok) throw new Error("Failed to fetch committee data");

        const data = await response.json();
        setCommitteeData(data);

        // Initialize selectedFaculties with empty arrays for each committee member
        const initialSelection = {};
        Object.keys(data.committees).forEach((member) => {
          initialSelection[member] = data.committees[member] || [];
        });
        setSelectedFaculties(initialSelection);
      } catch (err) {
        setError("Error loading committee data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDepartment) {
      fetchCommitteeData();
    }
  }, [selectedDepartment]);

  // Define allowed roles
  const ALLOWED_ROLES = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
  ];

  // Fetch faculty list when department changes
  useEffect(() => {
    const fetchFaculties = async () => {
      if (!selectedDepartment) return;

      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/users");
        if (!response.ok) throw new Error("Failed to fetch faculty data");

        const data = await response.json();
        // Filter faculties by department
        const departmentFaculties = data.filter(
          (faculty) =>
            faculty.dept === selectedDepartment &&
            faculty.role !== "HOD" &&
            ALLOWED_ROLES.includes(faculty.role)
        );
        setFacultyList(departmentFaculties);
      } catch (err) {
        setError("Error loading faculty data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDepartment) {
      fetchFaculties();
    }
  }, [selectedDepartment]);

  // Handle faculty selection
  const handleFacultySelection = (committeeMember, facultyId) => {
    setSelectedFaculties((prev) => {
      const updatedSelection = { ...prev };

      // Check if faculty is already selected for this committee member
      if (updatedSelection[committeeMember].includes(facultyId)) {
        // Remove faculty from selection
        updatedSelection[committeeMember] = updatedSelection[
          committeeMember
        ].filter((id) => id !== facultyId);
      } else {
        // Add faculty to selection
        updatedSelection[committeeMember] = [
          ...updatedSelection[committeeMember],
          facultyId,
        ];
      }

      return updatedSelection;
    });
  };

  // Add this handler function after the existing handler functions in your component
const handleSelectAll = (member) => {
  setSelectedFaculties((prev) => {
    const updatedSelection = { ...prev };
    
    // Get all eligible faculty IDs (ones that aren't already allocated elsewhere)
    const eligibleFacultyIds = facultyList
      .filter(faculty => 
        faculty._id !== extractFacultyId(member) && 
        !isFacultyAllocated(faculty._id, member)
      )
      .map(faculty => faculty._id);
    
    // If all eligible faculties are already selected, deselect all
    const allSelected = eligibleFacultyIds.every(id => 
      updatedSelection[member].includes(id)
    );
    
    if (allSelected) {
      // Deselect all
      updatedSelection[member] = [];
    } else {
      // Select all eligible faculties
      updatedSelection[member] = eligibleFacultyIds;
    }
    
    return updatedSelection;
  });
};

// Then modify the table header to add the "Select All" checkbox:

  // Handle submission of faculty allocation
  const handleSubmit = async () => {
    if (!selectedDepartment) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `http://localhost:5000/${selectedDepartment}/verification-committee/addfaculties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedFaculties),
        }
      );

      if (!response.ok) throw new Error("Failed to allocate faculties");

      // Show success dialog instead of navigating
      setSuccessMessage("Faculty allocation has been successfully completed!");
      setShowSuccessDialog(true);
    } catch (err) {
      setError("Failed to allocate faculties: " + err.message);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get faculty name by ID
  const getFacultyNameById = (facultyId) => {
    const faculty = facultyList.find((f) => f._id === facultyId);
    return faculty ? faculty.name : facultyId;
  };

  // Helper function to extract faculty ID from committee member string
  const extractFacultyId = (committeeMember) => {
    const match = committeeMember.match(/^(\S+)/);
    return match ? match[1] : "";
  };

  // Helper function to check if faculty is allocated
  const isFacultyAllocated = (facultyId, currentMember) => {
    // Check if faculty is allocated to any committee member (including current)
    return Object.entries(selectedFaculties).some(([member, faculties]) => {
      // If this is the current member's row and the faculty is selected for this member,
      // don't count it as allocated
      if (member === currentMember && faculties.includes(facultyId)) {
        return false;
      }
      // For all other cases, if the faculty is in any allocation list, consider it allocated
      return faculties.includes(facultyId);
    });
  };

  return (
    <div className="ml-3 min-h-screen bg-gray-50">
      {/* Add AdminSidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-64">
        {" "}
        {/* Add margin for sidebar */}
        {/* Add Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Header Section */}
              <div className="border-b border-gray-200 px-4 lg:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Assign Faculty to Verification Committee
                    </h2>
                  </div>
                </div>
              </div>

              {/* Department Selection */}
              <div className="p-6 border-b border-gray-200">
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Department
                </label>
                <div className="relative">
                  <select
                    id="department"
                    name="department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {!selectedDepartment && (
                <div className="p-8 text-center text-gray-500">
                  Please select a department to view verification committee
                  details
                </div>
              )}

              {selectedDepartment && loading && (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="animate-spin text-blue-600" size={48} />
                </div>
              )}

              {selectedDepartment && error && (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg m-6">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {successMessage}
                </div>
              )}

              {/* Committee Members Section - Only show when department is selected and data is loaded */}
              {selectedDepartment &&
                !loading &&
                !error &&
                committeeData.committees && (
                  <div className="p-4 lg:p-6 space-y-8">
                    {Object.keys(committeeData.committees).map((member) => (
                      <div
                        key={member}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Committee Member Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h3 className="font-medium text-gray-800">
                            {member}
                          </h3>
                        </div>

                        {/* Selected Faculties Section */}
                        <div className="p-4 bg-blue-50 border-b">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Allocated Faculties
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedFaculties[member]?.length > 0 ? (
                              selectedFaculties[member].map((facultyId) => (
                                <span
                                  key={facultyId}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {facultyId} ({getFacultyNameById(facultyId)})
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm italic">
                                No faculties allocated yet
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Faculty Selection Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-gray-600">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      onChange={() => handleSelectAll(member)}
                                      checked={facultyList
                                        .filter(
                                          (faculty) =>
                                            faculty._id !==
                                              extractFacultyId(member) &&
                                            !isFacultyAllocated(
                                              faculty._id,
                                              member
                                            )
                                        )
                                        .every((faculty) =>
                                          selectedFaculties[member]?.includes(
                                            faculty._id
                                          )
                                        )}
                                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Select All</span>
                                  </div>
                                </th>
                                <th className="px-6 py-3 text-gray-600">ID</th>
                                <th className="px-6 py-3 text-gray-600">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-gray-600">
                                  Designation
                                </th>
                                <th className="px-6 py-3 text-gray-600">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {facultyList
                                .filter(
                                  (faculty) =>
                                    faculty._id !== extractFacultyId(member)
                                )
                                .map((faculty) => {
                                  const isAllocated = isFacultyAllocated(
                                    faculty._id,
                                    member
                                  );
                                  return (
                                    <tr
                                      key={faculty._id}
                                      className={`border-b ${
                                        isAllocated
                                          ? "bg-gray-50 opacity-60"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <td className="px-6 py-4">
                                        <input
                                          type="checkbox"
                                          checked={selectedFaculties[
                                            member
                                          ]?.includes(faculty._id)}
                                          onChange={() =>
                                            handleFacultySelection(
                                              member,
                                              faculty._id
                                            )
                                          }
                                          disabled={isAllocated}
                                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                                        />
                                      </td>
                                      <td className="px-6 py-4">
                                        {faculty._id}
                                      </td>
                                      <td className="px-6 py-4 font-medium">
                                        {faculty.name}
                                      </td>
                                      <td className="px-6 py-4">
                                        {faculty.role}
                                      </td>
                                      <td className="px-6 py-4">
                                        {isAllocated && (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Already Allocated
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {/* Submit Button */}
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedDepartment}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-5 w-5" />
                            Save Allocation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4">
                <Check
                  className="text-green-600 mx-auto mb-4"
                  size={36}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Success
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {successMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setSuccessMessage("");
                    // Optionally reset the form or data
                    setSelectedFaculties({});
                    setSelectedDepartment("");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignFacultyToVerificationTeam;
