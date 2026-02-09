import React, { useState, useEffect } from "react";
import { Users, XCircle, Check, Search } from "lucide-react";

const FacultyList = () => {
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "",
    dept: "",
    desg: "",
    mail: "",
    mob: "",
  });

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
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users`);
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
        `${import.meta.env.VITE_BASE_URL}/users/${facultyToDelete._id}`,
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

  const handleEdit = async () => {
    try {
      setLoading(true);
      
      // Clone the editFormData and ensure desg is included
      const dataToSubmit = {
        ...editFormData,
        // Make sure desg is properly included
        desg: editFormData.desg
      };
      
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/users/${facultyToEdit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      );

      if (!response.ok) throw new Error("Failed to update faculty member");

      setSuccessMessage("Faculty member updated successfully");
      await fetchFaculties();
      setShowEditDialog(false);
      setFacultyToEdit(null);
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
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
    <div className="space-y-8">
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
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <input
                      type="text"
                      placeholder="Search by ID"
                      value={searchUserId}
                      onChange={(e) => setSearchUserId(e.target.value)}
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm min-w-[140px]"
                    />
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm min-w-[170px]"
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
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm min-w-[150px]"
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
                      className="p-2 bg-white border border-gray-300 rounded-lg text-sm min-w-[170px]"
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
                        <td className="px-6 py-4">{faculty.role}</td>
                        <td className="px-6 py-4">{faculty.designation || faculty.desg}</td>
                        <td className="px-6 py-4">{faculty.email || faculty.mail}</td>
                        <td className="px-6 py-4">{faculty.mobile || faculty.mob}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setFacultyToEdit(faculty);
                                setEditFormData({
                                  name: faculty.name || faculty.full_name,
                                  role: faculty.role,
                                  dept: faculty.dept,
                                  desg: faculty.designation || faculty.desg,
                                  mail: faculty.email || faculty.mail,
                                  mob: faculty.mobile || faculty.mob,
                                });
                                setShowEditDialog(true);
                              }}
                              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteDialog(true);
                                setFacultyToDelete(faculty);
                              }}
                              className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
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

            {/* Edit Dialog */}
            {showEditDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                      Edit Faculty Member
                    </h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <select
                          name="dept"
                          value={editFormData.dept}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          name="role"
                          value={editFormData.role}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Designation
                        </label>
                        <select
                          name="desg"
                          value={editFormData.desg}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                          {designations.map((designation) => (
                            <option key={designation} value={designation}>
                              {designation}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="mail"
                          value={editFormData.mail}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Mobile
                        </label>
                        <input
                          type="text"
                          name="mob"
                          value={editFormData.mob}
                          onChange={handleEditInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                      <div className="flex justify-end space-x-4 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditDialog(false);
                            setFacultyToEdit(null);
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleEdit}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default FacultyList;