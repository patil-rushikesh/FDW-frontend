import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Users, CheckCircle2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const normalizeStatus = (status) => (status || "").toLowerCase();

const DeanForms = () => {
  const navigate = useNavigate();
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    designation: "",
    minMarks: "",
    maxMarks: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [pdfModal, setPdfModal] = useState({
    isOpen: false,
    pdfUrl: "",
    facultyName: "",
    loading: false,
    loadingProgress: 0,
    error: null,
  });

  const processVerificationStatus = useCallback((facultyList) => {
    const verifiedFaculty = JSON.parse(localStorage.getItem("verifiedHODs") || "{}");
    return facultyList.map((faculty) => ({
      ...faculty,
      status:
        normalizeStatus(faculty.status) === "authority_verification_pending"
          ? "authority_verification_pending"
          : verifiedFaculty[faculty._id]
            ? "authority_verification_pending"
            : faculty.status,
    }));
  }, []);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/all-faculties`);
        if (!response.ok) throw new Error("Failed to fetch faculty data");
        const responseData = await response.json();
        if (responseData.status === "success") {
          const deanFaculty = responseData.data.filter(
            (faculty) => faculty.role === "Dean" || faculty.designation === "Dean"
          );
          const deanWithTotals = await Promise.all(
            deanFaculty.map(async (faculty) => {
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
              } catch {}
              return faculty;
            })
          );
          setFacultyData(processVerificationStatus(deanWithTotals));
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
  }, [processVerificationStatus]);

  const departments = useMemo(
    () => Array.from(new Set(facultyData.map((f) => f.department).filter(Boolean))).sort(),
    [facultyData]
  );
  const designations = useMemo(
    () => Array.from(new Set(facultyData.map((f) => f.designation).filter(Boolean))).sort(),
    [facultyData]
  );

  const statusSummary = useMemo(() => {
    const summary = {
      done: 0,
      verification_pending: 0,
      interaction_pending: 0,
      authority_verification_pending: 0,
      Portfolio_mark_director_pending: 0,
      portfolio_mark_dean_pending: 0,
      pending: 0,
      total: facultyData.length,
    };
    facultyData.forEach((faculty) => {
      const status = normalizeStatus(faculty.status);
      if (status.includes("done")) summary.done++;
      else if (status.includes("authority_verification_pending")) summary.authority_verification_pending++;
      else if (status.includes("verification_pending")) summary.verification_pending++;
      else if (status.includes("interaction_pending")) summary.interaction_pending++;
      else if (status.includes("portfolio_mark_director_pending")) summary.Portfolio_mark_director_pending++;
      else if (status.includes("portfolio_mark_dean_pending")) summary.portfolio_mark_dean_pending++;
      else summary.pending++;
    });
    return summary;
  }, [facultyData]);

  const getNumericMarks = useCallback((faculty) => {
    if (!faculty || normalizeStatus(faculty.status) === "pending") return 0;
    if (faculty.grand_total) return Number(faculty.grand_total) || 0;
    const gm = faculty.grand_marks;
    if (!gm) return 0;
    if (typeof gm === "object") return Number(gm.grand_total || 0);
    if (typeof gm === "number") return gm;
    if (typeof gm === "string" && !isNaN(gm)) return Number(gm);
    return 0;
  }, []);

  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        const search = filters.search.toLowerCase();
        const searchMatch =
          faculty._id.toLowerCase().includes(search) ||
          (faculty.name && faculty.name.toLowerCase().includes(search));
        const departmentMatch = !filters.department || faculty.department === filters.department;
        const designationMatch = !filters.designation || faculty.designation === filters.designation;
        const marks = getNumericMarks(faculty);
        const marksMatch =
          (!filters.minMarks || marks >= Number(filters.minMarks)) &&
          (!filters.maxMarks || marks <= Number(filters.maxMarks));
        const status = normalizeStatus(faculty.status);
        const statusMatch =
          !filters.status ||
          (filters.status === "done" && status === "done") ||
          (filters.status === "verification_pending" && status.includes("verification_pending") && !status.includes("authority_verification_pending")) ||
          (filters.status === "authority_verification_pending" && status.includes("authority_verification_pending")) ||
          (filters.status === "interaction_pending" && status.includes("interaction_pending")) ||
          (filters.status === "Portfolio_mark_director_pending" && status.includes("portfolio_mark_director_pending")) ||
          (filters.status === "portfolio_mark_dean_pending" && status.includes("portfolio_mark_dean_pending")) ||
          (filters.status === "pending" && (!status || status === "pending"));
        return searchMatch && departmentMatch && designationMatch && marksMatch && statusMatch;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        if (sortConfig.key === "marks") {
          const ma = getNumericMarks(a);
          const mb = getNumericMarks(b);
          return sortConfig.direction === "asc" ? ma - mb : mb - ma;
        }
        return 0;
      });
  }, [facultyData, filters, sortConfig, getNumericMarks]);

  const toggleSort = () => {
    setSortConfig((current) => ({
      key: "marks",
      direction: current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const viewFacultyPDF = async (faculty) => {
    setPdfModal({
      isOpen: true,
      pdfUrl: "",
      facultyName: faculty.name,
      loading: true,
      loadingProgress: 0,
      error: null,
    });

    try {
      const progressInterval = setInterval(() => {
        setPdfModal((prev) => ({
          ...prev,
          loadingProgress:
            prev.loadingProgress >= 90 ? 90 : prev.loadingProgress + 10,
        }));
      }, 500);

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${faculty.department}/${faculty._id}/generate-doc`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      clearInterval(progressInterval);
      setPdfModal({
        isOpen: true,
        pdfUrl: url,
        facultyName: faculty.name,
        loading: false,
        loadingProgress: 100,
        error: null,
      });
    } catch (error) {
      setPdfModal((prev) => ({
        ...prev,
        loading: false,
        loadingProgress: 0,
        error: "Failed to load PDF. Please try again.",
      }));
    }
  };

  const renderActionButton = (faculty) => {
    const status = normalizeStatus(faculty.status);
    if (status === "authority_verification_pending") {
      return (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => viewFacultyPDF(faculty)}
          >
            <Eye className="h-4 w-4 text-blue-600" />
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
    }
    if (status === "portfolio_mark_director_pending") {
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
    }
    if (status === "done") {
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
    return <span className="text-gray-400">-</span>;
  };

  const displayMarks = (faculty) => {
    const status = normalizeStatus(faculty.status);
    const allowedStatuses = [
      "authority_verification_pending",
      "interaction_pending",
      "done",
    ];
    if (!allowedStatuses.includes(status)) return "N/A";
    if (faculty.grand_total !== undefined && faculty.grand_total !== null) {
      return Number(faculty.grand_total).toFixed(2);
    }
    if (faculty.grand_marks?.grand_total !== undefined && faculty.grand_marks?.grand_total !== null) {
      return faculty.grand_marks.grand_total;
    }
    if (faculty.grand_marks !== undefined && faculty.grand_marks !== null) {
      return faculty.grand_marks;
    }
    return "N/A";
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
    }));
  };

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
                    <h2 className="text-xl font-semibold text-gray-800">Dean Forms</h2>
                    {loading && (
                      <div className="ml-3 flex items-center gap-2" aria-hidden="true" title="Loading...">
                        <div className="animate-spin h-4 w-4 rounded-full border-b-2 border-blue-600" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-2">
                      <select
                        value={filters.department}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        className={`p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-auto ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        disabled={loading}
                      >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
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
                      className={`p-2 bg-white border border-gray-300 rounded-lg text-sm w-20 sm:w-24 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={loading}
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
                      className={`p-2 bg-white border border-gray-300 rounded-lg text-sm w-20 sm:w-24 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="search"
                      placeholder="Search ID or Name"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className={`p-2 bg-white border border-gray-300 rounded-lg text-sm w-full sm:w-64 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={loading}
                    />
                  </div>
                </div>
                {/* Summary Section */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div
                    className={`bg-blue-50 p-4 rounded-lg border ${
                      filters.status === "" ? "border-blue-400 shadow-md" : "border-blue-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("")}
                  >
                    <p className="text-sm text-blue-600 mb-1">Total Faculty</p>
                    <p className="text-2xl font-bold text-blue-800 mt-auto">{statusSummary.total}</p>
                  </div>
                  <div
                    className={`bg-green-50 p-4 rounded-lg border ${
                      filters.status === "done" ? "border-green-400 shadow-md" : "border-green-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("done")}
                  >
                    <p className="text-sm text-green-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-800 mt-auto">{statusSummary.done}</p>
                  </div>
                  <div
                    className={`bg-yellow-50 p-4 rounded-lg border ${
                      filters.status === "authority_verification_pending" ? "border-yellow-400 shadow-md" : "border-yellow-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("authority_verification_pending")}
                  >
                    <p className="text-sm text-yellow-600 mb-1">Authority Verification</p>
                    <p className="text-2xl font-bold text-yellow-800 mt-auto">{statusSummary.authority_verification_pending}</p>
                  </div>
                  <div
                    className={`bg-purple-50 p-4 rounded-lg border ${
                      filters.status === "interaction_pending" ? "border-purple-400 shadow-md" : "border-purple-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("interaction_pending")}
                  >
                    <p className="text-sm text-purple-600 mb-1">Interaction Pending</p>
                    <p className="text-2xl font-bold text-purple-800 mt-auto">{statusSummary.interaction_pending}</p>
                  </div>
                  <div
                    className={`bg-orange-50 p-4 rounded-lg border ${
                      filters.status === "verification_pending" ? "border-orange-400 shadow-md" : "border-orange-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("verification_pending")}
                  >
                    <p className="text-sm text-orange-600 mb-1">Verification Pending</p>
                    <p className="text-2xl font-bold text-orange-800 mt-auto">{statusSummary.verification_pending}</p>
                  </div>
                  <div
                    className={`bg-blue-50 p-4 rounded-lg border ${
                      filters.status === "Portfolio_mark_director_pending" ? "border-blue-400 shadow-md" : "border-blue-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("Portfolio_mark_director_pending")}
                  >
                    <p className="text-sm text-blue-600 mb-1">Portfolio Mark Pending</p>
                    <p className="text-2xl font-bold text-blue-800 mt-auto">{statusSummary.Portfolio_mark_director_pending}</p>
                  </div>
                  <div
                    className={`bg-gray-50 p-4 rounded-lg border ${
                      filters.status === "pending" ? "border-gray-400 shadow-md" : "border-gray-200"
                    } cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between h-full`}
                    onClick={() => handleStatusFilter("pending")}
                  >
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-800 mt-auto">{statusSummary.pending}</p>
                  </div>
                </div>
              </div>
              {/* Table Section */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full text-sm text-left" aria-busy={loading}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-gray-600">ID</th>
                      <th className="px-6 py-3 text-gray-600">Name</th>
                      <th className="px-6 py-3 text-gray-600">Department</th>
                      <th className="px-6 py-3 text-gray-600">Designation</th>
                      <th className="px-6 py-3 text-gray-600">Role</th>
                      <th className="px-6 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Total Marks</span>
                          <button
                            className="p-1 rounded-md text-gray-500 hover:text-gray-700"
                            onClick={toggleSort}
                            title={`Sort by marks (${sortConfig.direction})`}
                            disabled={loading}
                          >
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </button>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-gray-600">Status</th>
                      <th className="px-6 py-3 text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
                            <p className="text-gray-600">Loading Dean data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((faculty) => (
                        <tr key={faculty._id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">{faculty._id}</td>
                          <td className="px-6 py-4 font-medium">{faculty.name}</td>
                          <td className="px-6 py-4">{faculty.department}</td>
                          <td className="px-6 py-4">{faculty.designation}</td>
                          <td className="px-6 py-4">{faculty.role}</td>
                          <td className="px-6 py-4">{displayMarks(faculty)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sl font-semibold ${
                                normalizeStatus(faculty.status) === "done"
                                  ? "bg-green-100 text-green-800"
                                  : normalizeStatus(faculty.status) === "interaction_pending"
                                  ? "bg-purple-100 text-purple-800"
                                  : normalizeStatus(faculty.status) === "authority_verification_pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : normalizeStatus(faculty.status) === "verification_pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : normalizeStatus(faculty.status) === "portfolio_mark_director_pending"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {normalizeStatus(faculty.status) === "done"
                                ? "Done"
                                : normalizeStatus(faculty.status) === "interaction_pending"
                                  ? "Interaction Pending"
                                  : normalizeStatus(faculty.status) === "authority_verification_pending"
                                    ? "Authority Verification Pending"
                                    : normalizeStatus(faculty.status) === "verification_pending"
                                      ? "Verification Pending"
                                      : normalizeStatus(faculty.status) === "portfolio_mark_director_pending"
                                        ? "Portfolio Mark Pending"
                                        : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4">{renderActionButton(faculty)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          No Dean data available. Try adjusting your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeanForms;
