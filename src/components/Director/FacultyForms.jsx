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

        if (responseData.status === "success") {
          // Only show faculties whose status is 'SentToDirector'
          const regularFaculty = responseData.data.filter(
            (faculty) => faculty.status === "SentToDirector" && faculty.designation === "Faculty"
          );
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
          console.log(
            "Faculty data after adding total marks:",
            facultyWithTotals
          );
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

  // Helper for status normalization
  const normalizeStatus = (status) => (status || "").toLowerCase();

  // Optimized filteredData: apply all filters, not just search
  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        // Search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          if (
            !faculty._id?.toLowerCase().includes(search) &&
            !faculty.name?.toLowerCase().includes(search)
          ) {
            return false;
          }
        }
        // Department filter
        if (filters.department && faculty.department !== filters.department) return false;
        // Designation filter
        if (filters.designation && faculty.designation !== filters.designation) return false;
        // Role filter
        if (filters.role && faculty.role !== filters.role) return false;
        // Status filter
        if (filters.status && normalizeStatus(faculty.status) !== filters.status) return false;
        // Marks filter
        const marks = faculty.grand_total !== undefined && faculty.grand_total !== null
          ? Number(faculty.grand_total)
          : 0;
        if (filters.minMarks && marks < Number(filters.minMarks)) return false;
        if (filters.maxMarks && marks > Number(filters.maxMarks)) return false;
        return true;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        if (sortConfig.key === "marks") {
          const marksA = Number(a.grand_total) || 0;
          const marksB = Number(b.grand_total) || 0;
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
    const status = normalizeStatus(faculty.status);
    // Show "Faculty View PDF" if status is "done"
    if (status === "done") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          onClick={() => viewFacultyPDF(faculty)}
        >
          <Eye className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-blue-700">Faculty View PDF</span>
        </button>
      );
    }
    // Show "View PDF" if status is "SentToDirector"
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
  };

  // Calculate total marks (same logic as HOD/Dean forms)
  const calculateTotalMarks = (faculty) => {
    // Prefer backend grand_total if available
    if (faculty.grand_total !== undefined && faculty.grand_total !== null) {
      return Number(faculty.grand_total).toFixed(2);
    }
    // Try grand_marks.grand_total if present
    if (
      faculty.grand_marks &&
      typeof faculty.grand_marks === "object" &&
      faculty.grand_marks.grand_total !== undefined &&
      faculty.grand_marks.grand_total !== null
    ) {
      return Number(faculty.grand_marks.grand_total).toFixed(2);
    }
    // Fallback to grand_marks if it's a number/string
    if (
      faculty.grand_marks !== undefined &&
      faculty.grand_marks !== null &&
      (typeof faculty.grand_marks === "number" ||
        (typeof faculty.grand_marks === "string" && !isNaN(faculty.grand_marks)))
    ) {
      return Number(faculty.grand_marks).toFixed(2);
    }
    // Fallback to total_marks if present
    if (faculty.total_marks !== undefined && faculty.total_marks !== null) {
      return Number(faculty.total_marks).toFixed(2);
    }
    // Fallback to portfolio/interactions sum if present
    const verifiedMarks = faculty.portfolio?.grand_total || 0;
    const interactionMarks = faculty.interaction_marks || 0;
    const sum = Number(verifiedMarks) + Number(interactionMarks);
    return sum > 0 ? sum.toFixed(2) : "N/A";
  };

  // Update displayMarks to use calculateTotalMarks
  const displayMarks = (faculty) => {
    const allowedStatuses = [
      "authority_verification_pending",
      "interaction_pending",
      "done",
      "Done",
      "Authority_Verification_Pending",
      "Interaction_pending"
    ];
    if (!allowedStatuses.includes((faculty.status || "").toLowerCase())) {
      return "N/A";
    }
    return calculateTotalMarks(faculty);
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
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 space-y-8">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              {/* Header Section */}
              <div className="border-b border-gray-200 px-4 lg:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Faculty Forms
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-48"
                    />
                    <select
                      value={filters.department}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
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
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm"
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
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-20"
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
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm w-20"
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
                      <th className="px-4 py-3 text-gray-600">ID</th>
                      <th className="px-4 py-3 text-gray-600">Name</th>
                      <th className="px-4 py-3 text-gray-600">Department</th>
                      <th className="px-4 py-3 text-gray-600">Designation</th>
                      <th className="px-4 py-3 text-gray-600">Role</th>
                      <th className="px-4 py-3 text-gray-600">Total Marks</th>
                      <th className="px-4 py-3 text-gray-600">Status</th>
                      <th className="px-4 py-3 text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((faculty) => (
                        <tr key={faculty._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{faculty._id}</td>
                          <td className="px-4 py-3 font-medium">{faculty.name}</td>
                          <td className="px-4 py-3">{faculty.department}</td>
                          <td className="px-4 py-3">{faculty.designation}</td>
                          <td className="px-4 py-3">{faculty.role}</td>
                          <td className="px-4 py-3">
                            {faculty.grand_total !== undefined && faculty.grand_total !== null
                              ? Number(faculty.grand_total).toFixed(2)
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {faculty.status === "SentToDirector" ? (
                              <span className="inline-block min-w-[120px] text-center px-3 py-1 rounded-full text-sl font-semibold bg-blue-100 text-blue-800">
                                Sent to Director
                              </span>
                            ) : normalizeStatus(faculty.status) === "done" ? (
                              <span className="inline-block min-w-[120px] text-center px-3 py-1 rounded-full text-sl font-semibold bg-green-100 text-green-800">
                                Done
                              </span>
                            ) : (
                              <span className="inline-block min-w-[120px] text-center px-3 py-1 rounded-full text-sl font-semibold bg-gray-100 text-gray-800">
                                {faculty.status}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
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
                {pdfModal.facultyName}&apos;s Appraisal Form
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
