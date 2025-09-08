import { useState, useEffect, useMemo } from "react";
import {
  Users,
  SortAsc,
  SortDesc,
  FileText,
  Eye,
} from "lucide-react";

const FacultyForms = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    designation: "",
    role: "",
    status: "",
    minMarks: "",
    maxMarks: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);

  // New state for summary statistics
  const [statusSummary, setStatusSummary] = useState({
    done: 0,
    verification_pending: 0,
    authority_verification_pending: 0,
    interaction_pending: 0,
    portfolio_mark_pending: 0,
    portfolio_mark_dean_pending: 0,
    pending: 0,
    total: 0,
  });

  // New state for PDF viewer modal
  const [pdfModal, setPdfModal] = useState({
    isOpen: false,
    pdfUrl: "",
    facultyName: "",
    loading: false,
    loadingProgress: 0,
  });

  // Process verification status
  const processVerificationStatus = (facultyList) => {
    const verifiedFaculty = JSON.parse(
      localStorage.getItem("verifiedFaculty") || "{}"
    );
    return facultyList.map((faculty) => ({
      ...faculty,
      status:
        faculty.status === "SentToDirector"
          ? "SentToDirector"
          : verifiedFaculty[faculty._id]
            ? "SentToDirector"
            : faculty.status,
    }));
  };

  // Fetch faculty data using the all-faculties endpoint
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/all-faculties`
        );
        if (!response.ok) throw new Error("Failed to fetch faculty data");
        const responseData = await response.json();

        // Log the raw data fetched from the database
        // console.log('Fetched faculty data from /all-faculties:', responseData.data);
        // Additionally, fetch and log data for each faculty from /<department>/<user_id>
        responseData.data.forEach(async (faculty) => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_BASE_URL}/${faculty.department}/${faculty._id}`
            );
            if (res.ok) {
              const facultyDetail = await res.json();
              console.log(
                `Fetched detail for ${faculty.name} (${faculty._id}):`,
                facultyDetail
              );
            } else {
              console.warn(
                `Failed to fetch detail for ${faculty.name} (${faculty._id})`
              );
            }
          } catch (err) {
            console.error(
              `Error fetching detail for ${faculty.name} (${faculty._id}):`,
              err
            );
          }
        });

        if (responseData.status === "success") {
          // Only show faculties whose status is 'SentToDirector'
          const regularFaculty = responseData.data.filter(
            (faculty) => faculty.status === "SentToDirector" && faculty.designation === "Faculty"
          );
          // Previous filter (commented out):
          // const regularFaculty = responseData.data.filter(
          //   (faculty) =>
          //     faculty.role !== "HOD" &&
          //     faculty.designation !== "HOD" &&
          //     (faculty.designation === "Faculty" ||
          //       faculty.designation === "Associate Dean")
          // );

          // Calculate summary statistics for each status type
          const summary = {
            done: 0,
            verification_pending: 0,
            authority_verification_pending: 0,
            interaction_pending: 0,
            portfolio_mark_pending: 0,
            portfolio_mark_dean_pending: 0,
            pending: 0,
            total: regularFaculty.length,
          };

          regularFaculty.forEach((faculty) => {
            const status = faculty.status?.toLowerCase() || "pending";

            if (status.includes("done")) {
              summary.done++;
            } else if (status.includes("verification_pending")) {
              summary.verification_pending++;
            } else if (status.includes("authority_verification_pending")) {
              summary.authority_verification_pending++;
            } else if (status.includes("interaction_pending")) {
              summary.interaction_pending++;
            } else if (status.includes("portfolio_mark_dean_pending")) {
              summary.portfolio_mark_dean_pending++;
            } else if (status.includes("portfolio_mark_pending")) {
              summary.portfolio_mark_pending++;
            } else {
              summary.pending++;
            }
          });

          setStatusSummary(summary);
          setDepartments(
            [...new Set(responseData.data.map((f) => f.department))].filter(
              Boolean
            )
          );
          setDesignations(
            [...new Set(responseData.data.map((f) => f.designation))].filter(
              Boolean
            )
          );
          setRoles(
            [...new Set(responseData.data.map((f) => f.role))]
              .filter(Boolean)
              .filter((role) => role !== "HOD")
          );

          // Fetch total marks for each faculty from /<department>/<user_id>/total and add to faculty object
          const facultyWithTotals = await Promise.all(
            regularFaculty.map(async (faculty) => {
              try {
                const res = await fetch(
                  `${import.meta.env.VITE_BASE_URL}/${faculty.department}/${faculty._id}/total`
                );
                if (res.ok) {
                  const totalData = await res.json();
                  return {
                    ...faculty,
                    grand_total: totalData.grand_total?.grand_total ?? null,
                  };
                }
              } catch (err) {
                console.error(`Error fetching total for ${faculty._id}:`, err);
              }
              return faculty;
            })
          );
          setFacultyData(processVerificationStatus(facultyWithTotals));
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

    // Prefer backend total marks if available (similar to HODForms)
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
        // Base filter for SentToDirector and Faculty designation
        const baseFilter = faculty.status === "SentToDirector" && faculty.designation === "Faculty";
        
        if (!baseFilter) return false;

        // Search filter
        const searchMatch =
          faculty._id.toLowerCase().includes(filters.search.toLowerCase()) ||
          (faculty.name &&
            faculty.name.toLowerCase().includes(filters.search.toLowerCase()));

        // Department filter
        const departmentMatch =
          !filters.department || faculty.department === filters.department;

        // Designation filter
        const designationMatch =
          !filters.designation || faculty.designation === filters.designation;

        // Role filter
        const roleMatch =
          !filters.role || faculty.role === filters.role;

        // Status filter
        const statusMatch =
          !filters.status ||
          (filters.status === "done" &&
            (faculty.status?.toLowerCase() === "done" || faculty.status === "Done")) ||
          (filters.status === "interaction_pending" &&
            faculty.status?.toLowerCase().includes("interaction_pending")) ||
          (filters.status === "authority_verification_pending" &&
            faculty.status?.toLowerCase().includes("authority_verification_pending")) ||
          (filters.status === "verification_pending" &&
            faculty.status?.toLowerCase().includes("verification_pending") &&
            !faculty.status?.toLowerCase().includes("authority_verification_pending")) ||
          (filters.status === "portfolio_mark_pending" &&
            faculty.status?.toLowerCase().includes("portfolio_mark_pending")) ||
          (filters.status === "portfolio_mark_dean_pending" &&
            faculty.status?.toLowerCase().includes("portfolio_mark_dean_pending")) ||
          (filters.status === "pending" &&
            (!faculty.status || faculty.status.toLowerCase() === "pending"));

        // Marks filter
        const facultyMarks = getNumericMarks(faculty);
        const marksMatch =
          (!filters.minMarks ||
            filters.minMarks === "" ||
            facultyMarks >= Number(filters.minMarks)) &&
          (!filters.maxMarks ||
            filters.maxMarks === "" ||
            facultyMarks <= Number(filters.maxMarks));

        return searchMatch && departmentMatch && designationMatch && roleMatch && statusMatch && marksMatch;
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

  // Function to generate and view PDF
  const viewFacultyPDF = async (faculty) => {
    // Open modal immediately with loading state
    setPdfModal({
      isOpen: true,
      pdfUrl: "",
      facultyName: faculty.name,
      loading: true,
      loadingProgress: 0,
    });

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setPdfModal((prev) => ({
          ...prev,
          loadingProgress:
            prev.loadingProgress >= 90 ? 90 : prev.loadingProgress + 10,
        }));
      }, 500);

      // Fetch PDF from API
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${faculty.department}/${faculty._id}/generate-doc`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Clear interval and update state with PDF URL
      clearInterval(progressInterval);
      setPdfModal({
        isOpen: true,
        pdfUrl: url,
        facultyName: faculty.name,
        loading: false,
        loadingProgress: 100,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfModal((prev) => ({
        ...prev,
        loading: false,
        loadingProgress: 0,
        error: "Failed to load PDF. Please try again.",
      }));
    }
  };

  // Function to determine what to display in the action column
  const renderActionButton = (faculty) => {
    if (faculty.status === "SentToDirector") {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => viewFacultyPDF(faculty)}
          >
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-700">View PDF</span>
          </button>
          {/* Verify Button */}
          {/* <button
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
          </button> */}
        </div>
      );
    } else {
      return null;
    }
  };

  // Only show marks for authority_verification_pending, interaction_pending, or done; others show 'N/A'
  const displayMarks = (faculty) => {
    const allowedStatuses = [
      "authority_verification_pending",
      "interaction_pending",
      "done",
      "Done",
      "Authority_Verification_Pending",
      "Interaction_pending",
      "SentToDirector"
    ];

    // For SentToDirector status, always show marks if available
    if (faculty.status === "SentToDirector" || allowedStatuses.includes((faculty.status || "").toLowerCase())) {
      // Prefer backend total marks if available (similar to HODForms)
      if (faculty.grand_total) {
        return Number(faculty.grand_total).toFixed(2);
      }

      // Get verified marks and interaction marks
      const verifiedMarks = faculty.portfolio?.grand_total || 0;
      const interactionMarks = faculty.interaction_marks || 0;

      // Get total marks from the data
      const totalMarks =
        faculty.grand_marks?.grand_total ||
        faculty.grand_total ||
        faculty.total_marks ||
        verifiedMarks + interactionMarks;

      // Format and display the total marks
      return totalMarks ? Number(totalMarks).toFixed(2) : "N/A";
    }

    return "N/A";
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
                      Faculty Forms
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

                      {/* Status filter */}
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                      >
                        <option value="">All Statuses</option>
                        <option value="done">Done</option>
                        <option value="interaction_pending">
                          Interaction Pending
                        </option>
                        <option value="authority_verification_pending">
                          Authority Verification Pending
                        </option>
                        <option value="verification_pending">
                          Verification Pending
                        </option>
                        <option value="portfolio_mark_pending">
                          Portfolio Mark Pending
                        </option>
                        <option value="portfolio_mark_dean_pending">
                          Portfolio Dean Mark Pending
                        </option>
                        <option value="pending">Pending</option>
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

                {/* Summary Section */}
                {/* Summary Section - Improved UI */}
                {/* <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
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
                  if (faculty.status === "SentToDirector") {
                    return (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => viewFacultyPDF(faculty)}
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-700">View PDF</span>
                      </button>
                    );
                  }
                  return null;
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
                      filters.status === "portfolio_mark_pending"
                        ? "border-blue-400 shadow-md"
                        : "border-blue-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("portfolio_mark_pending")}
                  >
                    <p className="text-sm text-blue-600 mb-1">
                      Portfolio Mark Pending
                    </p>
                    <p className="text-2xl font-bold text-blue-800 mt-auto">
                      {statusSummary.portfolio_mark_pending}
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
                </div> */}
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
                            {faculty.status === "SentToDirector" ? (
                              <span className="inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sl font-semibold bg-blue-100 text-blue-800">
                                Sent to Director
                              </span>
                            ) : (
                              <span className="inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sl font-semibold bg-gray-100 text-gray-800">
                                {faculty.status === "done" || faculty.status === "Done"
                                  ? "Done"
                                  : faculty.status === "Interaction_pending"
                                    ? "Interaction Pending"
                                    : faculty.status === "authority_verification_pending"
                                      ? "Authority Verification Pending"
                                      : faculty.status === "verification_pending"
                                        ? "Verification Pending"
                                        : faculty.status === "Portfolio_Mark_pending"
                                          ? "Portfolio Mark Pending"
                                          : faculty.status === "Portfolio_Mark_Dean_pending"
                                            ? "Portfolio Dean Mark Pending"
                                            : "Pending"}
                              </span>
                            )}
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

      {/* PDF Modal */}
      {pdfModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {pdfModal.facultyName}'s Appraisal Form
              </h2>
              <button
                onClick={() =>
                  setPdfModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {pdfModal.loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${pdfModal.loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center mt-2 text-gray-600">
                    Loading PDF... {pdfModal.loadingProgress}%
                  </p>
                </div>
              ) : pdfModal.error ? (
                <div className="text-center text-red-500 p-8">
                  {pdfModal.error}
                </div>
              ) : (
                <div className="w-full h-[70vh] border border-gray-300 rounded-lg">
                  <iframe
                    src={pdfModal.pdfUrl}
                    className="w-full h-full rounded-lg"
                    title={`${pdfModal.facultyName}'s Appraisal Form`}
                  />
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              {!pdfModal.loading && pdfModal.pdfUrl && (
                <a
                  href={pdfModal.pdfUrl}
                  download={`faculty_appraisal.pdf`}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FileText size={20} />
                  Download PDF
                </a>
              )}
              <button
                onClick={() =>
                  setPdfModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyForms;
