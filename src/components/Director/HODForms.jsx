import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HODForms = () => {
  const navigate = useNavigate();
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    minMarks: "",
    maxMarks: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [departments, setDepartments] = useState([]);

  // Process verification status
  const processVerificationStatus = (facultyList) => {
    const verifiedFaculty = JSON.parse(
      localStorage.getItem("verifiedHODs") || "{}"
    );
    return facultyList.map((faculty) => ({
      ...faculty,
      status:
        faculty.status === "authority_verification_pending"
          ? "authority_verification_pending"
          : verifiedFaculty[faculty._id]
            ? "authority_verification_pending"
            : faculty.status,
    }));
  };

  // Fetch all departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/departments");
        if (!response.ok) throw new Error("Failed to fetch departments");
        const data = await response.json();
        if (data.status === "success") {
          setDepartments(data.data);
        } else {
          throw new Error("API returned an error");
        }
      } catch (err) {
        setError("Error loading departments: " + err.message);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/faculty/Computer");
        if (!response.ok) throw new Error("Failed to fetch faculty data");
        const responseData = await response.json();
        if (responseData.status === "success") {
          // Filter HODs only
          console.log(responseData.data);
          const hodFaculty = responseData.data.filter(
            (faculty) => faculty.role === "HOD" || faculty.designation === "HOD"
          );
          setFacultyData(processVerificationStatus(hodFaculty));
        } else {
          throw new Error("API returned an error");
        }
      } catch (err) {
        setError("Error loading faculty data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // Helper function to get numeric marks value regardless of format
  const getNumericMarks = (faculty) => {
    if (!faculty) return 0;
    if (faculty.status === "pending") return 0;

    if (typeof faculty.grand_marks === "object" && faculty.grand_marks) {
      return Number(faculty.grand_marks.grand_total || 0);
    } else if (typeof faculty.grand_marks === "number") {
      return faculty.grand_marks;
    } else if (
      typeof faculty.grand_marks === "string" &&
      !isNaN(faculty.grand_marks)
    ) {
      return Number(faculty.grand_marks);
    }
    return 0;
  };

  // Update the filteredData useMemo function
  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        const searchMatch =
          faculty._id.toLowerCase().includes(filters.search.toLowerCase()) ||
          (faculty.name &&
            faculty.name.toLowerCase().includes(filters.search.toLowerCase()));

        const departmentMatch =
          !filters.department || faculty.dept === filters.department;

        const facultyMarks = getNumericMarks(faculty);

        const marksMatch =
          (!filters.minMarks ||
            filters.minMarks === "" ||
            facultyMarks >= Number(filters.minMarks)) &&
          (!filters.maxMarks ||
            filters.maxMarks === "" ||
            facultyMarks <= Number(filters.maxMarks));

        return searchMatch && departmentMatch && marksMatch;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;

        if (sortConfig.key === "marks") {
          const marksA = getNumericMarks(a);
          const marksB = getNumericMarks(b);

          return sortConfig.direction === "asc"
            ? marksA - marksB
            : marksB - marksA;
        }
        return 0;
      });
  }, [facultyData, filters, sortConfig]);

  const toggleSort = () => {
    setSortConfig((current) => ({
      key: "marks",
      direction: current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Handle verification status change
  const handleVerify = async (id) => {
    try {
      // Update the faculty's status in the local state
      setFacultyData((prevData) =>
        prevData.map((faculty) =>
          faculty._id === id
            ? { ...faculty, status: "authority_verification_pending" }
            : faculty
        )
      );

      // Store the verification status in localStorage
      const allVerifications = JSON.parse(
        localStorage.getItem("verifiedHODs") || "{}"
      );
      allVerifications[id] = {
        verifiedAt: new Date().toISOString(),
        verifiedBy: JSON.parse(localStorage.getItem("userData"))._id,
      };
      localStorage.setItem("verifiedHODs", JSON.stringify(allVerifications));
    } catch (err) {
      setError("Failed to verify faculty: " + err.message);
    }
  };

  // Function to determine what to display in the action column
  const renderActionButton = (faculty) => {
    if (faculty.status === "authority_verification_pending") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-white border-2 border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          onClick={() => {
            navigate("/directorcnfverify", {
              state: {
                faculty: {
                  name: faculty.name,
                  id: faculty._id,
                  role: faculty.role,
                  department: faculty.dept,
                  status: "authority_verification_pending",
                },
                portfolioData: {},
                verifiedMarks: {},
              },
            });
          }}
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-700">Verify</span>
        </button>
      );
    } else if (faculty.status === "Portfolio_Mark_pending") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          onClick={() =>
            navigate("/directorverify", {
              state: {
                faculty: {
                  name: faculty.name,
                  id: faculty._id,
                  role: faculty.role,
                  department: faculty.dept,
                },
              },
            })
          }
        >
          <span className="font-semibold text-blue-700">Give Marks</span>
        </button>
      );
    } else {
      return <span className="text-gray-400">-</span>;
    }
  };

  // Update the displayMarks function to handle the object case
  const displayMarks = (faculty) => {
    if (faculty.status === "pending") {
      return "0";
    } else if (typeof faculty.grand_marks === "object") {
      return faculty.grand_marks.grand_total || "N/A";
    } else {
      return faculty.grand_marks || "N/A";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HOD data...</p>
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
      <div>
        <main className="lg:mt-16">
          <div className="max-w-full mx-auto px-4 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header Section */}
              <div className="border-b border-gray-200 px-4 lg:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      HOD Forms
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
                    <div className="flex gap-2">
                      {/* <select
                        value={filters.department}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                      >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select> */}
                    </div>
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
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    aria-label={`Sort by marks ${sortConfig.direction === "asc" ? "ascending" : "descending"}`}
                    title={`Sort by marks ${sortConfig.direction === "asc" ? "low to high" : "high to low"}`}
                  >
                    {sortConfig.direction === "asc" ? (
                      <SortAsc size={16} className="text-blue-600" />
                    ) : (
                      <SortDesc size={16} className="text-blue-600" />
                    )}
                    <span
                      className={
                        sortConfig.key === "marks"
                          ? "font-medium text-blue-700"
                          : ""
                      }
                    >
                      Sort by Marks{" "}
                      {sortConfig.key === "marks"
                        ? sortConfig.direction === "asc"
                          ? "(Low to High)"
                          : "(High to Low)"
                        : ""}
                    </span>
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-gray-600">ID</th>
                      <th className="px-6 py-3 text-gray-600">Name</th>
                      <th className="px-6 py-3 text-gray-600">Department</th>
                      <th className="px-6 py-3 text-gray-600">Role</th>
                      <th className="px-6 py-3 text-gray-600">Total Marks</th>
                      <th className="px-6 py-3 text-gray-600">Status</th>
                      <th className="px-6 py-3 text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((faculty) => (
                        <tr
                          key={faculty._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">{faculty._id}</td>
                          <td className="px-6 py-4 font-medium">
                            {faculty.name}
                          </td>
                          <td className="px-6 py-4">{faculty.dept}</td>
                          <td className="px-6 py-4">{faculty.role}</td>
                          <td className="px-6 py-4">{displayMarks(faculty)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sl font-semibold ${
                                faculty.status === "Done"
                                  ? "bg-green-100 text-green-800"
                                  : faculty.status === "Interaction_pending"
                                    ? "bg-purple-100 text-purple-800"
                                    : faculty.status ===
                                        "authority_verification_pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : faculty.status ===
                                          "verification_pending"
                                        ? "bg-orange-100 text-orange-800"
                                        : faculty.status ===
                                            "Portfolio_Mark_pending"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {faculty.status === "Done"
                                ? "Done"
                                : faculty.status === "Interaction_pending"
                                  ? "Interaction Pending"
                                  : faculty.status ===
                                      "authority_verification_pending"
                                    ? "Authority Verification Pending"
                                    : faculty.status === "verification_pending"
                                      ? "Verification Pending"
                                      : faculty.status ===
                                          "Portfolio_Mark_pending"
                                        ? "Portfolio Mark Pending"
                                        : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {renderActionButton(faculty)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No HOD data available. Try adjusting your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HODForms;
