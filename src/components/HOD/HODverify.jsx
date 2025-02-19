import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleConfirmSubmit = () => {
    setIsModalOpen(false);
    alert("Submission Confirmed!");
    // Add your submit logic here
    navigate("/hodcnfverify");
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

        {/* PDF Preview Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Portfolio Documents
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <p className="text-gray-500">PDF Preview will appear here</p>
          </div>
        </div>

        {/* Marks Table Section */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">
                  Professor / Associate Professor / Assistant Professor
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  If Involved in Both Institute level portfolio and department
                  level portfolio
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  If Involved in Institute level portfolio only
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  If Involved in and department level portfolio only
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">
                  <div className="space-y-1">
                    <p>Marks to be awarded by Dean(s)</p>
                    <p>[Maximum Marks=60]</p>
                    <p className="font-medium">Name and sign of Dean</p>
                  </div>
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max="60"
                    value={tableData.deanMarks.both}
                    onChange={(e) =>
                      handleInputChange("deanMarks", "both", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max="60"
                    value={tableData.deanMarks.institute}
                    onChange={(e) =>
                      handleInputChange(
                        "deanMarks",
                        "institute",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  -------
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  <div className="space-y-1">
                    <p>Marks to be awarded by HoD</p>
                    <p>Maximum Marks=60</p>
                    <p className="font-medium">Name and sign of HoD</p>
                  </div>
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max="60"
                    value={tableData.hodMarks.both}
                    onChange={(e) =>
                      handleInputChange("hodMarks", "both", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  -------
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max="60"
                    value={tableData.hodMarks.department}
                    onChange={(e) =>
                      handleInputChange(
                        "hodMarks",
                        "department",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  Total marks Considered as to be awarded by Dean /HoD
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Average of 'Sr. No I' and 'Sr. No. II' of this Table ={" "}
                  {calculateColumnAverage()}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Sr. No I of this Table = {tableData.deanMarks.institute}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  Sr. No. II of this Table = {tableData.hodMarks.department}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* New Summary Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 mt-8">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Cadre</th>
                <th className="border border-gray-300 p-2 text-center">
                  Professor /Associate Professor/ Assistant Professor
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Marks Awarded
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2">
                  Self Awarded Marks (50 % of Max) for Handling the Institute
                  Level or Department Level Portfolios
                </td>
                <td className="border border-gray-300 p-2 text-center">60</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    max="60"
                    value={tableData.selfAwarded}
                    onChange={(e) =>
                      handleInputChange2("selfAwarded", null, e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">
                  *Marks to be awarded by
                  <br />
                  Dean (for central portfolio work) and /or
                  <br />
                  HoD (for department portfolio work)
                </td>
                <td className="border border-gray-300 p-2 text-center">60*</td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {calculateMaxMarks().toFixed(1)}
                </td>
              </tr>
              <tr className="font-medium">
                <td colSpan="2" className="border border-gray-300 p-2">
                  Total of Marks Obtained: Portfolio – Departmental & Central:
                  Part I:
                </td>
                <td className="border border-gray-300 p-2 text-center bg-gray-50">
                  {calculateTotal().toFixed(1)}
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
