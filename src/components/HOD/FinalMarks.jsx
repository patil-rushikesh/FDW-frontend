import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, Filter, SortAsc, SortDesc, Send } from "lucide-react";

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
  const [isSending, setIsSending] = useState(false);

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
        // Updated API endpoint to match the provided route
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/${department}/all_faculties_final_marks`
        );
        if (!response.ok) throw new Error("Failed to fetch faculty marks data");

        const responseData = await response.json();
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

  // Filter and sort faculty data - remains the same
  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        const searchMatch =
          faculty.faculty_info.id
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          faculty.faculty_info.name
            ?.toLowerCase()
            .includes(filters.search.toLowerCase());

        const totalMarks = faculty.final_marks?.total_marks || 0;

        const marksMatch =
          (!filters.minMarks ||
            filters.minMarks === "" ||
            totalMarks >= Number(filters.minMarks)) &&
          (!filters.maxMarks ||
            filters.maxMarks === "" ||
            totalMarks <= Number(filters.maxMarks));

        return searchMatch && marksMatch;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valueA, valueB;

        switch (sortConfig.key) {
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

        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      });
  }, [facultyData, filters, sortConfig]);

  const toggleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  // Add this function to handle sending to director
  const handleSendToDirector = async () => {
    if (
      window.confirm(
        "Are you sure you want to send all final marks to the Director?"
      )
    ) {
      try {
        setIsSending(true);

        // TODO: Replace with actual API call
        // const response = await fetch(`${import.meta.env.VITE_BASE_URL}/${department}/send_to_director`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' }
        // });

        // if (!response.ok) throw new Error("Failed to send marks to director");

        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        alert("Faculty marks successfully sent to Director!");
      } catch (err) {
        alert("Error sending marks: " + err.message);
      } finally {
        setIsSending(false);
      }
    }
  };

  // The rest of the component remains unchanged
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
    <div className="min-h-screen bg-gray-50">
      <main className="lg:mt-16">
        <div className="max-w-full mx-auto px-4 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-200 px-4 lg:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center">
                  <Users className="mr-2 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Final Faculty Marks - {department}
                  </h2>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row gap-4">
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
                    className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                  />
                </div>
              </div>

              {/* Marks Filter Section */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Marks"
                    value={filters.minMarks}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minMarks: e.target.value,
                      }))
                    }
                    className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-20 sm:w-24"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max Marks"
                    value={filters.maxMarks}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxMarks: e.target.value,
                      }))
                    }
                    className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-20 sm:w-24"
                  />
                </div>
              </div>

              {/* Summary Section */}
              {/* <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600">Total Faculty</p>
                    <p className="text-2xl font-bold text-blue-800">{summary.total_faculty || 0}</p>
                    </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600">Final Marks Calculated</p>
                  <p className="text-2xl font-bold text-green-800">{summary.final_marks_calculated || 0}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-600">Partially Reviewed</p>
                  <p className="text-2xl font-bold text-yellow-800">{summary.partially_reviewed || 0}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600">Not Reviewed</p>
                  <p className="text-2xl font-bold text-red-800">{summary.not_reviewed || 0}</p>
                </div>
              </div> */}
            </div>

            {/* Table Section - remains the same */}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-md text-left">
                <thead className="bg-gray-50 text-md">
                  <tr>
                    <th className="px-3 py-3 text-gray-600">ID</th>
                    <th className="px-3 py-3 text-gray-600">Name</th>
                    <th className="px-3 py-3 text-gray-600">Designation</th>
                    <th
                      className="px-3 py-3 text-gray-600 cursor-pointer"
                      onClick={() => toggleSort("verified")}
                    >
                      <div className="flex items-center">
                        Self Appraisal Marks(Max 1000)
                        <span className="text-xs ml-1"></span>
                        {sortConfig.key === "verified" &&
                          (sortConfig.direction === "asc" ? (
                            <SortAsc size={14} className="ml-1" />
                          ) : (
                            <SortDesc size={14} className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-gray-600 cursor-pointer"
                      onClick={() => toggleSort("scaled_verified")}
                    >
                      <div className="flex items-center">
                        Scaled Self Appraisal (Max 75)
                        <span className="text-xs ml-1"></span>
                        {sortConfig.key === "scaled_verified" &&
                          (sortConfig.direction === "asc" ? (
                            <SortAsc size={14} className="ml-1" />
                          ) : (
                            <SortDesc size={14} className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-gray-600">
                      Interaction Marks
                    </th>
                    <th
                      className="px-3 py-3 text-gray-600 cursor-pointer"
                      onClick={() => toggleSort("interaction_avg")}
                    >
                      <div className="flex items-center">
                        Interaction Score (Max 100)
                        <span className="text-xs ml-1"></span>
                        {sortConfig.key === "interaction_avg" &&
                          (sortConfig.direction === "asc" ? (
                            <SortAsc size={14} className="ml-1" />
                          ) : (
                            <SortDesc size={14} className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-gray-600">
                      <div className="flex items-center">
                        Scaled Interaction (Max 25)
                        <span className="text-xs ml-1"></span>
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-gray-600 cursor-pointer"
                      onClick={() => toggleSort("total")}
                    >
                      <div className="flex items-center">
                        Total Marks (Max 100)
                        <span className="text-xs ml-1"></span>
                        {sortConfig.key === "total" &&
                          (sortConfig.direction === "asc" ? (
                            <SortAsc size={14} className="ml-1" />
                          ) : (
                            <SortDesc size={14} className="ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No faculty marks data available
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((faculty) => (
                      <tr
                        key={faculty.faculty_info.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-3 py-4 font-medium">
                          {faculty.faculty_info.id}
                        </td>
                        <td className="px-3 py-4">
                          {faculty.faculty_info.name}
                        </td>
                        <td className="px-3 py-4">
                          {faculty.faculty_info.designation}
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-medium">
                            {formatNumber(faculty.final_marks?.verified_marks)}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-medium text-blue-700">
                            {formatNumber(
                              faculty.final_marks?.scaled_verified_marks
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                HOD:
                              </span>
                              <span className="text-xs font-medium">
                                {faculty.interaction_marks?.hod?.marks || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                Dean:
                              </span>
                              <span className="text-xs font-medium">
                                {faculty.interaction_marks?.dean?.marks ||
                                  "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">
                                External:
                              </span>
                              <span className="text-xs font-medium">
                                {faculty.interaction_marks?.external?.marks ||
                                  "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-medium">
                            {formatNumber(
                              faculty.final_marks?.interaction_average
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-medium text-blue-700">
                            {formatNumber(
                              faculty.final_marks?.scaled_interaction_marks
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span className="font-semibold text-lg text-blue-800">
                            {formatNumber(faculty.final_marks?.total_marks)}
                          </span>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-block text-center px-3 py-1 rounded-full text-xs font-semibold ${
                              faculty.faculty_info.status === "done"
                                ? "bg-green-100 text-green-800"
                                : faculty.faculty_info.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {faculty.faculty_info.status === "done"
                              ? "Completed"
                              : faculty.faculty_info.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Send to Director Section */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleSendToDirector}
                  disabled={isSending || filteredData.length === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send to Director</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinalMarks;
