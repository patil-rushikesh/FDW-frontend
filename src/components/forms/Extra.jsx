import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios";

const SectionCard = ({ title, icon, borderColor, children }) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300`}
  >
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
);

const ScoreCard = ({ label, score, total }) => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-between shadow-sm">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-lg font-bold text-blue-600">
      {score} / {total}
    </span>
  </div>
);

const Extra = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [extraData, setExtraData] = useState(null);

  // Add these new state variables for form status handling
  const [formStatus, setFormStatus] = useState("pending");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [formData, setFormData] = useState({
    contributions: "",
    selfAwardedMarks: 0,
  });

  // Add this new function to fetch the form status
  const fetchFormStatus = async () => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem("userData"));
      if (!storedUserData?.dept || !storedUserData?._id) return;

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${storedUserData.dept}/${storedUserData._id}/get-status`
      );

      if (response.ok) {
        const data = await response.json();
        setFormStatus(data.status);
      } else {
        throw new Error("Failed to fetch status");
      }
    } catch (error) {
      console.error("Error fetching form status:", error);
    }
  };

  // Modified fetchExtraData function to match API response structure
  const fetchExtraData = async () => {
    try {
      setLoading(true);
      const storedUserData = JSON.parse(localStorage.getItem("userData"));

      if (!storedUserData) {
        throw new Error("User data not found");
      }

      const department = storedUserData.dept;
      const userId = storedUserData._id;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/E`
        );

        if (response.data) {
          setExtraData(response.data);
          setFormData({
            contributions: response.data.bullet_points || "",
            selfAwardedMarks: response.data.total_marks || 0,
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setFormData({
            contributions: "",
            selfAwardedMarks: 0,
          });
        } else {
          throw error;
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching extra data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData) {
      setUserData(storedUserData);
      fetchExtraData();
      fetchFormStatus(); // Add this to get form status
    } else {
      setLoading(false);
      navigate("/login");
    }
  }, [navigate]);

  // Add this function to handle submit button click
  const handleSubmitClick = () => {
    if (formStatus !== "pending") {
      setShowStatusModal(true);
    } else {
      handleSubmit();
    }
  };

  // Modified handleSubmit function to match API request structure
  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const department = userData?.dept;
      const userId = userData?._id;

      const payload = {
        E: {
          total_marks: parseInt(formData.selfAwardedMarks),
          bullet_points: formData.contributions,
        },
        isFirstTime: !extraData,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/E`,
        payload
      );

      if (response.data) {
        navigate("/submission-status", {
          state: {
            status: "success",
            formName: "Extra Contributions Form",
            message: `Your extra contributions have been successfully ${
              extraData ? "updated" : "submitted"
            }!`,
            grandTotal: response.data.grand_total,
          },
        });
      }
    } catch (error) {
      console.error("Error submitting extra data:", error);
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "Extra Contributions Form",
          message: "Failed to submit extra contributions. Please try again.",
          error: error.message,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ClipLoader size={50} color="#3B82F6" />
          <p className="mt-4 text-gray-700">Loading extra contributions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Contributions Section */}
      <SectionCard
        title="Extra-ordinary Contributions"
        icon="⭐"
        borderColor="border-purple-500"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List your extra-ordinary contributions (non-listed in parameters A, B, C)
            </label>
            <textarea
              className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your contributions in bulleted form..."
              value={formData.contributions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  contributions: e.target.value,
                }))
              }
              disabled={formStatus !== "pending"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Self Awarded Marks
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.selfAwardedMarks}
              onChange={(e) => {
                const value = Math.min(50, Math.max(0, Number(e.target.value)));
                setFormData((prev) => ({
                  ...prev,
                  selfAwardedMarks: value,
                }));
              }}
              disabled={formStatus !== "pending"}
              onWheel={(e) => e.target.blur()}
              className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Maximum marks allowed: 50</p>
          </div>
        </div>
      </SectionCard>

      {/* Score Card */}
      <SectionCard title="Current Score" icon="🏆" borderColor="border-yellow-500">
        <ScoreCard
          label="Total Extra Contributions Score"
          score={formData.selfAwardedMarks}
          total={50}
        />
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmitClick} // Changed to use handleSubmitClick
          disabled={submitting}
          className={`px-6 py-3 rounded-lg focus:ring-4 focus:ring-blue-300 transition-colors duration-300
            ${formStatus !== "pending" 
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : submitting
                ? 'bg-blue-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <ClipLoader color="#ffffff" size={20} />
              Submitting...
            </span>
          ) : (
            "Save Extra Contributions"
          )}
        </button>
      </div>

      {/* Add this Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">Form Locked</h3>
            <p className="mb-6">
              This form cannot be edited because its current status is "{formStatus}".
              Only forms with "pending" status can be modified.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Extra;