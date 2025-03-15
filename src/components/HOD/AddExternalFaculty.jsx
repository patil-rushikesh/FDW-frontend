import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  School,
  MapPin,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const AddExternalFaculty = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    mail: "",
    mob: "",
    desg: "",
    specialization: "",
    organization: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [userDept, setUserDept] = useState("");
  const navigate = useNavigate();

  // Get user department from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.dept) {
      setUserDept(userData.dept);
    }
  }, []);

  // Update the useEffect for fetching faculty list
  useEffect(() => {
    const fetchExternalFaculty = async () => {
      if (!userDept) return;

      try {
        const response = await fetch(
          `http://localhost:5000/${userDept}/get-externals`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch external faculty");
        }

        const data = await response.json();
        console.log("Fetched external faculty:", data);

        // Update faculty list with data from backend
        setFacultyList(data.data || []);
      } catch (error) {
        console.error("Error fetching external faculty:", error);
        toast.error("Failed to load external faculty list");
      }
    };

    fetchExternalFaculty();
  }, [userDept]); // Depend on userDept to refetch when it changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        "full_name",
        "mail",
        "mob",
        "desg",
        "specialization",
        "organization",
      ];

      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      // Format data to match backend expectations
      const requestData = {
        full_name: formData.full_name.trim(),
        mail: formData.mail.trim(),
        mob: formData.mob.trim(),
        desg: formData.desg.trim(),
        specialization: formData.specialization.trim(),
        organization: formData.organization.trim(),
        address: formData.address.trim() || "", // Optional field
      };

      // Debug log
      console.log("Sending data:", requestData);
      console.log("Department:", userDept);

      const response = await fetch(
        `http://localhost:5000/${userDept}/create-external`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
          credentials: "include", // Include cookies if needed
        }
      );

      // Debug log
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to add external faculty");
      }

      // Add the new faculty to the list
      setFacultyList((prev) => [...prev, data.data]);

      // Reset form
      setFormData({
        full_name: "",
        mail: "",
        mob: "",
        desg: "",
        specialization: "",
        organization: "",
        address: "",
      });
      
      // Redirect to success page
      navigate("/submission-status", {
        state: {
          status: "success",
          formName: "External Faculty",
          message: `${requestData.full_name} has been successfully added to your external faculty list!`,
        }
      });
      
    } catch (error) {
      console.error("Error adding external faculty:", error);
      toast.error(error.message || "Failed to add external faculty");
      
      // For severe errors, also redirect to error status page
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "External Faculty",
          message: "Failed to add external faculty. Please try again.",
          error: error.message
        }
      });
    } finally {
      setLoading(false);
    }
};

  const handleDelete = async (id) => {
    try {
      // Ask for confirmation
      if (!window.confirm("Are you sure you want to delete this faculty?")) {
        return;
      }

      // Simulating API call for deletion
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Remove from the list
      setFacultyList((prev) => prev.filter((faculty) => faculty.id !== id));
      toast.success("Faculty removed successfully");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast.error("Failed to delete faculty");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Add External Faculty</h1>
          <p className="text-indigo-100 text-sm">
            Create new external faculty profiles for interaction panels
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User size={16} /> Full Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* mail */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail size={16} /> Email Address{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="mail"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter mail address"
                required
              />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone size={16} /> Mobile Number{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mob"
                value={formData.mob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter 10-digit mobile number"
                required
              />
            </div>

            {/* desg */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Briefcase size={16} /> Designation{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="desg"
                value={formData.desg}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter desg"
                required
              />
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <School size={16} /> Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter area of expertise"
              />
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Briefcase size={16} /> Organization
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter organization name"
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin size={16} /> Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter full address"
                rows="3"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-indigo-700 text-white rounded-md shadow-sm hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Add External Faculty"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Faculty List Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-indigo-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            External Faculty List
          </h2>
          <p className="text-indigo-100 text-sm">
            Manage existing external faculty profiles
          </p>
        </div>

        <div className="p-6">
          {facultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No external faculty members added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Position
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Organization
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facultyList.map((faculty) => (
                    <tr key={faculty._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {faculty.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {faculty.mail}
                        </div>
                        <div className="text-sm text-gray-500">
                          {faculty.mob}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {faculty.desg}
                        </div>
                        {faculty.specialization && (
                          <div className="text-sm text-gray-500">
                            {faculty.specialization}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {faculty.organization || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(faculty._id)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExternalFaculty;
