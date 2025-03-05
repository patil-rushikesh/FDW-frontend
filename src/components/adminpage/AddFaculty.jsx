import React, { useState } from "react";
import { Pencil, Plus, UserPlus, Check } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AddFaculty = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [deanSuggestions, setDeanSuggestions] = useState([]);
  const [showDeanSuggestions, setShowDeanSuggestions] = useState(false);

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

  const desg = [
    "Associate Dean",
    "Director",
    "HOD",
    "Dean",
    "Admin",
    "Faculty",
  ];

  const roles = [
    "Professor",
    "Assistant Professor",
    "Associate Professor",
  ];

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    dept: "",
    role: "",
    mail: "",
    mob: "",
    desg: "",
    higherDean: "", // Add this new field
  });

  const fetchDeanSuggestions = async (query) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/deans`);
      if (!response.ok) throw new Error('Failed to fetch deans');
      const result = await response.json();
      // Extract dean data from the response
      const deans = result.data.map(dean => ({
        _id: dean._id,
        name: dean.name
      }));
      setDeanSuggestions(deans);
    } catch (error) {
      console.error('Error fetching dean suggestions:', error);
      setDeanSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add faculty member");
      setSuccessMessage("Faculty member added successfully");
      resetForm();
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
      mob: "",
      desg: "",
      higherDean: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:ml-72">
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Add Faculty Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center">
                <UserPlus className="mr-2 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Add New Faculty Member
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      name="desg"
                      value={formData.desg}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Designation</option>
                      {desg.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Designatin
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
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

                {formData.desg === "Associate Dean" && (
                  <div className="space-y-2 mt-6">
                    <label className="text-sm font-medium text-gray-700">
                      Higher Dean
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="higherDean"
                        placeholder="Search for Dean"
                        value={formData.higherDean}
                        onClick={() => {
                          fetchDeanSuggestions();
                          setShowDeanSuggestions(true);
                        }}
                        onChange={(e) => {
                          handleInputChange(e);
                          setShowDeanSuggestions(true);
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {showDeanSuggestions && deanSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {deanSuggestions.map((dean) => (
                            <div
                              key={dean._id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  higherDean: `${dean._id}`
                                }));
                                setShowDeanSuggestions(false);
                              }}
                            >
                              {dean._id} - {dean.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                        <Plus className="mr-2" size={18} />
                        Add Faculty
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

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

export default AddFaculty;
