import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const FacultyEvaluationForm = () => {
  const location = useLocation();
  const { faculty } = location.state || {};

  const [tableData, setTableData] = useState({
    deanMarks: {
      both: "",
      institute: "",
      department: "",
    },
    hodMarks: {
      both: "",
      institute: "",
      department: "",
    },
    selfAwarded: "",
  });

  const [portfolioData, setPortfolioData] = useState({
    portfolioDetails: {
      adminSelfAwardedMarks: 0,
      administrativeRole: "",
      departmentLevelPortfolio: "",
      instituteLevelPortfolio: "",
      isAdministrative: false,
      selfAwardedMarks: 0,
      superiorMarks: {
        adminDeanMarks: 0,
        deanMarks: 0,
        directorMarks: 0,
        hodMarks: 0
      },
      type: ""
    },
    total_marks: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Update the fetchPortfolioData function with proper error handling and null checking
  const fetchPortfolioData = async () => {
    try {
      // Get values from faculty information
      const department = faculty?.department;
      const userId = faculty?.id;
      
      if (!department || !userId) {
        console.error('Department or User ID is missing');
        return;
      }
  
      const response = await axios.get(`http://localhost:5000/${department}/${userId}/D`);
      const data = response.data || {};
      
      setPortfolioData(data);

      console.log("Portfolio Data:", data);
      
      setTableData(prev => ({
        ...prev,
        selfAwarded: data?.portfolioDetails?.selfAwardedMarks ?? 0,
        hodMarks: {
          ...prev.hodMarks,
          department: data?.portfolioDetails?.superiorMarks?.hodMarks ?? 0
        }
      }));
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      // Set default values in case of error
      setPortfolioData({
        portfolioDetails: {
          adminSelfAwardedMarks: 0,
          administrativeRole: "",
          departmentLevelPortfolio: "",
          instituteLevelPortfolio: "",
          isAdministrative: false,
          selfAwardedMarks: 0,
          superiorMarks: {
            adminDeanMarks: 0,
            deanMarks: 0,
            directorMarks: 0,
            hodMarks: 0
          },
          type: ""
        },
        total_marks: 0
      });
    }
  };

  // Update the useEffect to include proper dependency array and error handling
  useEffect(() => {
    if (faculty?.id && faculty?.department) {
      fetchPortfolioData();
    } else {
      console.warn('Faculty information is incomplete');
    }
  }, [faculty?.id, faculty?.department]); // Add specific dependencies

  const calculateMaxMarks = () => {
    const avg = calculateColumnAverage();
    const instituteMarks = parseFloat(tableData.deanMarks.institute) || 0;
    const deptMarks = parseFloat(tableData.hodMarks.department) || 0;
    return Math.max(avg, instituteMarks, deptMarks);
  };

  const calculateTotal = () => {
    const selfAwarded = parseFloat(tableData.selfAwarded) || 0;
    const maxMarks = calculateMaxMarks();
    return selfAwarded + maxMarks;
  };

  const handleInputChange2 = (section, column, value) => {
    setTableData((prev) => ({
      ...prev,
      [section]:
        section === "selfAwarded"
          ? value
          : {
              ...prev[section],
              [column]: value,
            },
    }));
  };

  function handleInputChange(field, subField, value) {
    setTableData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[field][subField] = value;
      return updatedData;
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const department = faculty?.department;
      const userId = faculty?.id;
  
      if (!department || !userId) {
        console.error('Department or User ID is missing');
        return;
      }
  
      // Prepare the data to be sent
      const updatedPortfolioData = {
        ...portfolioData,
        portfolioDetails: {
          ...portfolioData.portfolioDetails,
          superiorMarks: {
            ...portfolioData.portfolioDetails.superiorMarks,
            hodMarks: parseFloat(tableData.hodMarks.department) || 0
          }
        },
        total_marks: parseFloat(totalMarks()) // Moved outside portfolioDetails
      };
  
      // Make the POST request
      await axios.post(`http://localhost:5000/${department}/${userId}/D`, updatedPortfolioData);
  
      setIsModalOpen(false);
      alert("Marks saved successfully!");
      navigate("/hodcnfverify");
    } catch (error) {
      console.error("Error saving marks:", error);
      alert("Error saving marks. Please try again.");
      setIsModalOpen(false);
    }
  };

  const calculateAverage = () => {
    const deanBoth = parseFloat(tableData.deanMarks.both) || 0;
    const hodBoth = parseFloat(tableData.hodMarks.both) || 0;
    return ((deanBoth + hodBoth) / 2).toFixed(2);
  };

  const calculateColumnAverage = () => {
    const deanInstitute = parseFloat(tableData.deanMarks.both) || 0;
    const hodInstitute = parseFloat(tableData.hodMarks.both) || 0;
    return ((deanInstitute + hodInstitute) / 2).toFixed(2);
  };

  const totalMarks = () => {
    const selfAwardedMarks = parseFloat(portfolioData?.portfolioDetails?.selfAwardedMarks) || 0;
    const hodMarks = parseFloat(tableData.hodMarks.department) || 0;
    return (selfAwardedMarks + hodMarks).toFixed(2);
  };

  const PortfolioDocuments = () => {
    const type = portfolioData?.portfolioDetails?.type;
    
    return (
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Portfolio Documents
        </h3>
        
        {/* Institute Level Portfolio */}
        {(type === 'both' || type === 'institute') && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-2">Institute Level Portfolio</h4>
            <div className="bg-white p-4 rounded border border-gray-200">
              {portfolioData?.portfolioDetails?.instituteLevelPortfolio || 'No document available'}
            </div>
          </div>
        )}
        
        {/* Department Level Portfolio */}
        {(type === 'both' || type === 'department') && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <h4 className="font-medium text-gray-700 mb-2">Department Level Portfolio</h4>
            <div className="bg-white p-4 rounded border border-gray-200">
              {portfolioData?.portfolioDetails?.departmentLevelPortfolio || 'No document available'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Faculty Portfolio Evaluation
          </h1>
        </div>

        {/* Faculty Information Section */}
{/* Faculty Information Section */}
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
  <h2 className="text-xl font-semibold text-blue-800 mb-4">Faculty Information</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { label: "Faculty Name", value: faculty?.name },
      { label: "Faculty ID", value: faculty?.id },
      { label: "Faculty Role", value: faculty?.role },
      { label: "Department", value: faculty?.department }
    ].map((item, index) => (
      <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm min-h-[120px] flex flex-col">
        <label className="block text-sm font-medium text-blue-700 mb-2">
          {item.label}
        </label>
        <div className="flex-1 w-full p-2 bg-blue-50 border border-blue-200 rounded-md text-gray-700 font-medium flex items-center">
          {item.value || "N/A"}
        </div>
      </div>
    ))}
  </div>
</div>

        {/* Portfolio Type and Documents Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Portfolio Type: {portfolioData?.portfolioDetails?.type?.toUpperCase() || 'Not Specified'}
          </h3>
          <PortfolioDocuments />
        </div>

        {/* HOD Marks Input Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col space-y-4">
            <label className="text-gray-700 font-medium">
              Enter HOD Marks (Maximum 60)
            </label>
            <input
              type="number"
              className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              max="60"
              min="0"
              value={tableData.hodMarks.department}
              onChange={(e) => handleInputChange("hodMarks", "department", e.target.value)}
            />
          </div>
        </div>

        {/* Update the Summary Table to use only HOD marks */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 mt-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Cadre</th>
                <th className="border border-gray-300 p-2 text-center">Maximum Marks</th>
                <th className="border border-gray-300 p-2 text-center">Marks Awarded</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">
                  Self Awarded Marks (50 % of Max)
                </td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {portfolioData?.portfolioDetails?.selfAwardedMarks || 0}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  HOD Evaluation Marks
                </td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {tableData.hodMarks.department}
                </td>
              </tr>
              {/* Update the problematic table row with the new calculation */}
              <tr className="font-medium">
                <td colSpan="2" className="border border-gray-300 p-2">
                  Total Marks Obtained:
                </td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {totalMarks()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="mb-4">
              Details can't be changed after the final submission. Confirm
              Submit?
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyEvaluationForm;
