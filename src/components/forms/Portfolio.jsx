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
    selfAwardedMarks: 30,
    deanMarks: 0,
    hodMarks: 0,
    isMarkHOD: false,
    isMarkDean: false,
    isAdministrativeRole: false,
    administrativeRole: "",
    adminSelfAwardedMarks: 30,
    directorMarks: 0,
    adminDeanMarks: 0,
  });

  const [instituteLevelPortfolio, setInstituteLevelPortfolio] = useState('');
  const [departmentLevelPortfolio, setDepartmentLevelPortfolio] = useState('');

  // Function to fetch portfolio data from backend
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      
      if (!storedUserData) {
        throw new Error("User data not found");
      }
  
      const department = storedUserData.dept;
      const userId = storedUserData._id;
      console.log("Fetching data for:", department, userId);
  
      try {
        const response = await axios.get(`http://127.0.0.1:5000/${department}/${userId}/D`);
        
        if (response.data) {
          setPortfolioData(response.data);
          
          // Update form data with existing values
          setFormData({
            portfolioType: response.data.portfolioType || "both",
            selfAwardedMarks: response.data.selfAwardedMarks || 30,
            deanMarks: response.data.deanMarks || 0,
            hodMarks: response.data.hodMarks || 0,
            isMarkHOD: response.data.isMarkHOD || false,
            isMarkDean: response.data.isMarkDean || false,
            isAdministrativeRole: response.data.isAdministrativeRole || false,
            administrativeRole: response.data.administrativeRole || "",
            adminSelfAwardedMarks: response.data.adminSelfAwardedMarks || 30,
            directorMarks: response.data.directorMarks || 0,
            adminDeanMarks: response.data.adminDeanMarks || 0
          });
          
          // Update institute and department level portfolio texts
          setInstituteLevelPortfolio(response.data.instituteLevelPortfolio || "");
          setDepartmentLevelPortfolio(response.data.departmentLevelPortfolio || "");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If data doesn't exist (first time), initialize with default values
          setFormData({
            portfolioType: "both",
            selfAwardedMarks: 30,
            deanMarks: 0,
            hodMarks: 0,
            isMarkHOD: false,
            isMarkDean: false,
            isAdministrativeRole: false,
            administrativeRole: "",
            adminSelfAwardedMarks: 30,
            directorMarks: 0,
            adminDeanMarks: 0
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
      setFormData(prev => ({
        ...prev,
        error: "Failed to load portfolio data. Please try again."
      }));
      setLoading(false);
      setInitialDataLoaded(true);
    }
  };

  // Load user data and fetch portfolio data
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData'));
    if (storedUserData) {
      setUserData({
        _id: storedUserData._id,
        dept: storedUserData.dept,
        desg: storedUserData.desg,
        name: storedUserData.name,
        role: storedUserData.role,
        mail: storedUserData.mail,
        mob: storedUserData.mob
      });
      fetchPortfolioData();
    } else {
      setLoading(false);
      setInitialDataLoaded(true);
      navigate('/login'); // Redirect to login if no user data found
    }
  }, [navigate]);

  console.log("User Data:", userData);

  // Update administrative role based on designation
  useEffect(() => {
    if (!userData) return;
    
    const designation = userData.desg;
    const isAdminRole =
      designation === "deputy_director" ||
      designation === "dean" ||
      designation === "hod" ||
      designation === "associate_dean";

    setFormData((prev) => ({
      ...prev,
      isAdministrativeRole: isAdminRole,
      administrativeRole: designation,
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
      const selfScore = Math.min(60, Number(formData.adminSelfAwardedMarks) || 0);
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
          superiorScore = ((Number(formData.deanMarks) || 0) + (Number(formData.hodMarks) || 0)) / 2;
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
      const department = userData?.dept || "Computer Science";
      const userId = userData?._id || "123";
      const score = calculatePortfolioScore();
      
      // Prepare payload for API
      const payload = {
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
        isFirstTime: !portfolioData // Add flag to indicate if this is first submission
      };
      
      // Send data to backend
      const method = portfolioData ? 'post' : 'post';
      const response = await axios[method](`http://127.0.0.1:5000/${department}/${userId}/D`, payload);
      
      // Handle successful response
      if (response.data) {
        navigate("/submission-status", {
          state: {
            status: "success",
            formName: "Portfolio Form",
            message: `Your portfolio details have been successfully ${portfolioData ? 'updated' : 'submitted'}!`,
            grandTotal: response.data.grand_total
          },
        });
      }
    } catch (error) {
      console.error("Error submitting portfolio data:", error);
      
      // Show error message
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "Portfolio Form",
          message: "Failed to submit portfolio details. Please try again.",
          error: error.message
        },
      });
    } finally {
      setSubmitting(false);
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
      {designation === "Faculty" && (
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
      )}

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
            <p className="mt-1 text-sm text-gray-500">Maximum marks allowed: 60</p>
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
                        onChange={(e) => setInstituteLevelPortfolio(e.target.value)}
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
                        onChange={(e) => setDepartmentLevelPortfolio(e.target.value)}
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
      <SectionCard title="Current Score" icon="🏆" borderColor="border-yellow-500">
        <ScoreCard 
          label="Total Portfolio Score" 
          score={currentScore} 
          total={120} 
        />
        
        {/* Show marks status information */}
        <div className="mt-4 space-y-2">
          {!formData.isAdministrativeRole && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Self Awarded Marks:</span>
                <span className="font-medium">{formData.selfAwardedMarks}</span>
              </div>
              
              {formData.portfolioType !== "department" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dean Marks:</span>
                  <span className="font-medium">
                    {formData.isMarkDean ? formData.deanMarks : "Not reviewed yet"}
                  </span>
                </div>
              )}
              
              {formData.portfolioType !== "institute" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">HOD Marks:</span>
                  <span className="font-medium">
                    {formData.isMarkHOD ? formData.hodMarks : "Not reviewed yet"}
                  </span>
                </div>
              )}
            </>
          )}
          
          {formData.isAdministrativeRole && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Self Awarded Marks:</span>
                <span className="font-medium">{formData.adminSelfAwardedMarks}</span>
              </div>
              
              {formData.administrativeRole === "associate_dean" ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dean Marks:</span>
                  <span className="font-medium">
                    {formData.isMarkDean ? formData.adminDeanMarks : "Not reviewed yet"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Director Marks:</span>
                  <span className="font-medium">
                    {formData.directorMarks > 0 ? formData.directorMarks : "Not reviewed yet"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-6 py-3 ${
            submitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-lg focus:ring-4 focus:ring-blue-300 transition-colors duration-300 flex items-center`}
        >
          {submitting ? (
            <>
              <ClipLoader size={20} color="#ffffff" className="mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Portfolio Details"
          )}
        </button>
      </div>
    </div>
  );
};

export default Portfolio;