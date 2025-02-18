import React, { useState, useEffect } from "react";
import { Users, Plus, Check, Trash2 } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const VerificationTeam = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [facultyIds, setFacultyIds] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allFaculty, setAllFaculty] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [activeInputIndex, setActiveInputIndex] = useState(null);

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
  }, []);

  const fetchFacultyData = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      setAllFaculty(data);
    } catch (err) {
      setError('Error loading faculty data: ' + err.message);
    }
  };

  const handleAddMore = () => {
    setFacultyIds([...facultyIds, ""]);
    setSuggestions([]);
  };

  const handleFacultyIdChange = (index, value) => {
    const newFacultyIds = [...facultyIds];
    newFacultyIds[index] = value;
    setFacultyIds(newFacultyIds);
    setActiveInputIndex(index);

    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = allFaculty
        .filter(faculty => 
          // Filter by department if selected
          (!selectedDepartment || faculty.dept === selectedDepartment) &&
          // Filter by ID or name containing input value
          (faculty._id.toLowerCase().includes(value.toLowerCase()) ||
           faculty.name.toLowerCase().includes(value.toLowerCase())) &&
          // Exclude already selected IDs
          !facultyIds.includes(faculty._id)
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (index, faculty) => {
    const newFacultyIds = [...facultyIds];
    newFacultyIds[index] = faculty._id;
    setFacultyIds(newFacultyIds);
    setSuggestions([]);
  };

  const handleRemoveFaculty = (index) => {
    const newFacultyIds = facultyIds.filter((_, i) => i !== index);
    setFacultyIds(newFacultyIds);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDepartment) {
      setError("Please select a department");
      return;
    }

    if (facultyIds.some(id => !id.trim())) {
      setError("Please fill all faculty IDs");
      return;
    }

    // Validate that all IDs exist in the database
    const validIds = facultyIds.every(id => 
      allFaculty.some(faculty => faculty._id === id)
    );

    if (!validIds) {
      setError("One or more faculty IDs are invalid");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/verification-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: selectedDepartment,
          facultyIds: facultyIds.filter(id => id.trim())
        })
      });

      if (!response.ok) throw new Error('Failed to allocate verification team');
      
      setSuccessMessage('Verification team allocated successfully');
      setShowSuccessDialog(true);
      setSelectedDepartment("");
      setFacultyIds([""]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72">
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center">
                <Users className="mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Allocate Verification Team
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

                  {/* Faculty IDs */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">
                      Faculty IDs
                    </label>
                    {facultyIds.map((id, index) => (
                      <div key={index} className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={id}
                            onChange={(e) => handleFacultyIdChange(index, e.target.value)}
                            placeholder="Enter faculty ID or name"
                            required
                            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {facultyIds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFaculty(index)}
                              className="p-2.5 text-red-600 hover:text-red-700"
                              title="Remove faculty"
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
                      Add More
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Done"}
                    </button>
                  </div>
                </div>
              </form>
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

export default VerificationTeam;