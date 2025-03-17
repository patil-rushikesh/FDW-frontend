import React, { useState, useEffect } from "react";
import { Users, XCircle, Check, Search } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const FacultyList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [searchUserId, setSearchUserId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const designations = [
    "Faculty",
    "HOD",
    "Dean",
    "Associate Dean",
    "Deputy Director",
  ];

  const roles = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
  ];

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) throw new Error("Failed to fetch faculty data");
      const data = await response.json();
      setFaculties(data);
    } catch (err) {
      setError("Error loading faculty data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/users/${facultyToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete faculty member");

      setSuccessMessage("Faculty member deleted successfully");
      await fetchFaculties();
      setShowDeleteDialog(false);
      setFacultyToDelete(null);
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = faculties.filter((faculty) => {
    const matchDepartment =
      !filterDepartment || faculty.dept === filterDepartment;
    const matchDesignation =
      !filterDesignation || faculty.desg === filterDesignation;
    const matchRole = !filterRole || faculty.role === filterRole;
    const matchUserId =
      !searchUserId ||
      faculty._id.toLowerCase().includes(searchUserId.toLowerCase());
    return matchDepartment && matchDesignation && matchRole && matchUserId;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-72">
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Faculty List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Faculty Members
                    </h2>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search by ID"
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
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
                        value={filterDesignation}
                        onChange={(e) => setFilterDesignation(e.target.value)}
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">All Roles</option>
                        {designations.map((designation) => (
                          <option key={designation} value={designation}>
                            {designation}
                          </option>
                        ))}
                      </select>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">All Designation</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faculty Table */}
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-gray-600">ID</th>
                          <th className="px-6 py-3 text-gray-600">Name</th>
                          <th className="px-6 py-3 text-gray-600">Department</th>
                          <th className="px-6 py-3 text-gray-600">Role</th>
                          <th className="px-6 py-3 text-gray-600">Designation</th>
                          <th className="px-6 py-3 text-gray-600">Email</th>
                          <th className="px-6 py-3 text-gray-600">Mobile</th>
                          <th className="px-6 py-3 text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredFaculties.map((faculty) => (
                          <tr
                          key={faculty._id}
                          className="border-b hover:bg-gray-50"
                          >
                          <td className="px-6 py-4">{faculty._id}</td>
                          <td className="px-6 py-4 font-medium">
                            {faculty.name || faculty.full_name}
                          </td>
                          <td className="px-6 py-4">{faculty.dept}</td>
                          <td className="px-6 py-4">{faculty.desg}</td>
                          <td className="px-6 py-4">{faculty.role}</td>
                          <td className="px-6 py-4">{faculty.mail}</td>
                          <td className="px-6 py-4">{faculty.mob}</td>
                          <td className="px-6 py-4">
                            <button
                            onClick={() => {
                              setShowDeleteDialog(true);
                              setFacultyToDelete(faculty);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                  <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4">
                      <XCircle
                        className="text-red-600 mx-auto mb-4"
                        size={36}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      Confirm Delete
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      Are you sure you want to delete faculty member{" "}
                      <span className="font-semibold text-gray-900">
                        {facultyToDelete?.name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setShowDeleteDialog(false);
                          setFacultyToDelete(null);
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Dialog */}
            {showSuccessDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                  <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4">
                      <Check
                        className="text-green-600 mx-auto mb-4"
                        size={36}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                      Success
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      {successMessage}
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setShowSuccessDialog(false);
                          setSuccessMessage("");
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyList;