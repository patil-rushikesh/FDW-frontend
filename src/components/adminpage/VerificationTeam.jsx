import React, { useState, useEffect } from "react";
import { Users, Plus, Check, Trash2, RefreshCw, Edit2 } from "lucide-react";

const VerificationTeam = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [committeeIds, setCommitteeIds] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allFaculty, setAllFaculty] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [verificationTeams, setVerificationTeams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletedVerifiers, setDeletedVerifiers] = useState([]);

  const departments = [
    "Computer",
    "IT",
    "Mechanical",
    "Civil",
    "ENTC",
    "Computer(Regional)",
    "AIML",
    "ASH"
  ];

  // Fetch all faculty data when component mounts
  useEffect(() => {
    fetchFacultyData();
    fetchAllVerificationTeams();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      setAllFaculty(data);
    } catch (err) {
      setError('Error loading faculty data: ' + err.message);
    }
  };

  const fetchAllVerificationTeams = async () => {
    setIsLoading(true);
    try {
      const teamsData = {};
      
      // Fetch verification committee for each department
      const promises = departments.map(async (department) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${department}/verification-committee`);
          if (response.ok) {
            const data = await response.json();
            teamsData[department] = data;
          }
        } catch (error) {
          console.error(`Error fetching ${department} verification team:`, error);
        }
      });
      
      await Promise.all(promises);
      setVerificationTeams(teamsData);
    } catch (err) {
      setError('Error loading verification teams: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMore = () => {
    setCommitteeIds([...committeeIds, ""]);
    setSuggestions([]);
  };

  const handleCommitteeIdChange = (index, value) => {
    const newCommitteeIds = [...committeeIds];
    newCommitteeIds[index] = value;
    setCommitteeIds(newCommitteeIds);
    setActiveInputIndex(index);

    // Filter suggestions based on input and department
    if (value.trim() && selectedDepartment) {
      const filtered = allFaculty
        .filter(faculty => 
          // Filter by ID or name containing input value
          (faculty._id.toLowerCase().includes(value.toLowerCase()) ||
           faculty.name.toLowerCase().includes(value.toLowerCase())) &&
          // Exclude faculty from selected department
          faculty.dept !== selectedDepartment &&
          // Exclude already selected IDs
          !committeeIds.includes(faculty._id)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (index, faculty) => {
    const newCommitteeIds = [...committeeIds];
    newCommitteeIds[index] = faculty._id;
    setCommitteeIds(newCommitteeIds);
    setSuggestions([]);
  };

  const handleRemoveFaculty = (index) => {
    const newCommitteeIds = committeeIds.filter((_, i) => i !== index);
    setCommitteeIds(newCommitteeIds);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      setError(null);
  
      // Fix: Remove the process.env access and use a direct URL instead
      // Replace with your actual API base URL
      const baseUrl = `${import.meta.env.VITE_BASE_URL}`; // or your production API URL
      const url = `${baseUrl}/${selectedDepartment}/verification-committee`;
      
      // Add a force=true parameter when editing to ensure changes are detected
      const queryParams = editingDepartment ? '?force=true' : '';
      
      console.log("Submitting committee IDs:", committeeIds);
      if (deletedVerifiers.length > 0) {
        console.log("Deleted verifiers:", deletedVerifiers);
      }
      
      const response = await fetch(`${url}${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          committee_ids: committeeIds,
          deleted_verifiers: deletedVerifiers // Send the list of deleted verifiers
        }),
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create verification committee');
      }
  
      setSuccessMessage(`Verification committee ${editingDepartment ? 'updated' : 'created'} successfully!`);
      setShowSuccessDialog(true);
      
      // Clean up state
      if (!editingDepartment) {
        setSelectedDepartment('');
      }
      setCommitteeIds(['']);
      setDeletedVerifiers([]);  // Clear deleted verifiers after successful submission
      fetchAllVerificationTeams(); // Refresh teams after submit
  
    } catch (error) {
      console.error('Error creating verification committee:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  // Helper function to get faculty name by ID
  const getFacultyName = (id) => {
    const faculty = allFaculty.find(f => f._id === id);
    return faculty ? faculty.name : id;
  };

// Function to start editing a department's committee
const handleEditTeam = (department) => {
  const teamData = verificationTeams[department];
  if (teamData && teamData.committees) {
    try {
      // Extract just the faculty IDs from the verifier keys
      const committeeIdsToEdit = Object.keys(teamData.committees).map(key => {
        // The key format is usually "23TAIML0173 (Aditya Mashere)"
        // We need to extract only the ID part (before the space or parenthesis)
        const idPart = key.split(' ')[0];
        return idPart;
      });
      
      setSelectedDepartment(department);
      setCommitteeIds(committeeIdsToEdit.length > 0 ? committeeIdsToEdit : [""]);
      setEditingDepartment(department);
      setDeletedVerifiers([]); // Reset the deleted verifiers list when starting edit
      
      // Scroll to the form section
      const formElement = document.querySelector('.allocate-committee-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error preparing team for editing:", error);
      setError("Failed to load committee data for editing.");
    }
  }
};

// Handle verifier deletion by tracking the deleted IDs
// Handle verifier deletion by tracking the deleted IDs
const handleDeleteVerifier = (indexToDelete) => {
  const deletedId = committeeIds[indexToDelete];
  
  // Only add to deletedVerifiers if it's a non-empty ID
  if (deletedId && deletedId.trim() !== "") {
    setDeletedVerifiers(prev => {
      // Check if ID is already in deleted list to avoid duplicates
      if (!prev.includes(deletedId)) {
        return [...prev, deletedId];
      }
      return prev;
    });
    
    console.log(`Deleted verifier at index ${indexToDelete}, ID: ${deletedId}`);
  }
  
  // Remove from the current IDs list
  setCommitteeIds(committeeIds.filter((_, index) => index !== indexToDelete));
};
  // Add cancel editing function
  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setSelectedDepartment("");
    setCommitteeIds([""]);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Form to allocate verification committee */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 allocate-committee-form">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {editingDepartment ? `Edit ${editingDepartment} Verification Committee` : "Allocate Verification Committee"}
                  </h2>
                </div>
                {editingDepartment && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6 max-w-2xl">
                  {/* Department Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setSuggestions([]);
                      }}
                      required
                      disabled={editingDepartment !== null}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {selectedDepartment && (
                      <p className="text-sm text-gray-600 mt-1">
                        Note: You can only select verification committee members from departments other than {selectedDepartment}
                      </p>
                    )}
                  </div>

                  {/* Committee Head IDs */}
                  <div className="space-y-4">
                    {committeeIds.map((id, index) => (
                      <div key={index} className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={id}
                            onChange={(e) => handleCommitteeIdChange(index, e.target.value)}
                            placeholder="Enter faculty ID or name"
                            required
                            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {(committeeIds.length > 1 || editingDepartment) && (
                            <button
                              type="button"
                              onClick={() => editingDepartment ? handleDeleteVerifier(index) : handleRemoveFaculty(index)}
                              className="p-2.5 text-red-600 hover:text-red-700"
                              title="Remove committee head"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                        
                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && activeInputIndex === index && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {suggestions.map((faculty, i) => (
                              <div
                                key={faculty._id}
                                onClick={() => handleSuggestionClick(index, faculty)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-medium">{faculty._id}</span>
                                  <span className="text-gray-600 ml-2">({faculty.name})</span>
                                </div>
                                <span className="text-gray-500 text-sm">{faculty.dept}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleAddMore}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center text-sm font-medium"
                    >
                      <Plus className="mr-2" size={18} />
                      Add Another Head
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? "Processing..." : editingDepartment ? "Update Committee" : "Save Committee"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Display Verification Teams */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Current Verification Committees
                  </h2>
                </div>
                <button 
                  onClick={fetchAllVerificationTeams}
                  className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  <RefreshCw size={16} className="mr-1" />
                  <span className="text-sm">Refresh</span>
                </button>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {departments.map(department => {
                      const teamData = verificationTeams[department];
                      return (
                        <div key={department} className="border border-gray-200 rounded-lg">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-md font-medium text-gray-800">{department}</h3>
                            {teamData && teamData.committees && Object.keys(teamData.committees).length > 0 && (
                              <button 
                                onClick={() => handleEditTeam(department)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                                title="Edit committee"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                          </div>
                          <div className="p-4">
                            {!teamData ? (
                              <p className="text-gray-600 text-sm italic">No verification committee assigned</p>
                            ) : teamData.committees && Object.keys(teamData.committees).length > 0 ? (
                              <ul className="space-y-4">
                                {Object.entries(teamData.committees).map(([verifier, verifiees], index) => {
                                  // Split verifier into ID and name parts
                                  // Handle format "23TAIML0173 (Aditya Mashere)"
                                  let verifierId = verifier;
                                  let verifierName = "";
                                  
                                  // Check if the verifier string contains parentheses
                                  const parenthesesMatch = verifier.match(/^(.*?)\s*\((.*?)\)$/);
                                  if (parenthesesMatch) {
                                    verifierId = parenthesesMatch[1].trim();
                                    verifierName = parenthesesMatch[2].trim();
                                  }
                                  
                                  return (
                                    <li key={index} className="pb-3 border-b border-gray-100 last:border-0">
                                      <div className="flex items-center gap-2 text-sm mb-1">
                                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                                          {index + 1}
                                        </span>
                                        <div>
                                          {verifierName ? (
                                            <>
                                              <span className="font-medium">{verifierName}</span>
                                              <span className="text-gray-500 text-xs ml-2">({verifierId})</span>
                                            </>
                                          ) : (
                                            <span className="font-medium">{verifierId}</span>
                                          )}
                                        </div>
                                      </div>
                                      {Array.isArray(verifiees) && verifiees.length > 0 ? (
                                        <div className="ml-8 mt-2">
                                          <span className="text-xs font-medium text-gray-500 block mb-1">Assigned Faculty:</span>
                                          <ul className="space-y-1">
                                            {verifiees.map((faculty, idx) => (
                                              <li key={idx} className="text-xs text-gray-600 flex items-center">
                                                <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs mr-2">
                                                  {idx + 1}
                                                </span>
                                                {faculty}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ) : (
                                        <div className="ml-8 mt-1">
                                          <span className="text-xs text-gray-500 italic">No faculty assigned yet</span>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <p className="text-gray-600 text-sm italic">No verification committee assigned</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Success Dialog */}
            {showSuccessDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                  <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4">
                      <Check className="text-green-600 mx-auto mb-4" size={36} />
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

export default VerificationTeam;