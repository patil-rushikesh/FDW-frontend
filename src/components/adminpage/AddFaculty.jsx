import React, { useState } from "react";
import { Pencil, Plus, UserPlus, Check, AlertCircle } from "lucide-react";
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

  const roles = ["Professor", "Assistant Professor", "Associate Professor"];

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

  const fetchDeanSuggestions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/all-faculties`);
      if (!response.ok) throw new Error('Failed to fetch faculty data');
      const data = await response.json();
      
      // Extract the data property from the response
      const facultyList = data.data || [];
      console.log(facultyList)
      
      // Only keep faculty with Dean designation
      const deanFaculty = facultyList
        .filter(faculty => faculty.designation === "Dean")
        .map(dean => ({
          _id: dean._id,
          name: dean.name,
          department: dean.dept // Include department for display
        }));

        console.log("Dean Suggestions: ", deanFaculty);
        
      setDeanSuggestions(deanFaculty);
    } catch (error) {
      console.error("Error fetching dean suggestions:", error);
      setDeanSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Filter dean suggestions if typing in the higherDean field
    if (name === "higherDean" && value.trim()) {
      const filtered = deanSuggestions
        .filter(
          (dean) =>
            dean._id.toLowerCase().includes(value.toLowerCase()) ||
            dean.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions
      setDeanSuggestions(filtered);
      setShowDeanSuggestions(true);
    } else if (name === "higherDean") {
      setShowDeanSuggestions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Parse JSON response

      if (!response.ok) {
        // Use the error message from the API if available
        throw new Error(data.error || "Failed to add faculty member");
      }

      setSuccessMessage("Faculty member added successfully");
      resetForm();
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err.message);
      // Scroll to the error message
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start">
                <AlertCircle
                  className="mr-3 mt-0.5 text-red-600 flex-shrink-0"
                  size={18}
                />
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            )}

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
                      <option value="">Select Role</option>
                      {desg.map((desig) => (
                        <option key={desig} value={desig}>
                          {desig}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Designation
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Designation</option>
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
                      onChange={(e) => {
                        // Only allow digits and limit to 10 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(prev => ({
                          ...prev,
                          mob: value
                        }));
                      }}
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
                        placeholder="Search for Dean by ID or name"
                        value={formData.higherDean}
                        onClick={() => {
                          fetchDeanSuggestions();
                          setShowDeanSuggestions(true);
                        }}
                        onChange={handleInputChange}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {showDeanSuggestions && deanSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {deanSuggestions.map((dean) => (
                            <div
                              key={dean._id}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  higherDean: dean._id,
                                }));
                                setShowDeanSuggestions(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            >
                              <div>
                                <span className="font-medium">{dean._id}</span>
                                <span className="text-gray-600 ml-2">
                                  ({dean.name})
                                </span>
                              </div>
                              {dean.department && (
                                <span className="text-gray-500 text-sm">
                                  {dean.department}
                                </span>
                              )}
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
