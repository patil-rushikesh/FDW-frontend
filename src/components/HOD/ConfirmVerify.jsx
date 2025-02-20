import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, RefreshCw } from 'lucide-react';
import Cookies from 'js-cookie';

const ConfirmVerify = () => {
  const location = useLocation();
  const { faculty, portfolioData, verifiedMarks } = location.state || {};
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
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
          `http://127.0.0.1:5000/total_marks/${department}/${facultyId}`
        );

        console.log(response);
        if (response.data.status === "success") {
          setApiData(response.data.data);
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
          extraOrd: "",
          adminWeight: "",
        },
        obtained: {
          academic: apiData.section_totals.A_total || "",
          research:
            apiData.section_totals.B_verified_total ||
            apiData.section_totals.B_total ||
            "",
          selfDev: apiData.section_totals.C_total || "",
          portfolio: apiData.section_totals.D_total || "",
          extraOrd: "",
          adminWeight: "",
        },
      });
    }
  }, [apiData]);

  const handleInputChange = (type, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

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
    return apiData?.grand_total || 0;
  };

  const handleSubmit = async () => {
    const userConfirmed = window.confirm(
      "Details can't be changed after the final submission. Confirm Submit?"
    );
    
    if (userConfirmed) {
      try {
        const response = await axios.post(
          `http://127.0.0.1:5000/${department}/${facultyId}/verify-authority`,
          {
            verifiedMarks: {
              academic: marksData.obtained.academic,
              research: marksData.obtained.research,
              selfDev: marksData.obtained.selfDev,
              portfolio: marksData.obtained.portfolio,
              extraOrd: marksData.obtained.extraOrd,
              adminWeight: marksData.obtained.adminWeight,
            },
            totalMarks: calculateTotal("obtained")
          }
        );
  
        if (response.status === 200) {
          alert("Verification submitted successfully!");
          // Redirect to the faculty forms list page
          navigate('/hod/faculty-forms-list');
        } else {
          alert("Failed to submit verification. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting verification:", error);
        alert("Error submitting verification. Please try again.");
      }
    }
  };

  const generatePDF = useCallback(async (forceUpdate = false) => {
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
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 5000);

      const response = await fetch(
        `http://127.0.0.1:5000/${department}/${facultyId}/generate-doc`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      clearInterval(progressInterval);
      setLoadingProgress(100);

      Cookies.set(`pdfData_${facultyId}`, url, { expires: 1 });
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
      setLoadingProgress(0);
    }
  }, [department, facultyId]);

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
                <RefreshCw size={20} className={pdfLoading ? 'animate-spin' : ''} />
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
          ) : !pdfLoading && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <p className="text-gray-500">PDF will appear here once generated</p>
            </div>
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
                    onChange={(e) =>
                      handleInputChange("obtained", "academic", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("obtained", "selfDev", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("obtained", "portfolio", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("obtained", "extraOrd", e.target.value)
                    }
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
    </div>
  );
};

export default ConfirmVerify;
