import React, { useState, useEffect } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Check,
  XCircle,
  Search,
  AlertCircle,
  Menu
} from "lucide-react";
import Sidebar from "./AdminSidebar";

const FacultyAdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [searchUserId, setSearchUserId] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
    "ASH"
  ];

  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "HOD",
    "Dean"
  ];

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    dept: "",
    role: "",
    mail: "",
    mob: ""
  });

  // Fetch all faculties on component mount
  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/users');
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      setFaculties(data);
    } catch (err) {
      setError('Error loading faculty data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing) {
        const response = await fetch(`http://localhost:5000/users/${selectedFaculty._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            dept: formData.dept,
            mail: formData.mail,
            mob: formData.mob
          })
        });

        if (!response.ok) throw new Error('Failed to update faculty member');
        setSuccessMessage('Faculty member updated successfully');
      } else {
        const response = await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to add faculty member');
        setSuccessMessage('Faculty member added successfully');
      }

      await fetchFaculties();
      resetForm();
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    setIsEditing(true);
    setSelectedFaculty(faculty);
    setFormData({
      _id: faculty._id,
      name: faculty.name,
      dept: faculty.dept,
      role: faculty.role,
      mail: faculty.mail,
      mob: faculty.mob
    });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/users/${facultyToDelete._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete faculty member');
      
      setSuccessMessage('Faculty member deleted successfully');
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

  const resetForm = () => {
    setFormData({
      _id: "",
      name: "",
      dept: "",
      role: "",
      mail: "",
      mob: ""
    });
    setIsEditing(false);
    setSelectedFaculty(null);
  };

  const filteredFaculties = faculties.filter((faculty) => {
    const matchDepartment = !filterDepartment || faculty.dept === filterDepartment;
    const matchDesignation = !filterDesignation || faculty.role === filterDesignation;
    const matchUserId = !searchUserId || 
      faculty._id.toLowerCase().includes(searchUserId.toLowerCase());
    return matchDepartment && matchDesignation && matchUserId;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Notifications */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Rest of your existing JSX components */}
            {/* ... College Header ... */}
            
            {/* Add/Edit Faculty Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center">
                {isEditing ? (
                  <Pencil className="mr-2 text-blue-600" />
                ) : (
                  <UserPlus className="mr-2 text-green-600" />
                )}
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditing ? "Edit Faculty Member" : "Add New Faculty Member"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!isEditing && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        User ID
                      </label>
                      <input
                        type="text"
                        name="_id"
                        placeholder="Enter user ID"
                        value={formData._id}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <select
                      name="dept"
                      value={formData.dept}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Role</option>
                      {designations.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="mail"
                      placeholder="email@pccoepune.org"
                      value={formData.mail}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mob"
                      placeholder="10-digit mobile number"
                      value={formData.mob}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        {isEditing ? (
                          <Pencil className="mr-2" size={18} />
                        ) : (
                          <Plus className="mr-2" size={18} />
                        )}
                        {isEditing ? "Update Faculty" : "Add Faculty"}
                      </>
                    )}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Faculty List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Faculty Members</h2>
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
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <select
                        value={filterDesignation}
                        onChange={(e) => setFilterDesignation(e.target.value)}
                        className="p-2 bg-white border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">All Roles</option>
                        {designations.map((role) => (
                          <option key={role} value={role}>{role}</option>
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
                      <th className="px-6 py-3 text-gray-600">Email</th>
                      <th className="px-6 py-3 text-gray-600">Mobile</th>
                      <th className="px-6 py-3 text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculties.map((faculty) => (
                      <tr key={faculty._id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{faculty._id}</td>
                        <td className="px-6 py-4 font-medium">{faculty.name}</td>
                        <td className="px-6 py-4">{faculty.dept}</td>
                        <td className="px-6 py-4">{faculty.role}</td>
                        <td className="px-6 py-4">{faculty.mail}</td>
                        <td className="px-6 py-4">{faculty.mob}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(faculty)}
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
                      <XCircle className="text-red-600 mx-auto mb-4" size={36} />
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
                      <Check className="text-green-600 mx-auto mb-4" size={36} />
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

export default FacultyAdminPanel;