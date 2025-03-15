import React, { useState, useEffect } from "react";
import { Users, Plus, Check, Trash2, RefreshCw, Edit2, UserPlus } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AssignDeanToDepartment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [deanId, setDeanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allFaculty, setAllFaculty] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [departmentDeans, setDepartmentDeans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [selectedDeans, setSelectedDeans] = useState([]);
  const [interactionDeans, setInteractionDeans] = useState({});
  const [activeTab, setActiveTab] = useState("departmentDean"); // "departmentDean" or "interactionDeans"

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
    fetchAllDepartmentDeans();
    fetchAllInteractionDeans();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/all-faculties');
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      // Extract the data property from the response
      const facultyList = data.data || [];
      // Only keep faculty with Dean designation
      const deanFaculty = facultyList.filter(faculty => faculty.designation === "Dean");
      setAllFaculty(deanFaculty);
    } catch (err) {
      setError('Error loading faculty data: ' + err.message);
    }
  };

  const fetchAllDepartmentDeans = async () => {
    setIsLoading(true);
    try {
      const deansData = {};
      
      // Fetch dean for each department
      const promises = departments.map(async (department) => {
        try {
          const response = await fetch(`http://localhost:5000/${department}/dean`);
          if (response.ok) {
            const data = await response.json();
            deansData[department] = data;
          }
        } catch (error) {
          console.error(`Error fetching ${department} dean:`, error);
        }
      });
      
      await Promise.all(promises);
      setDepartmentDeans(deansData);
    } catch (err) {
      setError('Error loading department deans: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllInteractionDeans = async () => {
    setIsLoading(true);
    try {
      const interactionData = {};
      
      const promises = departments.map(async (department) => {
        try {
          const response = await fetch(`http://localhost:5000/${department}/interaction-deans`);
          if (response.ok) {
            const data = await response.json();
            interactionData[department] = data.deans || [];
          }
        } catch (error) {
          console.error(`Error fetching ${department} interaction deans:`, error);
        }
      });
      
      await Promise.all(promises);
      setInteractionDeans(interactionData);
    } catch (err) {
      setError('Error loading interaction deans: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeanIdChange = (value) => {
    setDeanId(value);

    // Filter suggestions based on input, only showing faculty with Dean designation
    if (value.trim()) {
      const filtered = allFaculty
        .filter(faculty => 
          (faculty._id.toLowerCase().includes(value.toLowerCase()) ||
           faculty.name.toLowerCase().includes(value.toLowerCase()))
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (faculty) => {
    setDeanId(faculty._id);
    setSuggestions([]);
  };

  const handleDeanSelection = (faculty) => {
    if (activeTab === "departmentDean") {
      // Single selection for department dean
      setDeanId(faculty._id);
      setSuggestions([]);
    } else {
      // Multiple selection for interaction deans
      const isAlreadySelected = selectedDeans.some(dean => dean._id === faculty._id);
      
      if (isAlreadySelected) {
        setSelectedDeans(selectedDeans.filter(dean => dean._id !== faculty._id));
      } else {
        setSelectedDeans([...selectedDeans, {
          _id: faculty._id,
          name: faculty.name,
          dept: faculty.department
        }]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that selected faculty has Dean designation
    const selectedFaculty = allFaculty.find(faculty => faculty._id === deanId);
    if (!selectedFaculty) {
      setError("Selected faculty ID must belong to a faculty with Dean designation");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const baseUrl = 'http://localhost:5000';
      const url = `${baseUrl}/${selectedDepartment}/dean`;
      
      const queryParams = editingDepartment ? '?force=true' : '';
      
      console.log("Assigning dean ID:", deanId, "to department:", selectedDepartment);
      
      const response = await fetch(`${url}${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dean_id: deanId
        }),
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign dean to department');
      }
  
      setSuccessMessage(`Dean ${editingDepartment ? 'updated' : 'assigned'} successfully!`);
      setShowSuccessDialog(true);
      
      // Clean up state
      if (!editingDepartment) {
        setSelectedDepartment('');
      }
      setDeanId('');
      fetchAllDepartmentDeans(); // Refresh deans after submit
  
    } catch (error) {
      console.error('Error assigning dean:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInteractionDeans = async (e) => {
    e.preventDefault();

    if (!selectedDepartment) {
      setError("Please select a department");
      return;
    }
    
    if (selectedDeans.length === 0) {
      setError("Please select at least one dean for interaction");
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
  
      const url = `http://localhost:5000/${selectedDepartment}/assign-interaction-deans`;
      
      console.log("Assigning interaction deans to department:", selectedDepartment);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dean_ids: selectedDeans.map(dean => dean._id)
        }),
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign interaction deans');
      }
  
      setSuccessMessage(`Interaction deans assigned successfully!`);
      setShowSuccessDialog(true);
      
      // Clean up state
      setSelectedDepartment('');
      setSelectedDeans([]);
      fetchAllInteractionDeans(); // Refresh interaction deans
  
    } catch (error) {
      console.error('Error assigning interaction deans:', error);
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

  // Function to start editing a department's dean
  const handleEditDean = (department) => {
    const deanData = departmentDeans[department];
    if (deanData && deanData.dean_id) {
      try {
        setSelectedDepartment(department);
        setDeanId(deanData.dean_id);
        setEditingDepartment(department);
        
        // Scroll to the form section
        const formElement = document.querySelector('.assign-dean-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error("Error preparing dean for editing:", error);
        setError("Failed to load dean data for editing.");
      }
    }
  };

  // Add cancel editing function
  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setSelectedDepartment("");
    setDeanId("");
    setError(null);
  };

  // Handle removing a dean
  const handleRemoveDean = async (department) => {
    if (!confirm(`Are you sure you want to remove the dean from ${department}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const baseUrl = 'http://localhost:5000';
      const url = `${baseUrl}/${department}/dean`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove dean');
      }

      setSuccessMessage(`Dean removed successfully from ${department}!`);
      setShowSuccessDialog(true);
      fetchAllDepartmentDeans(); // Refresh data
    } catch (error) {
      console.error('Error removing dean:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing an interaction dean
  const handleRemoveInteractionDean = async (department, deanId) => {
    if (!confirm(`Are you sure you want to remove this dean from ${department} interactions?`)) {
      return;
    }

    try {
      // This would require a backend endpoint to remove a single interaction dean
      // For now, we'll get the current list and update it without the removed dean
      const currentDeans = interactionDeans[department] || [];
      const updatedDeans = currentDeans.filter(dean => dean._id !== deanId);
      
      const url = `http://localhost:5000/${department}/assign-interaction-deans`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dean_ids: updatedDeans.map(dean => dean._id)
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update interaction deans');
      }

      setSuccessMessage(`Dean removed successfully from ${department} interactions!`);
      setShowSuccessDialog(true);
      fetchAllInteractionDeans(); // Refresh data
    } catch (error) {
      console.error('Error removing interaction dean:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72">
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("departmentDean")}
                className={`py-3 px-6 font-medium text-sm ${
                  activeTab === "departmentDean"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <Users size={18} className="mr-2" />
                  <span>Department Dean</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("interactionDeans")}
                className={`py-3 px-6 font-medium text-sm ${
                  activeTab === "interactionDeans"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center">
                  <UserPlus size={18} className="mr-2" />
                  <span>Interaction Deans</span>
                </div>
              </button>
            </div>

            {/* Form to assign dean or interaction deans based on active tab */}
            {activeTab === "departmentDean" ? (
              /* Original form for assigning department dean */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 assign-dean-form">
                {/* ...existing department dean form... */}
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {editingDepartment ? `Edit ${editingDepartment} Dean` : "Assign Dean to Department"}
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
                  {/* ...existing form fields... */}
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
                    </div>

                    {/* Dean ID Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Dean Faculty ID
                        <span className="text-xs text-blue-600 ml-2">(Only faculty with "Dean" designation)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={deanId}
                          onChange={(e) => handleDeanIdChange(e.target.value)}
                          placeholder="Enter faculty ID or name"
                          required
                          className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {suggestions.map((faculty, i) => (
                              <div
                                key={faculty._id}
                                onClick={() => handleSuggestionClick(faculty)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-medium">{faculty._id}</span>
                                  <span className="text-gray-600 ml-2">({faculty.name})</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 text-sm">{faculty.department}</span>
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Dean</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <p className="text-red-600 text-sm">{error}</p>
                    )}

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium disabled:opacity-50"
                      >
                        {loading ? "Processing..." : editingDepartment ? "Update Dean" : "Assign Dean"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* New form for assigning interaction deans */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 assign-dean-form">
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center">
                    <UserPlus className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Assign Interaction Deans to Department
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleSubmitInteractionDeans} className="p-6">
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
                          setSelectedDeans([]);
                        }}
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dean Selection Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Select Deans for Interaction
                        <span className="text-xs text-blue-600 ml-2">(Only faculty with "Dean" designation)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={deanId}
                          onChange={(e) => handleDeanIdChange(e.target.value)}
                          placeholder="Search faculty ID or name"
                          className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            {suggestions.map((faculty) => (
                              <div
                                key={faculty._id}
                                onClick={() => handleDeanSelection(faculty)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-medium">{faculty._id}</span>
                                  <span className="text-gray-600 ml-2">({faculty.name})</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-500 text-sm">{faculty.department}</span>
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Dean</span>
                                  {selectedDeans.some(dean => dean._id === faculty._id) && (
                                    <Check size={16} className="ml-2 text-green-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Deans List */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Selected Deans ({selectedDeans.length})
                      </label>
                      <div className="border border-gray-200 rounded-lg p-3 min-h-[100px] bg-gray-50">
                        {selectedDeans.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedDeans.map(dean => (
                              <div key={dean._id} className="flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
                                <span className="font-medium">{dean.name}</span>
                                <span className="text-xs text-gray-600 ml-2">({dean._id})</span>
                                <button 
                                  onClick={() => setSelectedDeans(selectedDeans.filter(d => d._id !== dean._id))}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                  type="button"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No deans selected</p>
                        )}
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <p className="text-red-600 text-sm">{error}</p>
                    )}

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading || selectedDeans.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Assign Interaction Deans"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Display Section - Department Deans or Interaction Deans based on active tab */}
            {activeTab === "departmentDean" ? (
              /* Display Department Deans - existing code */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* ...existing department deans display... */}
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Current Department Deans
                    </h2>
                  </div>
                  <button 
                    onClick={fetchAllDepartmentDeans}
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
                        const deanData = departmentDeans[department];
                        return (
                          <div key={department} className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                              <h3 className="text-md font-medium text-gray-800">{department}</h3>
                              {deanData && deanData.dean_id && (
                                <div className="flex">
                                  <button 
                                    onClick={() => handleEditDean(department)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md mr-1"
                                    title="Edit dean"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveDean(department)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                    title="Remove dean"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              {!deanData || !deanData.dean_id ? (
                                <p className="text-gray-600 text-sm italic">No dean assigned</p>
                              ) : (
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{deanData.dean_name || getFacultyName(deanData.dean_id)}</span>
                                    <span className="text-gray-500 text-xs">({deanData.dean_id})</span>
                                  </div>
                                  {deanData.dean_dept && (
                                    <span className="text-xs text-gray-600 mt-1">From: {deanData.dean_dept}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Display Interaction Deans - new section */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Current Interaction Deans by Department
                    </h2>
                  </div>
                  <button 
                    onClick={fetchAllInteractionDeans}
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
                        const deans = interactionDeans[department] || [];
                        return (
                          <div key={department} className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <h3 className="text-md font-medium text-gray-800">{department}</h3>
                            </div>
                            <div className="p-4">
                              {deans.length === 0 ? (
                                <p className="text-gray-600 text-sm italic">No interaction deans assigned</p>
                              ) : (
                                <ul className="space-y-2">
                                  {deans.map(dean => (
                                    <li key={dean._id} className="flex justify-between items-center text-sm">
                                      <div className="flex flex-col">
                                        <div className="flex items-center">
                                          <span className="font-medium">{dean.name}</span>
                                          <span className="text-gray-500 text-xs ml-2">({dean._id})</span>
                                        </div>
                                        {dean.dept && (
                                          <span className="text-xs text-gray-600">From: {dean.dept}</span>
                                        )}
                                      </div>
                                      <button 
                                        onClick={() => handleRemoveInteractionDean(department, dean._id)}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                        title="Remove from interaction"
                                      >
                                        <Trash2 size={16} />
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
            )}

            {/* Success Dialog - existing code */}
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
        </main>
      </div>
    </div>
  );
};

export default AssignDeanToDepartment;