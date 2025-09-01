import React, { useState, useEffect } from "react";
import { Users, Plus, Check, Trash2, RefreshCw, Edit2 } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AssignInteractionDeans = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [deanIds, setDeanIds] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allFaculty, setAllFaculty] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [departmentDeans, setDepartmentDeans] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    fetchAllInteractionDeans();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/all-faculties`);
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

  const fetchAllInteractionDeans = async () => {
    setIsLoading(true);
    try {
      const deansData = {};
      
      // Fetch interaction deans for each department
      const promises = departments.map(async (department) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${department}/interaction-deans`);
          if (response.ok) {
            const data = await response.json();
            deansData[department] = data;
          }
        } catch (error) {
          console.error(`Error fetching ${department} interaction deans:`, error);
        }
      });
      
      await Promise.all(promises);
      setDepartmentDeans(deansData);
    } catch (err) {
      setError('Error loading interaction deans: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMore = () => {
    setDeanIds([...deanIds, ""]);
    setSuggestions([]);
  };

  const handleDeanIdChange = (index, value) => {
    const newDeanIds = [...deanIds];
    newDeanIds[index] = value;
    setDeanIds(newDeanIds);
    setActiveInputIndex(index);

    // Filter suggestions based on input, only showing faculty with Dean designation
    if (value.trim()) {
      const filtered = allFaculty
        .filter(faculty => 
          (faculty._id.toLowerCase().includes(value.toLowerCase()) ||
           faculty.name.toLowerCase().includes(value.toLowerCase())) &&
          // Exclude already selected IDs
          !deanIds.includes(faculty._id)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (index, faculty) => {
    const newDeanIds = [...deanIds];
    newDeanIds[index] = faculty._id;
    setDeanIds(newDeanIds);
    setSuggestions([]);
  };

  const handleRemoveDean = (index) => {
    const newDeanIds = deanIds.filter((_, i) => i !== index);
    setDeanIds(newDeanIds);
    setSuggestions([]);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate selected department and dean IDs
  if (!selectedDepartment) {
    setError("Please select a department");
    return;
  }

  if (deanIds.some(id => !id.trim())) {
    setError("Please provide valid faculty IDs for all entries");
    return;
  }
  
  try {
    setLoading(true);
    setError(null);

    const baseUrl = `${import.meta.env.VITE_BASE_URL}`;
    const url = `${baseUrl}/${selectedDepartment}/assign-interaction-deans`;
    
    console.log("Assigning interaction dean IDs:", deanIds, "to department:", selectedDepartment);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      dean_ids: deanIds
      }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to assign interaction deans to department');
    }

    setSuccessMessage('Interaction deans assigned successfully!');
    setShowSuccessDialog(true);
    
    // Clean up state
    setSelectedDepartment('');
    setDeanIds(['']);
    fetchAllInteractionDeans(); // Refresh deans after submit

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72">
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Form to assign interaction deans */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 assign-dean-form">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center">
                <Users className="mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Assign Interaction Deans to Department
                </h2>
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

                  {/* Dean Faculty IDs */}
                  <div className="space-y-4">
                    {deanIds.map((id, index) => (
                      <div key={index} className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={id}
                            onChange={(e) => handleDeanIdChange(index, e.target.value)}
                            placeholder="Enter faculty ID or name"
                            required
                            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {deanIds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDean(index)}
                              className="p-2.5 text-red-600 hover:text-red-700"
                              title="Remove dean"
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
                                <div className="flex items-center">
                                  <span className="text-gray-500 text-sm">{faculty.department}</span>
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Dean</span>
                                </div>
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
                      Add Another Dean
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Assign Interaction Deans"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Display Department Interaction Deans */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Current Interaction Deans
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
                      const deansData = departmentDeans[department];
                      return (
                        <div key={department} className="border border-gray-200 rounded-lg">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-md font-medium text-gray-800">{department}</h3>
                          </div>
                          <div className="p-4">
                            {!deansData || !deansData.deans || deansData.deans.length === 0 ? (
                              <p className="text-gray-600 text-sm italic">No interaction deans assigned</p>
                            ) : (
                              <ul className="space-y-3">
                                {deansData.deans.map((dean, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                                      {index + 1}
                                    </span>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{dean.name || getFacultyName(dean._id)}</span>
                                        <span className="text-gray-500 text-xs">({dean._id})</span>
                                      </div>
                                      {dean.dept && (
                                        <span className="text-xs text-gray-600 mt-0.5">From: {dean.dept}</span>
                                      )}
                                    </div>
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
        </main>
      </div>
    </div>
  );
};

export default AssignInteractionDeans;