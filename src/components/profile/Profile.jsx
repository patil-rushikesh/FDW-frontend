import { useState } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [facultyData, setFacultyData] = useState({
    name: "Dr. Jane Smith",
    department: "Computer Science",
    position: "Associate Professor",
    email: "jane.smith@university.edu",
    phone: "+1 (555) 123-4567",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacultyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically send the updated data to a server
    console.log("Updated faculty data:", facultyData);
  };

  return (
    <div className="flex bg-gray-100">
      {/* Main Content */}
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  userId
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
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={facultyData.department}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  />
                ) : (
                  <p className="text-gray-800">{facultyData.department}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="position"
                    value={facultyData.position}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  />
                ) : (
                  <p className="text-gray-800">{facultyData.position}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={facultyData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  />
                ) : (
                  <p className="text-gray-800">{facultyData.email}</p>
                )}
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
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="dislpay-4 mt-6 ">
          <span className="mt-6 mr-4">
            <button
              type="Change Passward"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
              Change Passward
            </button>
          </span>

          <span className="mt-6 ml-4">
            <button
              type="Change Passward"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition duration-200"
            >
              Logout
            </button>
          </span>
        </div>
      </main>
    </div>
  );
};
export default Profile;
