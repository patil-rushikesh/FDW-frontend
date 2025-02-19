import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = 'http://127.0.0.1:5000';

const fetchPortfolioAPI = async (department, userId) => {
  const response = await fetch(
    `${API_BASE_URL}/${department}/${userId}/D`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

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

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    portfolioType: "both",
    selfAwardedMarks: 30,
    deanMarks: 0,
    hodMarks: 0,
    isAdministrativeRole: false,
    administrativeRole: "",
    adminSelfAwardedMarks: 30,
    directorMarks: 0,
    adminDeanMarks: 0,
  });

  const [portfolioData, setPortfolioData] = useState(null);
  const [instituteLevelPortfolio, setInstituteLevelPortfolio] = useState('');
  const [departmentLevelPortfolio, setDepartmentLevelPortfolio] = useState('');

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

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!userData?.dept || !userData?._id) {
        setLoading(false);
        setInitialDataLoaded(true);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/${userData.dept}/${userData._id}/D`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data?.D?.portfolioDetails) {
          const details = data.D.portfolioDetails;
          setPortfolioData(data.D);
          
          // Update form data with received values
          setFormData(prev => ({
            ...prev,
            portfolioType: details.type || 'both',
            isAdministrativeRole: details.isAdministrative || false,
            administrativeRole: details.administrativeRole || 'Faculty',
            selfAwardedMarks: details.selfAwardedMarks || 30,
            adminSelfAwardedMarks: details.adminSelfAwardedMarks || 30,
            deanMarks: details.superiorMarks?.deanMarks || 0,
            hodMarks: details.superiorMarks?.hodMarks || 0,
            directorMarks: details.superiorMarks?.directorMarks || 0,
            adminDeanMarks: details.superiorMarks?.adminDeanMarks || 0,
          }));
          
          // Update portfolio text areas
          setInstituteLevelPortfolio(details.instituteLevelPortfolio || '');
          setDepartmentLevelPortfolio(details.departmentLevelPortfolio || '');
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        setFormData(prev => ({
          ...prev,
          error: 'Failed to load portfolio data. Please try again later.'
        }));
      } finally {
        setLoading(false);
        setInitialDataLoaded(true);
      }
    };

    fetchPortfolioData();
  }, [userData]);

  const handlePortfolioTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      portfolioType: value,
    }));
  };

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

  const handleSubmit = async () => {
    if (!userData || !userData.dept || !userData._id) {
      alert("Department and User ID are required. Please login again.");
      return;
    }

    setSubmitting(true);

    const payload = {
      portfolioDetails: {
        type: formData.portfolioType,
        isAdministrative: formData.isAdministrativeRole,
        administrativeRole: formData.administrativeRole,
        selfAwardedMarks: formData.isAdministrativeRole
          ? Number(formData.adminSelfAwardedMarks)
          : Number(formData.selfAwardedMarks),
        adminSelfAwardedMarks: Number(formData.adminSelfAwardedMarks),
        instituteLevelPortfolio: instituteLevelPortfolio,
        departmentLevelPortfolio: departmentLevelPortfolio,
        superiorMarks: {
          deanMarks: Number(formData.deanMarks),
          hodMarks: Number(formData.hodMarks),
          directorMarks: Number(formData.directorMarks),
          adminDeanMarks: Number(formData.adminDeanMarks)
        }
      },
      total_marks: calculatePortfolioScore()
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${userData.dept}/${userData._id}/D`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit data");
      }

      const responseData = await response.json();

      navigate("/submission-status", {
        state: {
          status: "success",
          formName: "Portfolio Form",
          message: "Your portfolio details have been successfully submitted!",
          grandTotal: responseData.grand_total || calculatePortfolioScore()
        },
      });
    } catch (error) {
      console.error("Error submitting portfolio data:", error);
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "Portfolio Form",
          error: error.message || "Failed to submit portfolio data",
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
          <p>User data not found. Please log in again.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const designation = userData.desg;

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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [formData.isAdministrativeRole
                    ? "adminSelfAwardedMarks"
                    : "selfAwardedMarks"]: e.target.value,
                }))
              }
              className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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

      {/* Score Summary */}
      {portfolioData && (
        <SectionCard title="Current Score" icon="🏆" borderColor="border-yellow-500">
          <ScoreCard 
            label="Total Portfolio Score" 
            score={portfolioData.total_marks} 
            total={120} 
          />
        </SectionCard>
      )}

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