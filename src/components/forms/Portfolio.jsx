import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios"; // Make sure axios is installed

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

const RadioGroup = ({ options, selectedValue, onChange }) => (
  <div className="space-y-2">
    {options.map((option) => (
      <label key={option.value} className="flex items-center space-x-3">
        <input
          type="radio"
          value={option.value}
          checked={selectedValue === option.value}
          onChange={(e) => onChange(e.target.value)}
          className="h-4 w-4 text-blue-600"
        />
        <span className="text-sm font-medium text-gray-700">
          {option.label}
        </span>
      </label>
    ))}
  </div>
);

const Portfolio = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    portfolioType: "both",
    selfAwardedMarks: 0,
    deanMarks: 0,
    hodMarks: 0,
    isMarkHOD: false,
    isMarkDean: false,
    isAdministrativeRole: false,
    administrativeRole: "",
    adminSelfAwardedMarks: 0,
    directorMarks: 0,
    adminDeanMarks: 0,
  });

  // Add these new state variables for form status handling
  const [formStatus, setFormStatus] = useState("pending");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [instituteLevelPortfolio, setInstituteLevelPortfolio] = useState("");
  const [departmentLevelPortfolio, setDepartmentLevelPortfolio] = useState("");

  // Function to fetch portfolio data from backend
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const storedUserData = JSON.parse(localStorage.getItem("userData"));

      if (!storedUserData) {
        throw new Error("User data not found");
      }

      const department = storedUserData.dept;
      const userId = storedUserData._id;
      console.log("Fetching data for:", department, userId);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/D`
        );

        if (response.data) {
          setPortfolioData(response.data);

          // Update form data with existing values
          setFormData({
            portfolioType: response.data.portfolioType || "both",
            selfAwardedMarks: response.data.selfAwardedMarks || 0,
            deanMarks: response.data.deanMarks || 0,
            hodMarks: response.data.hodMarks || 0,
            isMarkHOD: response.data.isMarkHOD || false,
            isMarkDean: response.data.isMarkDean || false,
            isAdministrativeRole: response.data.isAdministrativeRole || false,
            administrativeRole: response.data.administrativeRole || "",
            adminSelfAwardedMarks: response.data.adminSelfAwardedMarks || 0,
            directorMarks: response.data.directorMarks || 0,
            adminDeanMarks: response.data.adminDeanMarks || 0,
          });

          // Update institute and department level portfolio texts
          setInstituteLevelPortfolio(
            response.data.instituteLevelPortfolio || ""
          );
          setDepartmentLevelPortfolio(
            response.data.departmentLevelPortfolio || ""
          );
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If data doesn't exist (first time), initialize with default values
          setFormData({
            portfolioType: "both",
            selfAwardedMarks: 0,
            deanMarks: 0,
            hodMarks: 0,
            isMarkHOD: false,
            isMarkDean: false,
            isAdministrativeRole: false,
            administrativeRole: "",
            adminSelfAwardedMarks: 0,
            directorMarks: 0,
            adminDeanMarks: 0,
          });
          setInstituteLevelPortfolio("");
          setDepartmentLevelPortfolio("");
        } else {
          throw error;
        }
      }

      setLoading(false);
      setInitialDataLoaded(true);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setFormData((prev) => ({
        ...prev,
        error: "Failed to load portfolio data. Please try again.",
      }));
      setLoading(false);
      setInitialDataLoaded(true);
    }
  };

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

  // Load user data, fetch portfolio data, and get form status
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData) {
      setUserData({
        _id: storedUserData._id,
        dept: storedUserData.dept,
        desg: storedUserData.desg,
        name: storedUserData.name,
        role: storedUserData.role,
        mail: storedUserData.mail,
        mob: storedUserData.mob,
      });
      fetchPortfolioData();
      fetchFormStatus(); // Add this to get form status
    } else {
      setLoading(false);
      setInitialDataLoaded(true);
      navigate("/login"); // Redirect to login if no user data found
    }
  }, [navigate]);

  console.log("User Data:", userData);

  // Update administrative role based on designation
  useEffect(() => {
    if (!userData) return;

    const designation = userData.desg;
    const isAdminRole =
      designation === "deputy_director" ||
      designation === "Dean" ||
      designation === "HOD" ||
      designation === "associate_dean";

    // Set default portfolio type to "institute" for HOD or Dean
    const defaultPortfolioType = 
      (designation === "HOD" || designation === "Dean") ? "institute" : "both";

    setFormData((prev) => ({
      ...prev,
      isAdministrativeRole: isAdminRole,
      administrativeRole: designation,
      portfolioType: prev.portfolioType || defaultPortfolioType, // Only set if not already loaded from backend
    }));
  }, [userData]);

  const handlePortfolioTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      portfolioType: value,
    }));
  };

  // Calculate portfolio score based on form data
  const calculatePortfolioScore = () => {
    if (formData.isAdministrativeRole) {
      // For administrative roles
      const selfScore = Math.min(
        60,
        Number(formData.adminSelfAwardedMarks) || 0
      );
      const superiorScore =
        formData.administrativeRole === "associate_dean"
          ? Number(formData.adminDeanMarks) || 0
          : Number(formData.directorMarks) || 0;
      return Math.min(120, selfScore + superiorScore);
    } else {
      // For regular portfolio roles
      const selfScore = Math.min(60, Number(formData.selfAwardedMarks) || 0);
      let superiorScore = 0;

      switch (formData.portfolioType) {
        case "both":
          superiorScore =
            ((Number(formData.deanMarks) || 0) +
              (Number(formData.hodMarks) || 0)) /
            2;
          break;
        case "institute":
          superiorScore = Number(formData.deanMarks) || 0;
          break;
        case "department":
          superiorScore = Number(formData.hodMarks) || 0;
          break;
        default:
          break;
      }

      return Math.min(120, selfScore + superiorScore);
    }
  };

  // Submit portfolio data to backend
  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const department = userData?.dept;
      const userId = userData?._id;

      if (!department || !userId) {
        throw new Error("Department and User ID are required");
      }

      const score = calculatePortfolioScore();

      const payload = {
        D: {  // Add this wrapper to match backend expectation
          portfolioType: formData.portfolioType,
          selfAwardedMarks: parseInt(formData.selfAwardedMarks),
          deanMarks: parseInt(formData.deanMarks),
          hodMarks: parseInt(formData.hodMarks),
          isMarkHOD: formData.isMarkHOD,
          isMarkDean: formData.isMarkDean,
          isAdministrativeRole: formData.isAdministrativeRole,
          administrativeRole: formData.administrativeRole,
          adminSelfAwardedMarks: parseInt(formData.adminSelfAwardedMarks),
          directorMarks: parseInt(formData.directorMarks),
          adminDeanMarks: parseInt(formData.adminDeanMarks),
          instituteLevelPortfolio,
          departmentLevelPortfolio,
          total_marks: score,
          isFirstTime: !portfolioData
        }
      };

      // Make the request
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/D`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        navigate("/submission-status", {
          state: {
            status: "success",
            formName: "Portfolio Form",
            message: `Your portfolio details have been successfully ${
              portfolioData ? "updated" : "submitted"
            }!`,
            grandTotal: response.data.grand_total
          }
        });
      }
    } catch (error) {
      console.error("Error submitting portfolio data:", error);
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "Portfolio Form",
          message: "Failed to submit portfolio details. Please try again.",
          error: error.message
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Add this function to handle submit button click
  const handleSubmitClick = () => {
    if (formStatus !== "pending") {
      setShowStatusModal(true);
    } else {
      handleSubmit();
    }
  };

  if (loading && !initialDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ClipLoader size={50} color="#3B82F6" />
          <p className="mt-4 text-gray-700">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (formData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p>{formData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p>Session expired. Please log in again.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const designation = userData.desg;
  const currentScore = calculatePortfolioScore();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Portfolio Type Selection - Only show if not administrative role */}
      {
        <SectionCard
          title="Portfolio Selection"
          icon="📋"
          borderColor="border-blue-500"
        >
          <RadioGroup
            options={[
              {
                value: "both",
                label: "Both Institute and Department Level Portfolio",
              },
              { value: "institute", label: "Institute Level Portfolio Only" },
              { value: "department", label: "Department Level Portfolio Only" },
            ]}
            selectedValue={formData.portfolioType}
            onChange={handlePortfolioTypeChange}
          />
        </SectionCard>
        }

      {/* Self Assessment */}
      <SectionCard
        title="Self Assessment"
        icon="✍️"
        borderColor="border-green-500"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.isAdministrativeRole
                ? "Self Awarded Marks for Administrative Role"
                : "Self Awarded Marks for Portfolio Work"}
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={
                formData.isAdministrativeRole
                  ? formData.adminSelfAwardedMarks
                  : formData.selfAwardedMarks
              }
              onChange={(e) => {
                const value = Math.min(60, Math.max(0, Number(e.target.value)));
                setFormData((prev) => ({
                  ...prev,
                  [formData.isAdministrativeRole
                    ? "adminSelfAwardedMarks"
                    : "selfAwardedMarks"]: value,
                }));
              }}
              onWheel={(e) => e.target.blur()}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (value > 60) {
                  setFormData((prev) => ({
                    ...prev,
                    [formData.isAdministrativeRole
                      ? "adminSelfAwardedMarks"
                      : "selfAwardedMarks"]: 60,
                  }));
                }
              }}
              className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum marks allowed: 60
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Portfolio Table */}
      <SectionCard
        title="List of Portfolios Handled"
        icon="📋"
        borderColor="border-gray-500"
      >
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <tbody>
              <tr className="divide-x divide-gray-200">
                {(formData.portfolioType === "both" ||
                  formData.portfolioType === "institute" ||
                  formData.isAdministrativeRole) && (
                  <td className="w-1/2 p-4 align-top">
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Institute Level
                      </label>
                      <textarea
                        className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter institute level portfolios..."
                        value={instituteLevelPortfolio}
                        onChange={(e) =>
                          setInstituteLevelPortfolio(e.target.value)
                        }
                      />
                    </div>
                  </td>
                )}
                {(formData.portfolioType === "both" ||
                  formData.portfolioType === "department" ||
                  formData.isAdministrativeRole) && (
                  <td
                    className={`${
                      formData.portfolioType === "both" ||
                      formData.isAdministrativeRole
                        ? "w-1/2"
                        : "w-full"
                    } p-4 align-top`}
                  >
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Department Level
                      </label>
                      <textarea
                        className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter department level portfolios..."
                        value={departmentLevelPortfolio}
                        onChange={(e) =>
                          setDepartmentLevelPortfolio(e.target.value)
                        }
                      />
                    </div>
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Score Card - Show current calculated score */}
      <SectionCard
        title="Current Score"
        icon="🏆"
        borderColor="border-yellow-500"
      >
        <ScoreCard
          label="Total Portfolio Score"
          score={currentScore}
          total={120}
        />

        {/* Show marks status information */}
        <div className="mt-4 space-y-2">
          {/* Always show self awarded marks regardless of role */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Self Awarded Marks:
            </span>
            <span className="font-medium">
              {formData.isAdministrativeRole ? formData.adminSelfAwardedMarks : formData.selfAwardedMarks}
            </span>
          </div>

          {/* For Associate Dean: Show both HOD and Dean marks */}
          {userData.desg === "Associate Dean" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HOD Marks:</span>
                <span className="font-medium">
                  {formData.isMarkHOD ? formData.hodMarks : "Not Reviewed Yet"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dean Marks:</span>
                <span className="font-medium">
                  {formData.isMarkDean ? formData.deanMarks : "Not Reviewed Yet"}
                </span>
              </div>
            </>
          )}

          {/* For Faculty: Show only HOD marks */}
          {(userData.desg !== "HOD" && userData.desg !== "Dean" && 
            userData.desg !== "deputy_director" && userData.desg !== "Associate Dean") && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">HOD Marks:</span>
              <span className="font-medium">
                {formData.isMarkHOD ? formData.hodMarks : "Not Reviewed Yet"}
              </span>
            </div>
          )}

          {/* For HOD and Dean: Show Director marks */}
          {(userData.desg === "HOD" || userData.desg === "Dean") && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Director Marks:</span>
              <span className="font-medium">
                {formData.directorMarks > 0 ? formData.directorMarks : "Not Reviewed Yet"}
              </span>
            </div>
          )}

          {/* For Deputy Director: Show Director marks */}
          {userData.desg === "deputy_director" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Director Marks:</span>
              <span className="font-medium">
                {formData.directorMarks > 0 ? formData.directorMarks : "Not reviewed yet"}
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmitClick} // Changed to use the new handler
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
            'Save Portfolio Details'
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

export default Portfolio;
