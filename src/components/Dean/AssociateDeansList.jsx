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

const AssociateDeansList = () => {
  const navigate = useNavigate();
  const [associatesData, setAssociatesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    role: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  useEffect(() => {
    const fetchAssociates = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData || !userData._id) {
          throw new Error("User data not found");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/dean/${userData._id}/associates`
        );

        if (!response.ok) throw new Error("Failed to fetch associates data");

        const responseData = await response.json();
        if (responseData.status === "success") {
          setAssociatesData(responseData.associates);
        } else {
          throw new Error(responseData.message || "API returned an error");
        }
      } catch (err) {
        setError("Error loading associates data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssociates();
  }, []);

  const departments = [
    "AIML",
    "ASH",
    "Civil",
    "Computer",
    "Computer(Regional)",
    "ENTC",
    "IT",
    "Mechanical",
  ];

  const roles = ["Professor", "Associate Professor", "Assistant Professor"];

  const filteredData = useMemo(() => {
    return associatesData
      .filter((associate) => {
        const searchMatch =
          associate.id.toLowerCase().includes(filters.search.toLowerCase()) ||
          associate.name.toLowerCase().includes(filters.search.toLowerCase());
        const departmentMatch =
          !filters.department || associate.department === filters.department;
        const roleMatch = !filters.role || associate.role === filters.role;

        return searchMatch && departmentMatch && roleMatch;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        // Add sorting logic if needed
        return 0;
      });
  }, [associatesData, filters, sortConfig]);


  console.log("Filtered Data:", filteredData);
  // Function to determine what to display in the action column
  const renderActionButton = (associate) => {
    if (associate.status === "Portfolio_Mark_Dean_pending") {
      return (
        <button
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-white border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          // Update the navigation in renderActionButton
          onClick={() =>
            navigate(
              `/dean-evaluation/${associate.department}/${associate.id}`,
              {
                state: {
                  faculty: {
                    name: associate.name,
                    id: associate.id,
                    role: associate.role,
                    department: associate.department,
                    designation: associate.designation,
                  },
                },
              }
            )
          }
        >
          <span className="font-semibold">Give Portfolio Marks</span>
        </button>
      );
    } else if (associate.status === "Done") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>Evaluation Complete</span>
        </span>
      );
    } else {
      return <span className="text-gray-400">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading associates data...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <main className="lg:mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Header Section */}
              <div className="border-b border-gray-200 px-4 lg:px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Associate Deans List
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
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-gray-600">ID</th>
                      <th className="px-6 py-3 text-gray-600">Name</th>
                      <th className="px-6 py-3 text-gray-600">Department</th>
                      <th className="px-6 py-3 text-gray-600">Role</th>
                      <th className="px-6 py-3 text-gray-600">Status</th>
                      <th className="px-6 py-3 text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((associate) => (
                      <tr
                        key={associate.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">{associate.id}</td>
                        <td className="px-6 py-4 font-medium">
                          {associate.name}
                        </td>
                        <td className="px-6 py-4">{associate.department}</td>
                        <td className="px-6 py-4">{associate.role}</td>
                        <td className="px-6 py-4">
                        <span
  className={`inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-xs font-semibold ${
    associate.status === "Portfolio_Mark_Dean_pending"
      ? "bg-green-100 text-green-800"
      : associate.status === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-800"
  }`}
>
  {associate.status === "Portfolio_Mark_Dean_pending"
    ? "Dean Portfolio Mark Pending"
    : associate.status.charAt(0).toUpperCase() + associate.status.slice(1)}
</span>
                        </td>
                        <td className="px-6 py-4">
                          {renderActionButton(associate)}
                        </td>
                      </tr>
                    ))}
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

export default AssociateDeansList;
