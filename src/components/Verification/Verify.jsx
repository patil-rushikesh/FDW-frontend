import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Verify = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData || !userData._id) {
          throw new Error("User data not found");
        }

        const verifierId = userData._id;
        const response = await fetch(
          `http://127.0.0.1:5000/faculty_to_verify/${verifierId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch verification data"
          );
        }

        const data = await response.json();
        setVerificationData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching verification data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">
          Loading verification data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-200"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  // Process the verification data
  const { _id, name, assigned_faculties } = verificationData || {};

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Faculty Verification Dashboard
            </h1>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-200"
            >
              <span>Back to Profile</span>
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Verifier Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Verifier ID:
                </span>
                <p className="text-gray-800 font-medium">{_id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-gray-800 font-medium">{name}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Assigned Faculties for Verification
            </h2>

            {Object.entries(assigned_faculties || {}).length === 0 ? (
              <p className="text-gray-600 italic">
                No faculty members assigned for verification.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(assigned_faculties || {}).map(
                  ([department, facultyList]) => (
                    <div
                      key={department}
                      className="border rounded-lg overflow-hidden"
                    >
                      <h3 className="bg-gray-200 px-4 py-2 font-medium text-gray-800">
                        Department: {department}
                      </h3>
                      <div className="divide-y">
                        {facultyList.map((faculty, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-6">
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Faculty ID:
                                  </span>
                                  <span className="ml-2 text-gray-800">
                                    {faculty._id}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Name:
                                  </span>
                                  <span className="ml-2 text-gray-800">
                                    {faculty.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-3">
                                {faculty.isApproved ? (
                                  <div className="flex items-center space-x-2 text-green-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="font-medium">
                                      Verified
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition duration-200"
                                    onClick={() =>
                                      navigate(
                                        `/paper-verification/givemarks/${department}/${faculty._id}`
                                      )
                                    }
                                  >
                                    Verify and Give Marks
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Verify;
