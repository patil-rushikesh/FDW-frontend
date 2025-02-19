import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FacultyFormsList = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    role: "",
    minMarks: "",
    maxMarks: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [userDept, setUserDept] = useState("");
  const [isHOD, setIsHOD] = useState(false);
  const navigate = useNavigate();

  // Add this useEffect to get logged-in user data
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setUserDept(userData.dept);
      setIsHOD(userData.desg === "HOD");
    }
  }, []);

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/users");
        if (!response.ok) throw new Error("Failed to fetch faculty data");
        const data = await response.json();

        // Filter data if user is HOD
        if (isHOD) {
          const filteredData = data.filter(
            (faculty) => faculty.dept === userDept
          );
          setFacultyData(filteredData);
        } else {
          setFacultyData(data);
        }
      } catch (err) {
        setError("Error loading faculty data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [isHOD, userDept]);

  const departments = [
    "Computer",
    "IT",
    "Mechanical",
    "Civil",
    "ENTC",
    "Computer(Regional)",
    "AIML",
    "ASH",
  ];

  const roles = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "HOD",
    "Dean",
  ];

  // Enhanced filter function with marks range
  const filteredData = useMemo(() => {
    return facultyData
      .filter((faculty) => {
        const searchMatch =
          faculty._id.toLowerCase().includes(filters.search.toLowerCase()) ||
          faculty.name?.toLowerCase().includes(filters.search.toLowerCase());
        const departmentMatch =
          !filters.department || faculty.dept === filters.department;
        const roleMatch = !filters.role || faculty.role === filters.role;
        const marksMatch =
          (!filters.minMarks ||
            faculty.totalMarks >= Number(filters.minMarks)) &&
          (!filters.maxMarks || faculty.totalMarks <= Number(filters.maxMarks));

        return searchMatch && departmentMatch && roleMatch && marksMatch;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;

        if (sortConfig.key === "marks") {
          return sortConfig.direction === "asc"
            ? a.totalMarks - b.totalMarks
            : b.totalMarks - a.totalMarks;
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
  const handleVerify = (faculty) => {
    navigate("/hodverify", { state: { faculty } });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const getAvailableDepartments = () => {
    if (isHOD) {
      return [userDept];
    }
    return departments;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Changed ml-72 to pl-72 */}
        <main className="lg: mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                    className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    {sortConfig.direction === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    )}
                    Sort by Marks
                  </button>
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
                      <th className="px-6 py-3 text-gray-600">Designation</th>
                      <th className="px-6 py-3 text-gray-600">Role</th>
                      <th className="px-6 py-3 text-gray-600">Total Marks</th>
                      <th className="px-6 py-3 text-gray-600">Status</th>
                      <th className="px-6 py-3 text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((faculty) => (
                      <tr
                        key={faculty._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">{faculty._id}</td>
                        <td className="px-6 py-4 font-medium">
                          {faculty.name}
                        </td>
                        <td className="px-6 py-4">{faculty.dept}</td>
                        <td className="px-6 py-4">{faculty.desg}</td>
                        <td className="px-6 py-4">{faculty.role}</td>
                        <td className="px-6 py-4">
                          {faculty.totalMarks || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              faculty.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {faculty.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleVerify(faculty)}
                            className={`flex items-center gap-1 px-3 py-1 rounded ${
                              faculty.verified
                                ? "text-red-600 hover:text-red-800"
                                : "text-green-600 hover:text-green-800"
                            }`}
                          >
                            {faculty.verified ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            <span>
                              {faculty.verified ? "Unverify" : "Verify"}
                            </span>
                          </button>
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

export default FacultyFormsList;
