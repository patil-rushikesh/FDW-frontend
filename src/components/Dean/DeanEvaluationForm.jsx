import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const DeanEvaluationForm = () => {
  const location = useLocation();
  const { faculty } = location.state || {};

  const [portfolioData, setPortfolioData] = useState({
    portfolioType: "both",
    selfAwardedMarks: 0,
    deanMarks: 0,
    hodMarks: 0,
    isMarkHOD: false,
    isMarkDean: false,
    isAdministrativeRole: false,
    administrativeRole: "",
    adminSelfAwardedMarks: 30,
    directorMarks: 0,
    adminDeanMarks: 0,
    instituteLevelPortfolio: "",
    departmentLevelPortfolio: "",
    total_marks: 0,
    isFirstTime: false
  });

  const [deanMarks, setDeanMarks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchPortfolioData = async () => {
    try {
      const department = faculty?.department;
      const userId = faculty?.id;

      if (!department || !userId) {
        console.error("Department or User ID is missing");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/${department}/${userId}/D`
      );
      const data = response.data || {};

      setPortfolioData(data);
      console.log("Portfolio Data:", data);
      setDeanMarks(data?.deanMarks ?? 0);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      setPortfolioData({
        portfolioType: "both",
        selfAwardedMarks: 0,
        deanMarks: 0,
        hodMarks: 0,
        isMarkHOD: false,
        isMarkDean: false,
        isAdministrativeRole: false,
        administrativeRole: "",
        adminSelfAwardedMarks: 30,
        directorMarks: 0,
        adminDeanMarks: 0,
        instituteLevelPortfolio: "",
        departmentLevelPortfolio: "",
        total_marks: 0,
        isFirstTime: false
      });
    }
  };

  useEffect(() => {
    if (faculty?.id && faculty?.department) {
      fetchPortfolioData();
    } else {
      console.warn("Faculty information is incomplete");
    }
  }, [faculty?.id, faculty?.department]);

  const calculateTotalScore = () => {
    const selfScore = Math.min(60, Number(portfolioData.selfAwardedMarks) || 0);
    const hodScore = Math.min(60, Number(portfolioData.hodMarks) || 0);
    const deanScore = Math.min(60, Number(deanMarks) || 0);

    if (!portfolioData.isAdministrativeRole) {
      switch (portfolioData.portfolioType) {
        case "both":
          return Math.min(180, selfScore + (hodScore/2) + (deanScore/2));
        case "institute":
          return Math.min(120, selfScore + deanScore); // Only self and dean marks
        case "department":
          return Math.min(120, selfScore + hodScore); // Only self and HOD marks
        default:
          return selfScore;
      }
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const department = faculty?.department;
      const userId = faculty?.id;

      if (!department || !userId) {
        console.error("Department or User ID is missing");
        return;
      }

      const updatedPortfolioData = {
        ...portfolioData,
        deanMarks: Number(deanMarks),
        isMarkDean: true,
        status: "Done", // Update status to Done after dean verification
        total_marks: calculateTotalScore()
      };

      await axios.post(
        `http://localhost:5000/${department}/${userId}/D`,
        updatedPortfolioData
      );

      setIsModalOpen(false);
      alert("Marks saved successfully!");
      navigate("/associate-deans-list"); // Navigate back to the list
    } catch (error) {
      console.error("Error saving marks:", error);
      alert("Error saving marks. Please try again.");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Faculty Portfolio Evaluation - Dean Review
          </h1>
        </div>

        {/* Faculty Information Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Faculty Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Faculty Name", value: faculty?.name },
              { label: "Faculty ID", value: faculty?.id },
              { label: "Faculty Role", value: faculty?.role },
              { label: "Department", value: faculty?.department },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm"
              >
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  {item.label}
                </label>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  {item.value || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Type and Documents Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Portfolio Type: {portfolioData?.portfolioType?.toUpperCase() || "Not Specified"}
          </h3>
          <div className="space-y-4">
            {portfolioData.instituteLevelPortfolio && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-2">Institute Level Portfolio</h4>
                <div className="bg-white p-4 rounded border border-gray-200">
                  {portfolioData.instituteLevelPortfolio}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dean Marks Input Section */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col space-y-4">
            <label className="text-gray-700 font-medium">
              Enter Dean Marks (Maximum 60)
            </label>
            <input
              type="number"
              className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              max="60"
              min="0"
              value={deanMarks}
              onChange={(e) => setDeanMarks(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Evaluation Type</th>
                <th className="border border-gray-300 p-2 text-center">Maximum Marks</th>
                <th className="border border-gray-300 p-2 text-center">Marks Awarded</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">Self Awarded Marks</td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center">
                  {portfolioData.selfAwardedMarks}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">HOD Evaluation Marks</td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center">
                  {portfolioData.hodMarks}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Dean Evaluation Marks</td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center">
                  {deanMarks}
                </td>
              </tr>
              <tr className="font-medium">
                <td colSpan="2" className="border border-gray-300 p-2">
                  Total Marks Obtained:
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {calculateTotalScore()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Submit Evaluation
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="mb-4">
              Details can't be changed after the final submission. Are you sure you want to submit?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
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

export default DeanEvaluationForm;