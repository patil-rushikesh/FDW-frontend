import React, { useState, useEffect } from "react";
import { BarChart2, Download, Loader, RefreshCw } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const Summary = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDepartmentSummary = async () => {
    try {
      setLoading(true);

      // Use static departments array instead of API call
      const departments = [
        { name: "Computer" },
        { name: "IT" },
        { name: "Mechanical" },
        { name: "Civil" },
        { name: "ENTC" },
        { name: "Computer(Regional)" },
        { name: "AIML" },
        { name: "ASH" },
      ];

      // For each department, fetch faculty data and calculate status counts
      const departmentsWithSummary = await Promise.all(
        departments.map(async (dept) => {
          try {
            const facultyResponse = await fetch(
              `${import.meta.env.VITE_BASE_URL}/faculty/${dept.name}`
            );

            if (!facultyResponse.ok) {
              return {
                name: dept.name,
                summary: createEmptySummary(),
                error: "Failed to fetch faculty data",
              };
            }

            const responseData = await facultyResponse.json();

            if (responseData.status !== "success") {
              return {
                name: dept.name,
                summary: createEmptySummary(),
                error: "API returned an error",
              };
            }

            // Calculate status summary like in FacultyFormsList.jsx
            const summary = calculateStatusSummary(responseData.data);

            return {
              name: dept.name,
              summary,
              error: null,
            };
          } catch (err) {
            return {
              name: dept.name,
              summary: createEmptySummary(),
              error: err.message,
            };
          }
        })
      );

      setDepartmentData(departmentsWithSummary);
    } catch (err) {
      setError("Error fetching summary data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create empty summary object
  const createEmptySummary = () => ({
    done: 0,
    SentToDirector: 0,
    verification_pending: 0,
    interaction_pending: 0,
    authority_verification_pending: 0,
    portfolio_mark_pending: 0,
    portfolio_mark_dean_pending: 0,
    pending: 0,
    total: 0,
  });

  // Helper function to calculate status summary
// Helper function to calculate status summary
const calculateStatusSummary = (facultyList) => {
  const summary = createEmptySummary();

  // Filter regular faculty only - exclude Admin role
  const regularFaculty = facultyList.filter(
    (faculty) =>
      (faculty.designation === "Faculty" ||
        faculty.designation === "Associate Dean") &&
      faculty.role !== "Admin"
  );

  summary.total = regularFaculty.length;

  regularFaculty.forEach((faculty) => {
    const status = faculty.status?.toLowerCase() || "pending";

    if (status.includes("done")) {
      summary.done++;
    } else if (status.includes("senttodirector") || status.includes("sent_to_director")) {
      summary.SentToDirector++;
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
    } else {
      summary.pending++;
    }
  });

  return summary;
};

  // Function to export data to CSV
  const exportToCSV = () => {
    const statusHeaders = [
      "Department",
      "Total Faculty",
      "Sent To Director",
      "Completed",
      "Pending",
      "Verification Pending",
      "Authority Verification Pending",
      "Interaction Pending",
      "Portfolio Mark Pending",
      "Dean Mark Pending",
    ];

    const rows = departmentData.map((dept) => [
      dept.name,
      dept.summary.total,
      dept.summary.SentToDirector,
      dept.summary.done,
      dept.summary.pending,
      dept.summary.verification_pending,
      dept.summary.authority_verification_pending,
      dept.summary.interaction_pending,
      dept.summary.portfolio_mark_pending,
      dept.summary.portfolio_mark_dean_pending,
    ]);

    const csvContent = [
      statusHeaders.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "department_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchDepartmentSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-72">
        <main className="p-4 lg:p-6 mt-16">
          <div className="p-6 max-w-full mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-4 lg:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center">
                    <BarChart2 className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Department Summary
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={fetchDepartmentSummary}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                      disabled={loading || departmentData.length === 0}
                    >
                      <Download size={16} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">
                        Loading department data...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-600">
                    <p>{error}</p>
                  </div>
                ) : departmentData.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    <p>No department data available.</p>
                  </div>
                ) : (
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-gray-600 font-semibold">
                          Department
                        </th>
                        <th className="px-4 py-3 text-gray-600 font-semibold text-center">
                          Total Faculty
                        </th>
                        <th className="px-4 py-3 text-pink-600 font-semibold text-center">
  Sent To Director
</th>
                        <th className="px-4 py-3 text-green-600 font-semibold text-center">
                          Completed
                        </th>
                        <th className="px-4 py-3 text-gray-600 font-semibold text-center">
                          Pending
                        </th>
                        <th className="px-4 py-3 text-orange-600 font-semibold text-center">
                          Verification Pending
                        </th>
                        <th className="px-4 py-3 text-yellow-600 font-semibold text-center">
                          Auth. Verification
                        </th>
                        <th className="px-4 py-3 text-purple-600 font-semibold text-center">
                          Interaction
                        </th>
                        <th className="px-4 py-3 text-blue-600 font-semibold text-center">
                          Portfolio Mark
                        </th>
                        <th className="px-4 py-3 text-indigo-600 font-semibold text-center">
                          Dean Mark
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept, index) => (
                        <tr
                          key={dept.name}
                          className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                        >
                          <td className="px-4 py-3 font-medium">{dept.name}</td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {dept.summary.total}
                          </td>
                          <td className="px-4 py-3 text-center">
  <span className="inline-block min-w-[40px] px-2.5 py-1 bg-pink-100 text-pink-800 rounded-full font-medium">
    {dept.summary.SentToDirector}
  </span>
</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                              {dept.summary.done}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full font-medium">
                              {dept.summary.pending}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                              {dept.summary.verification_pending}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                              {dept.summary.authority_verification_pending}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                              {dept.summary.interaction_pending}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                              {dept.summary.portfolio_mark_pending}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block min-w-[40px] px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                              {dept.summary.portfolio_mark_dean_pending}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Summary;
