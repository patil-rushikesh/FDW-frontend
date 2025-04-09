import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FacultyFormsList = () => {
  const navigate = useNavigate();
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState(""); // Remove default value
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    minMarks: "",
    maxMarks: "",
    status: "", // Add status filter
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  // Add status summary state
  const [statusSummary, setStatusSummary] = useState({
    done: 0,
    verification_pending: 0,
    interaction_pending: 0,
    authority_verification_pending: 0,
    portfolio_mark_pending: 0,
    portfolio_mark_dean_pending: 0,
    sent_to_director: 0, // Add this for the new status
    pending: 0,
    total: 0,
  });

  // Add this state near the top with your other state declarations
  const [showAllStatuses, setShowAllStatuses] = useState(false);

  // Add this useEffect to get HOD's department when component mounts
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (userData && userData.dept) {
      setDepartment(userData.dept);
    }
  }, []);

  // Add this to where you process the faculty data (in the useEffect where you fetch faculty data)
  // Modified processVerificationStatus to maintain authority_verification_pending status
  const processVerificationStatus = (facultyList) => {
    const verifiedFaculty = JSON.parse(
      localStorage.getItem("verifiedFaculty") || "{}"
    );
    return facultyList.map((faculty) => ({
      ...faculty,
      // Only change status if it's not "authority_verification_pending"
      status:
        faculty.status === "authority_verification_pending"
          ? "authority_verification_pending"
          : verifiedFaculty[faculty._id]
            ? "authority_verification_pending"
            : faculty.status,
    }));
  };

  // Modify the fetch faculty data useEffect to calculate status summary
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        // Only fetch if department exists
        if (!department) return;

        setLoading(true);

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/faculty/${department}`
        );
        console.log("ENV LINK: " + import.meta.env.VITE_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch faculty data");
        const responseData = await response.json();
        if (responseData.status === "success") {
          // Filter regular faculty only - exclude Admin role
          const regularFaculty = responseData.data.filter(
            (faculty) =>
              (faculty.designation === "Faculty" ||
                faculty.designation === "Associate Dean") &&
              faculty.role !== "Admin" // Add this condition to exclude Admin role
          );

          // Calculate status counts for summary
          const summary = {
            done: 0,
            verification_pending: 0,
            interaction_pending: 0,
            authority_verification_pending: 0,
            portfolio_mark_pending: 0,
            portfolio_mark_dean_pending: 0,
            pending: 0,
            total: regularFaculty.length,
          };

        regularFaculty.forEach((faculty) => {
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
          } else if (status.includes("portfolio_mark_dean_pending")) {
            summary.portfolio_mark_dean_pending++;
          } else if (status.includes("portfolio_mark_pending")) {
            summary.portfolio_mark_pending++;
          } else if (status.includes("sent_to_director") || status.includes("senttodirector")) {
            summary.sent_to_director++;
          } else {
            summary.pending++;
          }
        });
        setStatusSummary(summary);

          setFacultyData(processVerificationStatus(responseData.data));
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
  }, [department]);

  // Modify the departments array to only show the HOD's department
  const departments = useMemo(() => {
    return department ? [department] : [];
  }, [department]);

  const roles = ["Professor", "Associate Professor", "Assistant Professor"];

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

  // Update the filteredData useMemo function with status filtering
  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        // First check if the faculty has an allowed designation
        const allowedDesignation =
          faculty.designation === "Faculty" ||
          faculty.designation === "Associate Dean";

        // Exclude Admin role
        if (!allowedDesignation || faculty.role === "Admin") return false;

        const searchMatch =
          faculty._id.toLowerCase().includes(filters.search.toLowerCase()) ||
          faculty.name?.toLowerCase().includes(filters.search.toLowerCase());
        const roleMatch = !filters.role || faculty.role === filters.role;

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
  (filters.status === "portfolio_mark_pending" &&
    faculty.status?.toLowerCase().includes("portfolio_mark_pending") &&
    !faculty.status
      ?.toLowerCase()
      .includes("portfolio_mark_dean_pending")) ||
  (filters.status === "portfolio_mark_dean_pending" &&
    faculty.status
      ?.toLowerCase()
      .includes("portfolio_mark_dean_pending")) ||
  (filters.status === "sent_to_director" &&
    faculty.status?.toLowerCase().includes("senttodirector")) ||
  (filters.status === "pending" &&
    (!faculty.status || faculty.status.toLowerCase() === "pending"));

        return searchMatch && roleMatch && marksMatch && statusMatch;
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

   console.log("Filtered Data: ", filteredData); // Debugging line

  const toggleSort = () => {
    setSortConfig((current) => ({
      key: "marks",
      direction: current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Add function to handle status filter clicks
  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
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
        localStorage.getItem("verifiedFaculty") || "{}"
      );
      allVerifications[id] = {
        verifiedAt: new Date().toISOString(),
        verifiedBy: JSON.parse(localStorage.getItem("userData"))._id,
      };
      localStorage.setItem("verifiedFaculty", JSON.stringify(allVerifications));
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
            navigate("/hodcnfverify", {
              state: {
                faculty: {
                  name: faculty.name,
                  id: faculty._id,
                  role: faculty.role,
                  department: department,
                  designation:faculty.designation,
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
            navigate("/hodverify", {
              state: {
                faculty: {
                  name: faculty.name,
                  id: faculty._id,
                  role: faculty.role,
                  department: department,
                  designation: faculty.designation,
                },
              },
            })
          }
        >
          <span className="font-semibold text-blue-700">Give Marks</span>
        </button>
      );
    } else if (faculty.status === "SentToDirector") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-teal-700 bg-white border-2 border-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors cursor-not-allowed opacity-70"
          disabled
        >
          <span className="font-semibold text-teal-700">Sent to Director</span>
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
      // If grand_marks is an object, return the grand_total property or a default value
      return faculty.grand_marks.grand_total || "N/A";
    } else {
      // If grand_marks is a number or undefined
      return faculty.grand_marks || "N/A";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty data...</p>
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
                      Faculty Forms - {department}
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
                        value={filters.role}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                      >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
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

                {/* Summary Section - Improved UI */}
                <div className="mt-6">
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Primary Status Cards - Always visible */}
                    <div
                      className={`bg-blue-50 p-3 rounded-lg border ${
                        filters.status === ""
                          ? "border-blue-400 shadow-md"
                          : "border-blue-200"
                      } cursor-pointer hover:shadow-md transition-shadow w-44`}
                      onClick={() => handleStatusFilter("")}
                    >
                      <p className="text-xs text-blue-600 mb-1">
                        Total Faculty
                      </p>
                      <p className="text-xl font-bold text-blue-800">
                        {statusSummary.total}
                      </p>
                    </div>

                    <div
                      className={`bg-green-50 p-3 rounded-lg border ${
                        filters.status === "done"
                          ? "border-green-400 shadow-md"
                          : "border-green-200"
                      } cursor-pointer hover:shadow-md transition-shadow w-44`}
                      onClick={() => handleStatusFilter("done")}
                    >
                      <p className="text-xs text-green-600 mb-1">Completed</p>
                      <p className="text-xl font-bold text-green-800">
                        {statusSummary.done}
                      </p>
                    </div>

                    {/* Show More Button */}
                    <button
                      onClick={() => setShowAllStatuses(!showAllStatuses)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {showAllStatuses ? (
                        <>
                          <ChevronUp size={16} />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Show Details</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expandable Status Cards */}
                  {showAllStatuses && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 animate-fadeIn">
                      <div
                        className={`bg-gray-50 p-3 rounded-lg border ${
                          filters.status === "pending"
                            ? "border-gray-400 shadow-md"
                            : "border-gray-200"
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() => handleStatusFilter("pending")}
                        title="Pending – The faculty member has not yet filled the form."
                      >
                        <p className="text-xs text-gray-600 mb-1">Pending</p>
                        <p className="text-xl font-bold text-gray-800">
                          {statusSummary.pending}
                        </p>
                      </div>

                      <div
                        className={`bg-yellow-50 p-3 rounded-lg border ${
                          filters.status === "authority_verification_pending"
                            ? "border-yellow-400 shadow-md"
                            : "border-yellow-200"
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() =>
                          handleStatusFilter("authority_verification_pending")
                        }
                        title="Authority Verification Pending – The Head of Department (HoD) needs to review the form and assign the marks."
                      >
                        <p className="text-xs text-yellow-600 mb-1">
                          Authority Verification
                        </p>
                        <p className="text-xl font-bold text-yellow-800">
                          {statusSummary.authority_verification_pending}
                        </p>
                      </div>

                      <div
                        className={`bg-purple-50 p-3 rounded-lg border ${
                          filters.status === "interaction_pending"
                            ? "border-purple-400 shadow-md"
                            : "border-purple-200"
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() =>
                          handleStatusFilter("interaction_pending")
                        }
                        title="Interaction Pending – Faculty interaction with another faculty member is pending."
                      >
                        <p className="text-xs text-purple-600 mb-1">
                          Interaction Pending
                        </p>
                        <p className="text-xl font-bold text-purple-800">
                          {statusSummary.interaction_pending}
                        </p>
                      </div>

                      <div
                        className={`bg-orange-50 p-3 rounded-lg border ${
                          filters.status === "verification_pending"
                            ? "border-orange-400 shadow-md"
                            : "border-orange-200"
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() =>
                          handleStatusFilter("verification_pending")
                        }
                        title="Verification Pending – Verification of the research paper or Part B is still pending."
                      >
                        <p className="text-xs text-orange-600 mb-1">
                          Verification Pending
                        </p>
                        <p className="text-xl font-bold text-orange-800">
                          {statusSummary.verification_pending}
                        </p>
                      </div>

                      <div
                        className={`bg-blue-50 p-3 rounded-lg border ${
                          filters.status === "portfolio_mark_pending"
                            ? "border-blue-400 shadow-md"
                            : "border-blue-200"
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() =>
                          handleStatusFilter("portfolio_mark_pending")
                        }
                        title="Portfolio Mark Pending – The HoD needs to review and assign marks for the faculty's portfolio."
                      >
                        <p className="text-xs text-blue-600 mb-1">
                          Portfolio Mark Pending
                        </p>
                        <p className="text-xl font-bold text-blue-800">
                          {statusSummary.portfolio_mark_pending}
                        </p>
                      </div>

                      <div
                        className={`bg-indigo-50 p-3 rounded-lg border ${
                          filters.status === "portfolio_mark_dean_pending"
                            ? "border-indigo-400 shadow-md"
                            : "border-indigo-200"
                        } cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={() =>
                          handleStatusFilter("portfolio_mark_dean_pending")
                        }
                        title="Portfolio Mark Dean Pending – The Dean has not yet assigned marks for the faculty's portfolio."
                      >
                        <p className="text-xs text-indigo-600 mb-1">
                          Dean Mark Pending
                        </p>
                        <p className="text-xl font-bold text-indigo-800">
                          {statusSummary.portfolio_mark_dean_pending}
                        </p>
                      </div>
                    </div>
                  )}
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
                      <th className="px-6 py-3 text-gray-600">Designation</th>
                      <th className="px-6 py-3 text-gray-600">Role</th>
                      <th className="px-6 py-3 text-gray-600">Total Marks</th>
                      <th className="px-6 py-3 text-gray-600">Final Verified Marks</th>
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
                          <td className="px-6 py-4">{faculty.designation}</td>
                          <td className="px-6 py-4">{faculty.role}</td>
                          <td className="px-6 py-4">{displayMarks(faculty)}</td>
                          <td className="px-6 py-4">{faculty.grand_verified_marks}</td>
                          <td className="px-6 py-4">
                          <span
  className={`inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sl font-semibold ${
    faculty.status === "done"
      ? "bg-green-100 text-green-800"
      : faculty.status === "Interaction_pending"
        ? "bg-purple-100 text-purple-800"
        : faculty.status === "authority_verification_pending"
          ? "bg-yellow-100 text-yellow-800"
          : faculty.status === "verification_pending"
            ? "bg-orange-100 text-orange-800"
            : faculty.status === "Portfolio_Mark_pending"
              ? "bg-blue-100 text-blue-800"
              : faculty.status === "Portfolio_Mark_Dean_pending"
                ? "bg-indigo-100 text-indigo-800"
                : faculty.status === "SentToDirector"
                  ? "bg-teal-100 text-teal-800"
                  : "bg-gray-100 text-gray-800"
  }`}
>
  {faculty.status === "done"
    ? "Done"
    : faculty.status === "Interaction_pending"
      ? "Interaction Pending"
      : faculty.status === "authority_verification_pending"
        ? "HOD Verification Pending"
        : faculty.status === "verification_pending"
          ? "Section B Verification Pending"
          : faculty.status === "Portfolio_Mark_pending"
            ? "HOD Portfolio Mark Pending"
            : faculty.status === "Portfolio_Mark_Dean_pending"
              ? "Dean Portfolio Mark Pending"
              : faculty.status === "SentToDirector"
                ? "Sent To Director"
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
                          No faculty data available. Try adjusting your filters.
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

export default FacultyFormsList;
