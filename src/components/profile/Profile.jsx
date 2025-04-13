import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; // Import LogOut icon

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [facultyData, setFacultyData] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordResetStatus, setPasswordResetStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  // Add status for profile update
  const [updateStatus, setUpdateStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log("UserData:"+ userData);
    if (userData) {
      setFacultyData({
        userId: userData._id,
        name: userData.name,
        department: userData.dept,
        position: userData.role,
        email: userData.mail,
        phone: userData.mob,
        designation: userData.desg,
        interactionDepartments: userData.interactionDepartments || [],
      });
    }
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set loading state
    setUpdateStatus({loading: true, success: false, error: null});
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: facultyData.userId,
          name: facultyData.name,
          phone: facultyData.phone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update was successful
        setUpdateStatus({
          loading: false,
          success: true,
          error: null
        });
        
        // Update the localStorage with new data
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData) {
          userData.name = facultyData.name;
          userData.mob = facultyData.phone;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
        
        // Exit edit mode
        setIsEditing(false);
        
        // Show success message temporarily
        setTimeout(() => {
          setUpdateStatus(prev => ({...prev, success: false}));
        }, 3000);
      } else {
        // Handle error
        setUpdateStatus({
          loading: false,
          success: false,
          error: data.error || 'Failed to update profile'
        });
      }
    } catch (err) {
      setUpdateStatus({
        loading: false,
        success: false,
        error: 'Network error. Please try again.'
      });
    }
  };


  const handlePasswordReset = async () => {
    if (!facultyData?.email) return;

    setPasswordResetStatus({loading: true, success: false, error: null});
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: facultyData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordResetStatus({
          loading: false, 
          success: true, 
          error: null
        });
      } else {
        setPasswordResetStatus({
          loading: false, 
          success: false, 
          error: data.error || 'Failed to send password reset email'
        });
      }
    } catch (err) {
      setPasswordResetStatus({
        loading: false, 
        success: false, 
        error: 'An error occurred. Please try again.'
      });
    }
  };
  // Add handleLogout function (same as in Sidebar.jsx)
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!facultyData) return null;

  return (
    <div className="flex bg-gray-100">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Faculty Profile
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-200"
            >
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>
          
          {/* Show status messages */}
          {updateStatus.success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Profile updated successfully!
            </div>
          )}
          
          {updateStatus.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {updateStatus.error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty ID
                </label>
                <p className="text-gray-800 text-xl font-bold text-red-500">
                  {facultyData.userId}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={facultyData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  />
                ) : (
                  <p className="text-gray-800">{facultyData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <p className="text-gray-800">{facultyData.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <p className="text-gray-800">{facultyData.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <p className="text-gray-800">{facultyData.designation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-800">{facultyData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={facultyData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  />
                ) : (
                  <p className="text-gray-800">{facultyData.phone}</p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={updateStatus.loading}
                  className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 ${
                    updateStatus.loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {updateStatus.loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Updated buttons section with both logout and change password */}
        <div className="flex justify-center mt-6 space-x-4">
        
          {/* Change Password button */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
          >
            Change Password
          </button>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </div>
      </main>

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            
            {passwordResetStatus.success ? (
              <div className="text-center mb-4">
                <p className="text-green-600 font-medium mb-2">
                  Password reset link sent successfully!
                </p>
                <p className="text-gray-600">
                  Please check your email for instructions to reset your password.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  A password reset link will be sent to your email address: <span className="font-semibold">{facultyData.email}</span>
                </p>
                
                {passwordResetStatus.error && (
                  <p className="text-red-600 text-sm mb-4">{passwordResetStatus.error}</p>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={handlePasswordReset}
                    disabled={passwordResetStatus.loading}
                    className={`flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 ${
                      passwordResetStatus.loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {passwordResetStatus.loading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {passwordResetStatus.success && (
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
