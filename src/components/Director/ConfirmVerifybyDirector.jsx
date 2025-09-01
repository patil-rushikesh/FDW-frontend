import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, RefreshCw } from "lucide-react";
import Cookies from "js-cookie";

const ConfirmDirectorVerify = () => {
  const location = useLocation();
  const { faculty, portfolioData, verifiedMarks } = location.state || {};
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // Add this to your state declarations at the top of the component
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalInfo, setErrorModalInfo] = useState({
    show: false,
    message: "",
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get department and faculty_id from state or params
  const params = useParams();
  const department = faculty?.department || params?.department;
  const facultyId = faculty?.id || params?.faculty_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/total_marks/${department}/${facultyId}`
        );

        console.log(response);
        if (response.data.status === "success") {
          const apiResponse = response.data.data;
          setApiData({
            name: apiResponse.name,
            _id: apiResponse._id,
            department: apiResponse.department,
            status: apiResponse.status,
            grand_total: apiResponse.grand_total_marks,
            grand_verified_total: apiResponse.grand_verified_marks,
            section_totals: {
              A_total: apiResponse.section_totals.A_total,
              A_verified_total: apiResponse.section_totals.A_verified_total,
              B_total: apiResponse.section_totals.B_total,
              B_verified_total: apiResponse.section_totals.B_verified_total,
              C_total: apiResponse.section_totals.C_total,
              C_verified_total: apiResponse.section_totals.C_verified_total,
              D_total: apiResponse.section_totals.D_total,
              D_verified_total: apiResponse.section_totals.D_verified_total,
              E_total: apiResponse.section_totals.E_total,
              E_verified_total: apiResponse.section_totals.E_verified_total,
            },
          });
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Error connecting to API: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (department && facultyId) {
      fetchData();
    }
  }, [department, facultyId]);

  // Replace the dummy faculty info with actual data from API
  const facultyInfo = {
    name: apiData?.name || faculty?.name || "Not Available",
    id: apiData?._id || faculty?.id || "Not Available",
    role: faculty?.role || "Not Available",
    department: apiData?.department || faculty?.department || "Not Available",
  };

  const [marksData, setMarksData] = useState({
    claimed: {
      academic: "",
      research: "",
      selfDev: "",
      portfolio: "",
      extraOrd: "",
      adminWeight: "",
    },
    obtained: {
      academic: "",
      research: "",
      selfDev: "",
      portfolio: "",
      extraOrd: "",
      adminWeight: "",
    },
  });

  // Update marks data when API data is loaded
  useEffect(() => {
    if (apiData) {
      setMarksData({
        claimed: {
          academic: apiData.section_totals.A_total || "",
          research: apiData.section_totals.B_total || "",
          selfDev: apiData.section_totals.C_total || "",
          portfolio: apiData.section_totals.D_total || "",
          extraOrd: apiData.section_totals.E_total || "",
          adminWeight: "",
        },
        obtained: {
          academic:
            apiData.section_totals.A_verified_total ||
            apiData.section_totals.A_total ||
            "",
          research:
            apiData.section_totals.B_verified_total ||
            apiData.section_totals.B_total ||
            "",
          selfDev:
            apiData.section_totals.C_verified_total ||
            apiData.section_totals.C_total ||
            "",
          portfolio:
            apiData.section_totals.D_verified_total ||
            apiData.section_totals.D_total ||
            "",
          extraOrd:
            apiData.section_totals.E_verified_total ||
            apiData.section_totals.E_total ||
            "",
          adminWeight: "",
        },
      });
    }
  }, [apiData]);

  // Add this function at the component level
  const getMaxMarksBySection = (section, role) => {
    const maxMarks = {
      academic: {
        professor: 300,
        "associate professor": 360,
        "assistant professor": 440,
      },
      selfDev: {
        professor: 160,
        "associate professor": 170,
        "assistant professor": 180,
      },
      portfolio: {
        professor: 120,
        "associate professor": 120,
        "assistant professor": 120,
      },
      extraOrd: {
        professor: 50,
        "associate professor": 50,
        "assistant professor": 50,
      },
    };

    const roleKey = role?.toLowerCase() || "assistant professor";
    return maxMarks[section]?.[roleKey] || 0;
  };

  // Update the handleInputChange function
  const handleInputChange = (type, field, value) => {
    const maxMarks = getMaxMarksBySection(field, facultyInfo.role);
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.min(Math.max(0, numValue), maxMarks);

    setMarksData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: clampedValue,
      },
    }));
  };

  // Update the input fields

  // const handleInputChange = (type, field, value) => {
  //   setMarksData((prev) => ({
  //     ...prev,
  //     [type]: {
  //       ...prev[type],
  //       [field]: value,
  //     },
  //   }));
  // };

  const calculateTotal = (type) => {
    if (type === "obtained") {
      const values = {
        academic: parseFloat(marksData.obtained.academic) || 0,
        research: parseFloat(marksData.obtained.research) || 0,
        selfDev: parseFloat(marksData.obtained.selfDev) || 0,
        portfolio: parseFloat(marksData.obtained.portfolio) || 0,
        extraOrd: parseFloat(marksData.obtained.extraOrd) || 0,
        adminWeight: parseFloat(marksData.obtained.adminWeight) || 0,
      };
      const sum = Object.values(values).reduce((acc, curr) => acc + curr, 0);
      return Math.min(1000, sum);
    } else {
      const values = Object.values(marksData[type]);
      const sum = values.reduce(
        (acc, curr) => acc + (parseFloat(curr) || 0),
        0
      );
      return Math.min(1000, sum);
    }
  };

  const getTotalFromApi = () => {
    return apiData?.grand_total_marks || 0;
  };

  const handleSubmit = async () => {
    setConfirmModalOpen(true);
  };

  const processSubmission = async () => {
    try {
      // Format the data according to the required structure
      const formattedData = {
        A: { verified_marks: parseFloat(marksData.obtained.academic) || 0 },
        B: { verified_marks: parseFloat(marksData.obtained.research) || 0 },
        C: { verified_marks: parseFloat(marksData.obtained.selfDev) || 0 },
        D: { verified_marks: parseFloat(marksData.obtained.portfolio) || 0 },
        E: { verified_marks: parseFloat(marksData.obtained.extraOrd) || 0 },
      };

      // First submit the verified marks
      const markResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/total_marks/${department}/${facultyId}`,
        formattedData
      );

      if (markResponse.status === 200) {
        // Then update the status to Interaction_pending
        const statusResponse = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/${department}/${facultyId}/verify-authority`
        );

        if (statusResponse.status === 200) {
          setShowSuccessModal(true);
        } else {
          setErrorModalInfo({
            show: true,
            message: "Failed to update verification status. Please try again.",
          });
        }
      } else {
        setErrorModalInfo({
          show: true,
          message: "Failed to submit verification marks. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      setErrorModalInfo({
        show: true,
        message: `Error: ${error.response?.data?.error || error.message}. Please try again.`,
      });
    }
  };

  const generatePDF = useCallback(
    async (forceUpdate = false) => {
      if (!forceUpdate) {
        const cachedPdf = Cookies.get(`pdfData_${facultyId}`);
        if (cachedPdf) {
          setPdfUrl(cachedPdf);
          return;
        }
      }

      setPdfLoading(true);
      setLoadingProgress(0);

      try {
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 5000);

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/${department}/${facultyId}/generate-doc`,
          {
            method: "GET",
          }
        );

        if (!response.ok) throw new Error("Failed to generate PDF");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        clearInterval(progressInterval);
        setLoadingProgress(100);

        Cookies.set(`pdfData_${facultyId}`, url, { expires: 1 });
        setPdfUrl(url);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setPdfLoading(false);
        setLoadingProgress(0);
      }
    },
    [department, facultyId]
  );

  useEffect(() => {
    if (department && facultyId) {
      generatePDF();
    }
  }, [generatePDF, department, facultyId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading faculty data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg">{error}</p>
          <p className="mt-2">Please check the API connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Faculty Information Section with new styling */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Faculty Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Faculty Name", value: facultyInfo.name },
              { label: "Faculty ID", value: facultyInfo.id },
              { label: "Faculty Role", value: facultyInfo.role },
              { label: "Department", value: facultyInfo.department },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm min-h-[120px] flex flex-col"
              >
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  {item.label}
                </label>
                <div className="flex-1 w-full p-2 bg-blue-50 border border-blue-200 rounded-md text-gray-700 font-medium flex items-center">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Summary Section with matching styling */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Verification Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Self Awarded Marks",
                value: calculateTotal("claimed") || apiData?.grand_total || 0,
              },
              {
                label: "Verified Marks",
                value: calculateTotal("obtained") || apiData?.grand_total || 0,
              },
              {
                label: "Approval Status",
                value: apiData?.status
                  ? apiData.status.replace(/_/g, " ").toUpperCase()
                  : "PENDING",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm min-h-[100px] flex flex-col"
              >
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  {item.label}
                </label>
                <div className="flex-1 w-full p-2 bg-blue-50 border border-blue-200 rounded-md text-gray-700 font-medium flex items-center justify-center">
                  <span className="text-xl">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Preview */}
        {/* PDF Preview Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-blue-800">
              Portfolio Documents
            </h3>
            <div className="flex gap-2">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download={`${facultyId}.pdf`}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download size={20} />
                  Download PDF
                </a>
              )}
              <button
                onClick={() => generatePDF(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                disabled={pdfLoading}
              >
                <RefreshCw
                  size={20}
                  className={pdfLoading ? "animate-spin" : ""}
                />
                Regenerate PDF
              </button>
            </div>
          </div>

          {pdfLoading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-gray-600">
                Generating PDF... {loadingProgress}%
              </p>
            </div>
          )}

          {pdfUrl && !pdfLoading ? (
            <div className="w-full h-[800px] border border-gray-300 rounded-lg">
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg"
                title="Faculty Data PDF"
              />
            </div>
          ) : (
            !pdfLoading && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500">
                  PDF will appear here once generated
                </p>
              </div>
            )
          )}
        </div>
        {/* Complete Summary Table */}
        <div className="overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-center">
            Summary Marks Obtained/Awarded of Self Appraisal System
          </h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 p-2">Part</th>
                <th className="border border-gray-300 p-2">
                  Description of Self Appraisal System Part
                </th>
                <th
                  colSpan="3"
                  className="border border-gray-300 p-2 text-center"
                >
                  Cadre Specific Maximum Marks
                </th>
                <th className="border border-gray-300 p-2">
                  Marks Claimed by Faculty
                </th>
                <th className="border border-gray-300 p-2">
                  Marks Obtained after Verification
                </th>
              </tr>
              <tr>
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2">Professor</th>
                <th className="border border-gray-300 p-2">
                  Associate Professor
                </th>
                <th className="border border-gray-300 p-2">
                  Assistant Professor
                </th>
                <th className="border border-gray-300 p-2"></th>
                <th className="border border-gray-300 p-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">A</td>
                <td className="border border-gray-300 p-2">
                  Academic Involvement
                </td>
                <td className="border border-gray-300 p-2 text-center">300</td>
                <td className="border border-gray-300 p-2 text-center">360</td>
                <td className="border border-gray-300 p-2 text-center">440</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                    value={marksData.claimed.academic}
                    readOnly
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border-2 border-green-500 rounded focus:outline-none focus:border-green-600"
                    value={marksData.obtained.academic}
                    min="0"
                    max={getMaxMarksBySection("academic", facultyInfo.role)}
                    onChange={(e) =>
                      handleInputChange("obtained", "academic", e.target.value)
                    }
                    onWheel={(e) => e.target.blur()}
                    onBlur={(e) => {
                      const maxMarks = getMaxMarksBySection(
                        "academic",
                        facultyInfo.role
                      );
                      const value = Number(e.target.value);
                      if (value > maxMarks) {
                        handleInputChange("obtained", "academic", maxMarks);
                      } else if (value < 0) {
                        handleInputChange("obtained", "academic", 0);
                      }
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">B</td>
                <td className="border border-gray-300 p-2">
                  Research and Development
                </td>
                <td className="border border-gray-300 p-2 text-center">370</td>
                <td className="border border-gray-300 p-2 text-center">300</td>
                <td className="border border-gray-300 p-2 text-center">210</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                    value={marksData.claimed.research}
                    readOnly
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                    value={marksData.obtained.research}
                    readOnly
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">C</td>
                <td className="border border-gray-300 p-2">Self-Development</td>
                <td className="border border-gray-300 p-2 text-center">160</td>
                <td className="border border-gray-300 p-2 text-center">170</td>
                <td className="border border-gray-300 p-2 text-center">180</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                    value={marksData.claimed.selfDev}
                    readOnly
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border-2 border-green-500 rounded focus:outline-none focus:border-green-600"
                    value={marksData.obtained.selfDev}
                    min="0"
                    max={getMaxMarksBySection("selfDev", facultyInfo.role)}
                    onChange={(e) =>
                      handleInputChange("obtained", "selfDev", e.target.value)
                    }
                    onWheel={(e) => e.target.blur()}
                    onBlur={(e) => {
                      const maxMarks = getMaxMarksBySection(
                        "selfDev",
                        facultyInfo.role
                      );
                      const value = Number(e.target.value);
                      if (value > maxMarks) {
                        handleInputChange("obtained", "selfDev", maxMarks);
                      } else if (value < 0) {
                        handleInputChange("obtained", "selfDev", 0);
                      }
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">D</td>
                <td className="border border-gray-300 p-2">
                  Portfolio – Institute Level and /or Departmental Level
                </td>
                <td className="border border-gray-300 p-2 text-center">120</td>
                <td className="border border-gray-300 p-2 text-center">120</td>
                <td className="border border-gray-300 p-2 text-center">120</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                    value={marksData.claimed.portfolio}
                    readOnly
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border-2 border-green-500 rounded focus:outline-none focus:border-green-600"
                    value={marksData.obtained.portfolio}
                    min="0"
                    max={getMaxMarksBySection("portfolio", facultyInfo.role)}
                    onChange={(e) =>
                      handleInputChange("obtained", "portfolio", e.target.value)
                    }
                    onWheel={(e) => e.target.blur()}
                    onBlur={(e) => {
                      const maxMarks = getMaxMarksBySection(
                        "portfolio",
                        facultyInfo.role
                      );
                      const value = Number(e.target.value);
                      if (value > maxMarks) {
                        handleInputChange("obtained", "portfolio", maxMarks);
                      } else if (value < 0) {
                        handleInputChange("obtained", "portfolio", 0);
                      }
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">E</td>
                <td className="border border-gray-300 p-2">
                  Extra-ordinary Contribution
                </td>
                <td className="border border-gray-300 p-2 text-center">50</td>
                <td className="border border-gray-300 p-2 text-center">50</td>
                <td className="border border-gray-300 p-2 text-center">50</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded bg-gray-100"
                    value={marksData.claimed.extraOrd}
                    readOnly
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border-2 border-green-500 rounded focus:outline-none focus:border-green-600"
                    value={marksData.obtained.extraOrd}
                    min="0"
                    max={getMaxMarksBySection("extraOrd", facultyInfo.role)}
                    onChange={(e) =>
                      handleInputChange("obtained", "extraOrd", e.target.value)
                    }
                    onWheel={(e) => e.target.blur()}
                    onBlur={(e) => {
                      const maxMarks = getMaxMarksBySection(
                        "extraOrd",
                        facultyInfo.role
                      );
                      const value = Number(e.target.value);
                      if (value > maxMarks) {
                        handleInputChange("obtained", "extraOrd", maxMarks);
                      } else if (value < 0) {
                        handleInputChange("obtained", "extraOrd", 0);
                      }
                    }}
                  />
                </td>
              </tr>

              <tr className="font-bold bg-gray-50">
                <td colSpan="5" className="border border-gray-300 p-2">
                  Total* *Minimum of [1000, Claimed/Obtained Marks]
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {calculateTotal("claimed")}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {calculateTotal("obtained")}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm text-gray-600">
            *Please Note: The Total Marks claimed by faculty/ Marks obtained
            after verification can not exceed 1000.
            <br />
            (including Deputy Director/ Dean/HoD/ Associate Dean; the Total
            marks will be a Minimum of [1000, Claimed/Obtained Marks] )
          </p>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Verification Successful!
              </h3>
              <p className="text-gray-600 text-center">
                The faculty verification was submitted successfully.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(-1); // Navigate back when dismissed
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {errorModalInfo.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Error
              </h3>
              <p className="text-gray-600 text-center">
                {errorModalInfo.message}
              </p>
              <div className="mt-6">
                <button
                  onClick={() =>
                    setErrorModalInfo({ show: false, message: "" })
                  }
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Confirm Submission
              </h3>
              <p className="text-gray-600 text-center">
                Details can't be changed after the final submission. Are you
                sure you want to proceed?
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmModalOpen(false);
                    processSubmission();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmDirectorVerify;
