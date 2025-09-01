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
    designation: "",
    minMarks: "",
    maxMarks: "",
    status: "", // Add this new status filter
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statusSummary, setStatusSummary] = useState({
    done: 0,
    verification_pending: 0,
    interaction_pending: 0,
    authority_verification_pending: 0,
    Portfolio_mark_director_pending: 0,
    pending: 0,
    total: 0,
  });

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

  // Fetch faculty data using the new all-faculties endpoint
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/all-faculties`);
        if (!response.ok) throw new Error("Failed to fetch faculty data");
        const responseData = await response.json();

        if (responseData.status === "success") {
          // Filter HOD and Associate HOD only
          const hodFaculty = responseData.data.filter(
            (faculty) =>
              faculty.role === "HOD" ||
              faculty.designation === "HOD"
          );

          // Calculate status counts for summary
          const summary = {
            done: 0,
            verification_pending: 0,
            interaction_pending: 0,
            authority_verification_pending: 0,
            Portfolio_mark_director_pending: 0,
            pending: 0,
            total: hodFaculty.length,
          };

          hodFaculty.forEach((faculty) => {
            const status = faculty.status?.toLowerCase() || "pending";
            if (status.includes("done")) {
              summary.done++;
            } else if (
              status.includes("verification_pending") &&
              !status.includes("authority_verification_pending")
            ) {
              summary.verification_pending++;
            } else if (status.includes("authority_verification_pending")) {
              summary.authority_verification_pending++;
            } else if (status.includes("interaction_pending")) {
              summary.interaction_pending++;
            } else if (status.includes("Portfolio_mark_director_pending")) {
              summary.Portfolio_mark_director_pending++;
            } else {
              summary.pending++;
            }
          });

          setStatusSummary(summary);
          setDepartments([...new Set(responseData.data.map((f) => f.department))].filter(Boolean));
          setDesignations([...new Set(responseData.data.map((f) => f.designation))].filter(Boolean));

          // Fetch total marks for each HOD from /<department>/<user_id>/total and add to faculty object
          const hodWithTotals = await Promise.all(hodFaculty.map(async (faculty) => {
            try {
              const res = await fetch(`${import.meta.env.VITE_BASE_URL}/${faculty.department}/${faculty._id}/total`);
              if (res.ok) {
                const totalData = await res.json();
                return {
                  ...faculty,
                  grand_total: totalData.grand_total?.grand_total ?? null
                };
              }
            } catch (err) {
              console.error(`Error fetching total for ${faculty._id}:`, err);
            }
            return faculty;
          }));
          setFacultyData(processVerificationStatus(hodWithTotals));
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
    // Prefer backend total marks if available
    if (faculty.grand_total) {
      return Number(faculty.grand_total) || 0;
    }
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
          !filters.department || faculty.department === filters.department;

        const designationMatch =
          !filters.designation || faculty.designation === filters.designation;

        const facultyMarks = getNumericMarks(faculty);

        const marksMatch =
          (!filters.minMarks ||
            filters.minMarks === "" ||
            facultyMarks >= Number(filters.minMarks)) &&
          (!filters.maxMarks ||
            filters.maxMarks === "" ||
            facultyMarks <= Number(filters.maxMarks));

        // Add status filtering
        const statusMatch =
          !filters.status ||
          (filters.status === "done" &&
            faculty.status?.toLowerCase() === "done") ||
          (filters.status === "verification_pending" &&
            faculty.status?.toLowerCase().includes("verification_pending") &&
            !faculty.status
              ?.toLowerCase()
              .includes("authority_verification_pending")) ||
          (filters.status === "authority_verification_pending" &&
            faculty.status
              ?.toLowerCase()
              .includes("authority_verification_pending")) ||
          (filters.status === "interaction_pending" &&
            faculty.status?.toLowerCase().includes("interaction_pending")) ||
          (filters.status === "Portfolio_mark_director_pending" &&
            faculty.status?.toLowerCase().includes("portfolio_mark_director_pending")) ||
          (filters.status === "pending" &&
            (!faculty.status || faculty.status.toLowerCase() === "pending"));

        return (
          searchMatch &&
          departmentMatch &&
          designationMatch &&
          marksMatch &&
          statusMatch
        );
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
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={async () => {
              // Open PDF in new tab
              const url = `${import.meta.env.VITE_BASE_URL}/${faculty.department}/${faculty._id}/generate-doc`;
              window.open(url, "_blank");
            }}
          >
            <span className="font-semibold text-blue-700">View PDF</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-white border-2 border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            onClick={() => {
              navigate("/ConfirmVerifybyDirector", {
                state: {
                  faculty: {
                    name: faculty.name,
                    id: faculty._id,
                    role: faculty.role,
                    department: faculty.department,
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
        </div>
      );
    } else if (faculty.status === "Portfolio_mark_director_pending") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          onClick={() =>
            navigate("/DirectorVerify", {
              state: {
                faculty: {
                  name: faculty.name,
                  id: faculty._id,
                  role: faculty.role,
                  department: faculty.department,
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
    }
    // Prefer backend total marks if available
    if (faculty.grand_total) {
      return Number(faculty.grand_total).toFixed(2);
    }
    if (typeof faculty.grand_marks === "object") {
      return faculty.grand_marks?.grand_total || "N/A";
    } else {
      return faculty.grand_marks || "N/A";
    }
  };

  // Now add a function to handle status card clicks
  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
    }));
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
                      <select
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
                      </select>

                      <select
                        value={filters.designation}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            designation: e.target.value,
                          }))
                        }
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                      >
                        <option value="">All Designations</option>
                        {designations.map((desg) => (
                          <option key={desg} value={desg}>
                            {desg}
                          </option>
                        ))}
                      </select>
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

                {/* Summary Section - Add this */}
                {/* Summary Section - Improved UI */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div
                    className={`bg-blue-50 p-4 rounded-lg border ${
                      filters.status === ""
                        ? "border-blue-400 shadow-md"
                        : "border-blue-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("")}
                  >
                    <p className="text-sm text-blue-600 mb-1">Total Faculty</p>
                    <p className="text-2xl font-bold text-blue-800 mt-auto">
                      {statusSummary.total}
                    </p>
                  </div>

                  <div
                    className={`bg-green-50 p-4 rounded-lg border ${
                      filters.status === "done"
                        ? "border-green-400 shadow-md"
                        : "border-green-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("done")}
                  >
                    <p className="text-sm text-green-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-800 mt-auto">
                      {statusSummary.done}
                    </p>
                  </div>

                  <div
                    className={`bg-yellow-50 p-4 rounded-lg border ${
                      filters.status === "authority_verification_pending"
                        ? "border-yellow-400 shadow-md"
                        : "border-yellow-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() =>
                      handleStatusFilter("authority_verification_pending")
                    }
                  >
                    <p className="text-sm text-yellow-600 mb-1">
                      Authority Verification
                    </p>
                    <p className="text-2xl font-bold text-yellow-800 mt-auto">
                      {statusSummary.authority_verification_pending}
                    </p>
                  </div>

                  <div
                    className={`bg-purple-50 p-4 rounded-lg border ${
                      filters.status === "interaction_pending"
                        ? "border-purple-400 shadow-md"
                        : "border-purple-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("interaction_pending")}
                  >
                    <p className="text-sm text-purple-600 mb-1">
                      Interaction Pending
                    </p>
                    <p className="text-2xl font-bold text-purple-800 mt-auto">
                      {statusSummary.interaction_pending}
                    </p>
                  </div>

                  <div
                    className={`bg-orange-50 p-4 rounded-lg border ${
                      filters.status === "verification_pending"
                        ? "border-orange-400 shadow-md"
                        : "border-orange-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("verification_pending")}
                  >
                    <p className="text-sm text-orange-600 mb-1">
                      Verification Pending
                    </p>
                    <p className="text-2xl font-bold text-orange-800 mt-auto">
                      {statusSummary.verification_pending}
                    </p>
                  </div>

                  <div
                    className={`bg-blue-50 p-4 rounded-lg border ${
                      filters.status === "Portfolio_mark_director_pending"
                        ? "border-blue-400 shadow-md"
                        : "border-blue-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("Portfolio_mark_director_pending")}
                  >
                    <p className="text-sm text-blue-600 mb-1">
                      Portfolio Mark Pending
                    </p>
                    <p className="text-2xl font-bold text-blue-800 mt-auto">
                      {statusSummary.Portfolio_mark_director_pending}
                    </p>
                  </div>

                  <div
                    className={`bg-indigo-50 p-4 rounded-lg border ${
                      filters.status === "portfolio_mark_dean_pending"
                        ? "border-indigo-400 shadow-md"
                        : "border-indigo-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() =>
                      handleStatusFilter("portfolio_mark_dean_pending")
                    }
                  >
                    <p className="text-sm text-indigo-600 mb-1">
                      Dean Mark Pending
                    </p>
                    <p className="text-2xl font-bold text-indigo-800 mt-auto">
                      {statusSummary.portfolio_mark_dean_pending}
                    </p>
                  </div>

                  <div
                    className={`bg-gray-50 p-4 rounded-lg border ${
                      filters.status === "pending"
                        ? "border-gray-400 shadow-md"
                        : "border-gray-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("pending")}
                  >
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-800 mt-auto">
                      {statusSummary.pending}
                    </p>
                  </div>
                </div>

                {/* Add an indicator if any filter is active */}
                {filters.status && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      Filtered by status:
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {filters.status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, status: "" }))
                        }
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-gray-600">ID</th>
                      <th className="px-6 py-3 text-gray-600">Name</th>
                      <th className="px-6 py-3 text-gray-600">Department</th>
                      <th className="px-6 py-3 text-gray-600">Designation</th>
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
                          <td className="px-6 py-4">{faculty.department}</td>
                          <td className="px-6 py-4">{faculty.designation}</td>
                          <td className="px-6 py-4">{faculty.role}</td>
                          <td className="px-6 py-4">{displayMarks(faculty)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sl font-semibold ${
                                faculty.status === "done"
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
                                            "Portfolio_mark_director_pending"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {faculty.status === "done"
                                ? "Done"
                                : faculty.status === "Interaction_pending"
                                  ? "Interaction Pending"
                                  : faculty.status ===
                                      "authority_verification_pending"
                                    ? "Authority Verification Pending"
                                    : faculty.status === "verification_pending"
                                      ? "Verification Pending"
                                      : faculty.status ===
                                          "Portfolio_mark_director_pending"
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
                          colSpan="8"
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
