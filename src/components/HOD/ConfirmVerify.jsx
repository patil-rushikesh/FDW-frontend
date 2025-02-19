import React, { useState } from "react";

const ConfirmVerify = () => {
  // Dummy faculty data
  const facultyInfo = {
    name: "Dr. John Doe",
    id: "FAC2024001",
    role: "Associate Professor",
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
    const values = Object.values(marksData[type]);
    const sum = values.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    return Math.min(1000, sum);
  };

  const handleSubmit = () => {
    const userConfirmed = window.confirm(
      "Details can't be changed after the final submission. Confirm Submit?"
    );
    if (userConfirmed) {
      alert("Submission Confirmed!");
      // Add your submit logic here
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Faculty Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty Name
            </label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-700">
              {facultyInfo.name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty ID
            </label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-700">
              {facultyInfo.id}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty Role
            </label>
            <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-gray-700">
              {facultyInfo.role}
            </div>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Portfolio Documents
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <p className="text-gray-500">PDF Preview will appear here</p>
          </div>
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
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.claimed.academic}
                    onChange={(e) =>
                      handleInputChange("claimed", "academic", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
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
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.claimed.research}
                    onChange={(e) =>
                      handleInputChange("claimed", "research", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.obtained.research}
                    onChange={(e) =>
                      handleInputChange("obtained", "research", e.target.value)
                    }
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
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.claimed.selfDev}
                    onChange={(e) =>
                      handleInputChange("claimed", "selfDev", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
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
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.claimed.portfolio}
                    onChange={(e) =>
                      handleInputChange("claimed", "portfolio", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
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
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.claimed.extraOrd}
                    onChange={(e) =>
                      handleInputChange("claimed", "extraOrd", e.target.value)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.obtained.extraOrd}
                    onChange={(e) =>
                      handleInputChange("obtained", "extraOrd", e.target.value)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">AW*</td>
                <td className="border border-gray-300 p-2">
                  Administration Weightage (Deputy Director/ Dean/HoD/ Associate
                  Dean)
                </td>
                <td
                  colSpan="3"
                  className="border border-gray-300 p-2 text-center"
                >
                  100 (for Deputy Director/ Dean/ HoD)
                  <br />
                  and
                  <br />
                  50 (for Associate Dean)
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.claimed.adminWeight}
                    onChange={(e) =>
                      handleInputChange(
                        "claimed",
                        "adminWeight",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="number"
                    className="w-full p-1 border border-gray-300 rounded"
                    value={marksData.obtained.adminWeight}
                    onChange={(e) =>
                      handleInputChange(
                        "obtained",
                        "adminWeight",
                        e.target.value
                      )
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
