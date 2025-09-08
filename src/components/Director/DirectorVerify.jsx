import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const FacultyEvaluationForm = () => {
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
    isFirstTime: false,
  });

  // Changed from hodMarks to directorMarks
  const [directorMarks, setDirectorMarks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Update the fetchPortfolioData function with proper error handling and null checking
  const fetchPortfolioData = async () => {
    try {
      // Get values from faculty information
      const department = faculty?.department;
      const userId = faculty?.id;

      if (!department || !userId) {
        console.error("Department or User ID is missing");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/D`
      );
      const data = response.data || {};

      setPortfolioData(data);

      console.log("Portfolio Data:", data);

      // Initialize directorMarks from fetched data
      setDirectorMarks(data?.directorMarks ?? 0);
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      // Set default values in case of error
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
        isFirstTime: false,
      });
    }
  };

  // Update the useEffect to include proper dependency array and error handling
  useEffect(() => {
    if (faculty?.id && faculty?.department) {
      fetchPortfolioData();
    } else {
      console.warn("Faculty information is incomplete");
    }
  }, [faculty?.id, faculty?.department]); // Add specific dependencies

  // Calculate total score based on portfolio type
  const calculateTotalScore = () => {
    const selfScore = Math.min(60, Number(portfolioData.selfAwardedMarks) || 0);
    const directorScore = Math.min(60, Number(directorMarks) || 0);

    // For regular faculty
    if (!portfolioData.isAdministrativeRole) {
      switch (portfolioData.portfolioType) {
        case "institute":
          return Math.min(120, selfScore + directorScore); // Changed to use director's marks
        default:
          return selfScore; // For institute level, use self-awarded marks
      }
    }
    return 0; // For administrative roles
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // Updated handleConfirmSubmit to use directorMarks
  const handleConfirmSubmit = async () => {
    try {
      const department = faculty?.department;
      const userId = faculty?.id;

      if (!department || !userId) {
        console.error("Department or User ID is missing");
        return;
      }

      // Only update specific fields while keeping existing data
      const payload = {
        D: {
          ...portfolioData, // Keep all existing data
          directorMarks: Number(directorMarks), // Update Director marks instead of HOD marks
          isMarkDirector: true, // Add tracking for Director verification
          total_marks: calculateTotalScore(), // Update total score
        },
      };

      // First, update the portfolio data with Director marks
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/D`,
        payload
      );
    // Update the status to 'verification_pending' after portfolio marks are assigned
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/director-mark-given`
    );

      setIsModalOpen(false);
      navigate(-1);
    } catch (error) {
      console.error("Error saving marks:", error);
      setIsModalOpen(false);
      // Show error notification to the user
      alert("Failed to submit evaluation. Please try again.");
    }
  };

  // Update the JSX to show portfolio details
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
                className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm min-h-[120px] flex flex-col"
              >
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
            Portfolio Type:{" "}
            {portfolioData?.portfolioType?.toUpperCase() || "Not Specified"}
          </h3>
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Portfolio Documents
            </h3>

            {/* Institute Level Portfolio */}
            {portfolioData.instituteLevelPortfolio && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-2">
                  Institute Level Portfolio
                </h4>
                <div className="bg-white p-4 rounded border border-gray-200">
                  {portfolioData.instituteLevelPortfolio}
                </div>
              </div>
            )}

            {/* Department Level Portfolio */}
            {portfolioData.departmentLevelPortfolio && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-2">
                  Department Level Portfolio
                </h4>
                <div className="bg-white p-4 rounded border border-gray-200">
                  {portfolioData.departmentLevelPortfolio}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Director Marks Input Section - Updated from HOD to Director */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col space-y-4">
            <label className="text-gray-700 font-medium">
              Enter Director Marks (Maximum 60)
            </label>
            <input
              type="number"
              className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              max="60"
              min="0"
              value={directorMarks}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => {
                const value = Math.min(60, Math.max(0, Number(e.target.value)));
                setDirectorMarks(value);
              }}
              onBlur={(e) => {
                const value = Number(e.target.value);
                if (value > 60) {
                  setDirectorMarks(60);
                } else if (value < 0) {
                  setDirectorMarks(0);
                }
              }}
            />
          </div>
        </div>

        {/* Updated Summary Table to use Director marks only (removed HOD marks row) */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 mt-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Cadre</th>
                <th className="border border-gray-300 p-2 text-center">
                  Maximum Marks
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Marks Awarded
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">
                  Self Awarded Marks (50 % of Max)
                </td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {portfolioData.selfAwardedMarks}
                </td>
              </tr>
              {/* Removed HOD marks row completely */}
              <tr>
                <td className="border border-gray-300 p-2">
                  Director Evaluation Marks
                </td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {directorMarks}
                </td>
              </tr>
              {/* Update the total calculation */}
              <tr className="font-medium">
                <td colSpan="2" className="border border-gray-300 p-2">
                  Total Marks Obtained:
                </td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
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
              Details can&apos;t be changed after the final submission. Confirm
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
