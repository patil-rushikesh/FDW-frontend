import React, { useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Users,
  UserPlus,
  Check,
  XCircle,
  Search,
} from "lucide-react";

const FacultyAdminPanel = () => {
  const [faculties, setFaculties] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  // Add new state for search
  const [searchUserId, setSearchUserId] = useState("");

  const departments = [
    "Computer",
    "IT",
    "Mech",
    "Civil",
    "Entc",
    "Regional CS",
    "AIML",
  ];

  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "HOD",
  ];

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    department: "",
    designation: "",
    email: "",
    mobile: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setFaculties(
        faculties.map((faculty) =>
          faculty.id === selectedFaculty.id ? { ...formData } : faculty
        )
      );
      setIsEditing(false);
    } else {
      setFaculties([...faculties, { ...formData, id: Date.now().toString() }]);
    }
    setFormData({
      id: "",
      name: "",
      department: "",
      designation: "",
      email: "",
      mobile: "",
    });
  };

  const handleEdit = (faculty) => {
    setIsEditing(true);
    setSelectedFaculty(faculty);
    setFormData(faculty);
  };

  const initiateDelete = (faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setFaculties(
      faculties.filter((faculty) => faculty.id !== facultyToDelete.id)
    );
    setShowDeleteDialog(false);
    setFacultyToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setFacultyToDelete(null);
  };

  const filteredFaculties = faculties.filter((faculty) => {
    const matchDepartment =
      !filterDepartment || faculty.department === filterDepartment;
    const matchDesignation =
      !filterDesignation || faculty.designation === filterDesignation;
    const matchUserId =
      !searchUserId ||
      faculty.id.toLowerCase().includes(searchUserId.toLowerCase());
    return matchDepartment && matchDesignation && matchUserId;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* College Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                {/* College Logo */}
                <div className="flex-shrink-0">
                  <img
                    src="https://www.pccoepune.com/images/pccoe-logo-new.webp"
                    alt="College Logo"
                    className="h-16 w-16 object-contain"
                  />
                </div>
                {/* College Name and Details */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Pimpri Chinchwad College of Engineering, Pune
                  </h1>
                  <p className="text-sm text-gray-500">
                    NAAC Accredited | Established 1991
                  </p>
                </div>
              </div>
              {/* Additional Header Content */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Admin Portal
                  </p>
                  <p className="text-xs text-gray-500">Faculty Admin Panel</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  Designation
                </label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select Designation</option>
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
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium"
            >
              {isEditing ? (
                <Pencil className="mr-2" size={18} />
              ) : (
                <Plus className="mr-2" size={18} />
              )}
              {isEditing ? "Update Faculty" : "Add Faculty"}
            </button>
          </form>
        </div>

        {/* Faculty List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center">
            <Users className="mr-2 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Faculty Directory
            </h2>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {/* New Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by User ID"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  className="pl-10 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Designations</option>
                {designations.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Add User ID column */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFaculties.map((faculty) => (
                    <tr
                      key={faculty.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Add User ID cell */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {faculty.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {faculty.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {faculty.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {faculty.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {faculty.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {faculty.mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(faculty)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => initiateDelete(faculty)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-200">
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
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAdminPanel;
