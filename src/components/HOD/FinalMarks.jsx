import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, Filter, SortAsc, SortDesc, Send, Check, AlertCircle } from "lucide-react";

const FinalMarks = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState("");
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    minMarks: "",
    maxMarks: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc", // Default to highest marks first
  });
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get user's department on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.dept) {
      setDepartment(userData.dept);
    }
  }, []);

  // Fetch faculty marks data - UPDATED TO USE CORRECT API ENDPOINT
  useEffect(() => {
    const fetchFacultyMarks = async () => {
      if (!department) return;

      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${department}/all_faculties_final_marks`);
        if (!response.ok) throw new Error("Failed to fetch faculty marks data");
        
        const responseData = await response.json();
        console.log("API Response:", responseData); // Log the API response for debugging
        if (responseData.data) {
          setFacultyData(responseData.data);
          setSummary(responseData.summary || {});
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError("Error loading faculty marks: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyMarks();
  }, [department]);

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    return typeof num === "number" ? num.toFixed(2) : "N/A";
  };

  // Filter and sort faculty data
  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        const searchMatch = faculty.faculty_info.id.toLowerCase().includes(filters.search.toLowerCase()) ||
          faculty.faculty_info.name?.toLowerCase().includes(filters.search.toLowerCase());
        
        const totalMarks = faculty.final_marks?.total_marks || 0;
        
        const marksMatch =
          (!filters.minMarks || filters.minMarks === "" || totalMarks >= Number(filters.minMarks)) &&
          (!filters.maxMarks || filters.maxMarks === "" || totalMarks <= Number(filters.maxMarks));

        return searchMatch && marksMatch;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valueA, valueB;
        
        switch(sortConfig.key) {
          case "total":
            valueA = a.final_marks?.total_marks || 0;
            valueB = b.final_marks?.total_marks || 0;
            break;
          case "scaled_verified":
            valueA = a.final_marks?.scaled_verified_marks || 0;
            valueB = b.final_marks?.scaled_verified_marks || 0;
            break;
          case "interaction_avg":
            valueA = a.final_marks?.interaction_average || 0;
            valueB = b.final_marks?.interaction_average || 0;
            break;
          case "verified":
            valueA = a.final_marks?.verified_marks || 0;
            valueB = b.final_marks?.verified_marks || 0;
            break;
          default:
            return 0;
        }

        return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
      });
  }, [facultyData, filters, sortConfig]);

  
  // Get only faculty with "done" status for selection
  const eligibleFaculty = useMemo(() => {
    return filteredData.filter(faculty => 
      faculty.faculty_info.status && faculty.faculty_info.status.toLowerCase() === "done" 
    );
  }, [filteredData]);
  
  console.log("Eligible Data:", eligibleFaculty);
  // Add a new memoized value for all viewable faculty (including "SentToDirector")
  const viewableFacultyStatuses = useMemo(() => {
    // Get unique statuses from the filtered data to determine if checkboxes should be shown
    const uniqueStatuses = new Set(filteredData.map(faculty => 
      faculty.faculty_info.status?.toLowerCase()
    ));
    
    return {
      showCheckboxes: uniqueStatuses.has("done"),
      hasSentToDirector: uniqueStatuses.has("senttodirector")
    };
  }, [filteredData]);

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc"
    }));
  };

  // Handle selection of individual faculty
  const handleSelectFaculty = (facultyId) => {
    setSelectedFaculty(prev => {
      if (prev.includes(facultyId)) {
        return prev.filter(id => id !== facultyId);
      } else {
        return [...prev, facultyId];
      }
    });
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (selectedFaculty.length === eligibleFaculty.length) {
      setSelectedFaculty([]);
    } else {
      setSelectedFaculty(eligibleFaculty.map(faculty => faculty.faculty_info.id));
    }
  };

  // Send selected faculty to director
  const handleSendToDirector = async () => {
    if (selectedFaculty.length === 0) {
      setError("Please select at least one faculty member");
      return;
    }
    
    // Check if all selected faculty are in "done" status
    const invalidFaculty = selectedFaculty.filter(id => {
      const faculty = facultyData.find(f => f.faculty_info.id === id);
      return !faculty || faculty.faculty_info.status?.toLowerCase() !== "done";
    });
    
    if (invalidFaculty.length > 0) {
      setError(`${invalidFaculty.length} selected faculty members are not in "Completed" status and cannot be sent.`);
      return;
    }

    console.log("Selected Faculty IDs:", selectedFaculty);
    try {
      setSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${department}/send-to-director`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ids: selectedFaculty
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send data to director');
      }
      
      // Check if we have any successful IDs
      if (!data.successful_ids || data.successful_ids.length === 0) {
        throw new Error('No valid users found. Please ensure selected faculty have completed all requirements.');
      }

      console.log("Response Data:", data);
      // Update UI with the successfully sent faculty members
      setFacultyData(prev => prev.map(faculty => {
        if (data.successful_ids.includes(faculty.faculty_info.id)) {
          return {
            ...faculty,
            faculty_info: {
              ...faculty.faculty_info,
              status: "SentToDirector"
            }
          };
        }
        return faculty;
      }));
      
      setSuccessMessage(`Successfully sent ${data.successful_ids.length} faculty appraisals to director`);
      setSelectedFaculty([]);
      
      // If there were some unsuccessful IDs, show a warning
      if (data.unsuccessful_ids && data.unsuccessful_ids.length > 0) {
        setError(`${data.successful_ids.length} faculty sent successfully, but ${data.unsuccessful_ids.length} could not be processed.`);
      }
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty marks data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Dismiss
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="lg:mt-16">
        <div className="max-w-full mx-auto px-4 py-6 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center">
                  <Users className="mr-3 h-7 w-7" />
                  <h2 className="text-2xl font-bold">
                    Faculty Performance Assessment - {department}
                  </h2>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by ID or Name"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="pl-10 p-2 bg-white/90 border border-indigo-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Filters */}
            <div className="px-6 pt-5 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
                <div className="bg-white shadow-sm p-4 rounded-xl border border-blue-100 flex items-center transform transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <Check className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Marks Calculated</p>
                    <p className="text-2xl font-bold text-gray-800">{summary.final_marks_calculated || 0}</p>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-4 rounded-xl border border-blue-100 flex items-center transform transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <Filter className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Faculty Members</p>
                    <p className="text-2xl font-bold text-gray-800">{filteredData.length}</p>
                  </div>
                </div>
                
                <div className="bg-white shadow-sm p-4 rounded-xl border border-blue-100 flex items-center transform transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="rounded-full bg-indigo-100 p-3 mr-4">
                    <Send className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ready to Send</p>
                    <p className="text-2xl font-bold text-gray-800">{eligibleFaculty.length}</p>
                  </div>
                </div>

                <div className="bg-white shadow-sm p-4 rounded-xl border border-blue-100 flex items-center transform transition-all hover:scale-[1.02] hover:shadow-md">
                  <div className="rounded-full bg-purple-100 p-3 mr-4">
                    <AlertCircle className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Avg. Total Score</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {filteredData.length > 0 
                        ? (filteredData.reduce((sum, faculty) => sum + (faculty.final_marks?.total_marks || 0), 0) / filteredData.length).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Marks filters */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-lg shadow-sm border border-gray-200">
                  <Filter size={18} className="text-gray-500" />
                  <span className="text-gray-600 font-medium">Filter by marks:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minMarks}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minMarks: e.target.value,
                      }))
                    }
                    className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxMarks}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxMarks: e.target.value,
                      }))
                    }
                    className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                
                {/* Send to Director button */}
                {eligibleFaculty.length > 0 && (
                  <button
                    onClick={handleSendToDirector}
                    disabled={selectedFaculty.length === 0 || submitting}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition 
                      ${selectedFaculty.length === 0 || submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'}`}
                  >
                    <Send size={16} />
                    {submitting ? 'Sending...' : `Send to Director (${selectedFaculty.length})`}
                  </button>
                )}
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 flex items-center gap-2 animate-fadeIn">
                  <Check size={18} className="text-green-600" />
                  {successMessage}
                </div>
              )}
            </div>

            {/* Table Section - Updated with improved styling */}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-md text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                    {/* Checkbox column for selection - show if any faculty has "done" status */}
                    {viewableFacultyStatuses.showCheckboxes && (
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedFaculty.length === eligibleFaculty.length && eligibleFaculty.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Designation</th>
                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => toggleSort("verified")}>
                      <div className="flex items-center">
                        Self Appraisal
                        <span className="text-xs ml-1 text-gray-500">(Max 1000)</span>
                        {sortConfig.key === "verified" && (
                          sortConfig.direction === "asc" ? 
                            <SortAsc size={14} className="ml-1 text-blue-600" /> : 
                            <SortDesc size={14} className="ml-1 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => toggleSort("scaled_verified")}>
                      <div className="flex items-center">
                        Self Appraisal * 0.85
                        {sortConfig.key === "scaled_verified" && (
                          sortConfig.direction === "asc" ? 
                            <SortAsc size={14} className="ml-1 text-blue-600" /> : 
                            <SortDesc size={14} className="ml-1 text-blue-600" />
                        )}
                      </div>
                    </th>
                    
                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => toggleSort("interaction_avg")}>
                      <div className="flex items-center">
                        Interaction Score
                        <span className="text-xs ml-1 text-gray-500">(Max 100)</span>
                        {sortConfig.key === "interaction_avg" && (
                          sortConfig.direction === "asc" ? 
                            <SortAsc size={14} className="ml-1 text-blue-600" /> : 
                            <SortDesc size={14} className="ml-1 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <div className="flex items-center">
                        Interaction * 1.5
                      </div>
                    </th>
                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-gray-200" onClick={() => toggleSort("total")}>
                      <div className="flex items-center">
                        Total Marks
                        <span className="text-xs ml-1 text-gray-500">(Max 1000)</span>
                        {sortConfig.key === "total" && (
                          sortConfig.direction === "asc" ? 
                            <SortAsc size={14} className="ml-1 text-blue-600" /> : 
                            <SortDesc size={14} className="ml-1 text-blue-600" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={viewableFacultyStatuses.showCheckboxes ? "11" : "10"} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search size={48} className="mb-2 text-gray-400" />
                          <p className="text-lg">No faculty marks data available</p>
                          <p className="text-sm text-gray-400">Try adjusting your search filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((faculty, index) => (
                      <tr 
                        key={faculty.faculty_info.id} 
                        className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        {/* Checkbox for faculty selection - only visible for "done" status faculty */}
                        {viewableFacultyStatuses.showCheckboxes && (
                          <td className="px-4 py-4">
                            {faculty.faculty_info.status?.toLowerCase() === "done" && (
                              <input
                                type="checkbox"
                                checked={selectedFaculty.includes(faculty.faculty_info.id)}
                                onChange={() => handleSelectFaculty(faculty.faculty_info.id)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                              />
                            )}
                          </td>
                        )}
                        <td className="px-4 py-4 font-medium text-gray-700">{faculty.faculty_info.id}</td>
                        <td className="px-4 py-4 font-medium">{faculty.faculty_info.name}</td>
                        <td className="px-4 py-4 text-gray-600">{faculty.faculty_info.role}</td>
                        <td className="px-4 py-4">
                          <span className="font-medium">{formatNumber(faculty.final_marks?.verified_marks)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-blue-700">{formatNumber(faculty.final_marks?.scaled_verified_marks)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium">{formatNumber(faculty.final_marks?.interaction_average)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-blue-700">{formatNumber(faculty.final_marks?.scaled_interaction_marks)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-semibold text-lg px-3 py-1 rounded-lg relative group whitespace-nowrap ${
                            faculty.faculty_info.designation_bonus_given 
                              ? 'text-amber-700 bg-amber-100' 
                              : 'text-blue-800 bg-blue-50'
                          }`}>
                            {formatNumber(faculty.final_marks?.total_marks)}
                            {/* Hover tooltip for designation bonus */}
                            {faculty.faculty_info.designation_bonus_given && (
                              <div className="absolute z-10 invisible group-hover:visible bg-black text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                Extra Marks Given Due to Designation
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                              </div>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block text-center px-3 py-1 rounded-full text-xs font-semibold ${
                              faculty.faculty_info.status === "done"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : faculty.faculty_info.status === "pending"
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : faculty.faculty_info.status === "SentToDirector"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {faculty.faculty_info.status === "done" 
                              ? "Completed" 
                              : faculty.faculty_info.status === "SentToDirector"
                              ? "Sent to Director"
                              : faculty.faculty_info.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinalMarks;