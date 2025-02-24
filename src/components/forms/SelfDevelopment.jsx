import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ClipLoader } from "react-spinners"; // Add this import
//import Loader from "../ui/Loader"; // Remove this import

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

const CheckboxField = ({ label, checked, onChange, disabled = false }) => (
  <div className="flex items-center gap-2 mb-4">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-5 w-5 text-blue-600 rounded"
    />
    <label className="text-sm font-medium text-gray-700">{label}</label>
  </div>
);

const InputField = ({ label, name, type = "number", value, onChange, placeholder, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min="0"
      onKeyDown={(e) => {
        if (e.key === '-') {
          e.preventDefault();
        }
      }}
      onWheel={(e) => e.target.blur()}
      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  </div>
);

// Add this new RadioField component after the existing components
const RadioField = ({ label, name, checked, onChange, disabled = false }) => (
  <div className="flex items-center gap-2 mb-4">
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-5 w-5 text-blue-600"
    />
    <label className="text-sm font-medium text-gray-700">{label}</label>
  </div>
);

const SelfDevelopment = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const [formData, setFormData] = useState({
    // Qualification fields
    pdfCompleted: false,
    pdfOngoing: false,
    phdAwarded: false,

    // Training Programs Attended
    twoWeekProgram: 0,
    oneWeekProgram: 0,
    twoToFiveDayProgram: 0,
    oneDayProgram: 0,

    // Training Programs Organized
    organizedTwoWeekProgram: 0,
    organizedOneWeekProgram: 0,
    organizedTwoToFiveDayProgram: 0,
    organizedOneDayProgram: 0,

    // PhD Guided
    phdDegreeAwarded: 0,
    phdThesisSubmitted: 0,
    phdScholarsGuiding: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExistingData = async () => {
      setIsLoading(true);
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const department = userData.dept;
        const user_id = userData._id;

        const response = await fetch(
          `http://127.0.0.1:5000/${department}/${user_id}/C`
        );

        if (response.ok) {
          const data = await response.json();
          if (data) {
            // Transform API data to match form structure
            setFormData({
              pdfCompleted: data[1]?.qualification?.pdfCompleted || false,
              pdfOngoing: data[1]?.qualification?.pdfOngoing || false,
              phdAwarded: data[1]?.qualification?.phdAwarded || false,
              twoWeekProgram: data[2]?.trainingAttended?.twoWeekProgram || 0,
              oneWeekProgram: data[2]?.trainingAttended?.oneWeekProgram || 0,
              twoToFiveDayProgram: data[2]?.trainingAttended?.twoToFiveDayProgram || 0,
              oneDayProgram: data[2]?.trainingAttended?.oneDayProgram || 0,
              organizedTwoWeekProgram: data[3]?.trainingOrganized?.twoWeekProgram || 0,
              organizedOneWeekProgram: data[3]?.trainingOrganized?.oneWeekProgram || 0,
              organizedTwoToFiveDayProgram: data[3]?.trainingOrganized?.twoToFiveDayProgram || 0,
              organizedOneDayProgram: data[3]?.trainingOrganized?.oneDayProgram || 0,
              phdDegreeAwarded: data[4]?.phdGuided?.degreesAwarded || 0,
              phdThesisSubmitted: data[4]?.phdGuided?.thesisSubmitted || 0,
              phdScholarsGuiding: data[4]?.phdGuided?.scholarsGuiding || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load existing data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Update the calculateQualificationScore function
  // Update the calculateQualificationScore function
  const calculateQualificationScore = () => {
    if (formData.pdfCompleted || formData.phdAwarded) {
      return 20;
    } else if (formData.pdfOngoing) {
      return 15;
    }
    return 0;
  };

  const calculateTrainingAttendedScore = () => {
    const twoWeekScore = Number(formData.twoWeekProgram) * 20;
    const oneWeekScore = Number(formData.oneWeekProgram) * 10;
    const shortTermScore = Number(formData.twoToFiveDayProgram) * 5;
    const oneDayScore = Number(formData.oneDayProgram) * 2;
    return Math.min(40, twoWeekScore + oneWeekScore + shortTermScore + oneDayScore);
  };

  const calculateTrainingOrganizedScore = () => {
    const twoWeekScore = Number(formData.organizedTwoWeekProgram) * 40;
    const oneWeekScore = Number(formData.organizedOneWeekProgram) * 20;
    const shortTermScore = Number(formData.organizedTwoToFiveDayProgram) * 10;
    const oneDayScore = Number(formData.organizedOneDayProgram) * 2;
    return Math.min(80, twoWeekScore + oneWeekScore + shortTermScore + oneDayScore);
  };

  const calculatePhDGuidedScore = () => {
    if (userData.role === "Professor" || userData.role === "Associate Professor") {
      const awardedScore = Number(formData.phdDegreeAwarded) * 50;
      const submittedScore = Number(formData.phdThesisSubmitted) * 25;
      const guidingScore = Number(formData.phdScholarsGuiding) * 10;
      return awardedScore + submittedScore + guidingScore;
    }
    return 0;
  };

  const calculateTotalScore = () => {
    const qualificationScore = calculateQualificationScore();
    const trainingAttendedScore = calculateTrainingAttendedScore();
    const trainingOrganizedScore = calculateTrainingOrganizedScore();
    const phdGuidedScore = calculatePhDGuidedScore();

    const totalScore = qualificationScore + trainingAttendedScore + trainingOrganizedScore + phdGuidedScore;

    // Apply cadre-specific limits
    switch (userData.role) {
      case "Professor":
        return Math.min(160, totalScore);
      case "Associate Professor":
        return Math.min(170, totalScore);
      case "Assistant Professor":
        return Math.min(180, totalScore);
      default:
        return 0;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const department = userData.dept;
    const user_id = userData._id;

    if (!department || !user_id) {
      alert("Department and User ID are required. Please login again.");
      return;
    }

    const payload = {
      1: {
        qualification: {
          pdfCompleted: formData.pdfCompleted,
          pdfOngoing: formData.pdfOngoing,
          phdAwarded: formData.phdAwarded,
          marks: calculateQualificationScore()
        }
      },
      2: {
        trainingAttended: {
          twoWeekProgram: Number(formData.twoWeekProgram),
          oneWeekProgram: Number(formData.oneWeekProgram),
          twoToFiveDayProgram: Number(formData.twoToFiveDayProgram),
          oneDayProgram: Number(formData.oneDayProgram),
          marks: calculateTrainingAttendedScore()
        }
      },
      3: {
        trainingOrganized: {
          twoWeekProgram: Number(formData.organizedTwoWeekProgram),
          oneWeekProgram: Number(formData.organizedOneWeekProgram),
          twoToFiveDayProgram: Number(formData.organizedTwoToFiveDayProgram),
          oneDayProgram: Number(formData.organizedOneDayProgram),
          marks: calculateTrainingOrganizedScore()
        }
      },
      4: {
        phdGuided: {
          degreesAwarded: Number(formData.phdDegreeAwarded),
          thesisSubmitted: Number(formData.phdThesisSubmitted),
          scholarsGuiding: Number(formData.phdScholarsGuiding),
          marks: calculatePhDGuidedScore()
        }
      },
      total_marks: calculateTotalScore()
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${department}/${user_id}/C`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        navigate('/submission-status', {
          state: {
            status: 'success',
            formName: 'Self Development Form',
            message: 'Your self development details have been successfully submitted!'
          }
        });
      } else {
        throw new Error(errorData.error || "Failed to submit data");
      }
    } catch (error) {
      navigate('/submission-status', {
        state: {
          status: 'error',
          formName: 'Self Development Form',
          error: error.message
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scores = {
    qualificationScore: calculateQualificationScore(),
    trainingAttendedScore: calculateTrainingAttendedScore(),
    trainingOrganizedScore: calculateTrainingOrganizedScore(),
    phdGuidedScore: calculatePhDGuidedScore(),
    totalScore: calculateTotalScore()
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#4F46E5" size={50} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* <Header /> */}

      {/* Qualification Section */}
      <SectionCard
        title="Qualification"
        icon="🎓"
        borderColor="border-blue-500"
      >
        <div className="space-y-4">
          <RadioField
            label="PDF Completed"
            name="qualificationStatus"
            checked={formData.pdfCompleted}
            onChange={() => {
              setFormData(prev => ({
                ...prev,
                pdfCompleted: true,
                pdfOngoing: false,
                phdAwarded: false
              }));
            }}
          />
          <RadioField
            label="PDF Ongoing"
            name="qualificationStatus"
            checked={formData.pdfOngoing}
            onChange={() => {
              setFormData(prev => ({
                ...prev,
                pdfCompleted: false,
                pdfOngoing: true,
                phdAwarded: false
              }));
            }}
          />
          <RadioField
            label="Ph.D. Degree Awarded / Thesis Submitted"
            name="qualificationStatus"
            checked={formData.phdAwarded}
            onChange={() => {
              setFormData(prev => ({
                ...prev,
                pdfCompleted: false,
                pdfOngoing: false,
                phdAwarded: true
              }));
            }}
          />
          <RadioField
            label="None"
            name="qualificationStatus"
            checked={!formData.pdfCompleted && !formData.pdfOngoing && !formData.phdAwarded}
            onChange={() => {
              setFormData(prev => ({
                ...prev,
                pdfCompleted: false,
                pdfOngoing: false,
                phdAwarded: false
              }));
            }}
          />
        </div>
        <ScoreCard
          label="Qualification Score"
          score={scores.qualificationScore}
          total="20"
        />
      </SectionCard>

      {/* Training Programs Attended Section */}
      <SectionCard
        title="Training Programs Attended"
        icon="📚"
        borderColor="border-green-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="2-week Programs Attended"
            name="twoWeekProgram"
            value={formData.twoWeekProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
          <InputField
            label="1-week Programs Attended"
            name="oneWeekProgram"
            value={formData.oneWeekProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
          <InputField
            label="2-5 Days Programs Attended"
            name="twoToFiveDayProgram"
            value={formData.twoToFiveDayProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
          <InputField
            label="1 Day Programs Attended"
            name="oneDayProgram"
            value={formData.oneDayProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
        </div>
        <ScoreCard
          label="Training Programs Attended Score"
          score={scores.trainingAttendedScore}
          total="40"
        />
      </SectionCard>

      {/* Training Programs Organized Section */}
      <SectionCard
        title="Training Programs Organized"
        icon="👨‍🏫"
        borderColor="border-purple-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="2-week Programs Organized"
            name="organizedTwoWeekProgram"
            value={formData.organizedTwoWeekProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
          <InputField
            label="1-week Programs Organized"
            name="organizedOneWeekProgram"
            value={formData.organizedOneWeekProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
          <InputField
            label="2-5 Days Programs Organized"
            name="organizedTwoToFiveDayProgram"
            value={formData.organizedTwoToFiveDayProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
          <InputField
            label="1 Day Programs Organized"
            name="organizedOneDayProgram"
            value={formData.organizedOneDayProgram}
            onChange={handleChange}
            placeholder="Enter number of programs"
          />
        </div>
        <ScoreCard
          label="Training Programs Organized Score"
          score={scores.trainingOrganizedScore}
          total="80"
        />
      </SectionCard>

      {/* PhD Guided Section */}
      {(userData.role === "Professor" || userData.role === "Associate Professor") && (
        <SectionCard
          title="PhD Guided (Extra)"
          icon="📝"
          borderColor="border-yellow-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="PhD Degrees Awarded"
              name="phdDegreeAwarded"
              value={formData.phdDegreeAwarded}
              onChange={handleChange}
              placeholder="Enter number of degrees awarded"
            />
            <InputField
              label="PhD Thesis Submitted"
              name="phdThesisSubmitted"
              value={formData.phdThesisSubmitted}
              onChange={handleChange}
              placeholder="Enter number of thesis submitted"
            />
            <InputField
              label="PhD Scholars Currently Guiding"
              name="phdScholarsGuiding"
              value={formData.phdScholarsGuiding}
              onChange={handleChange}
              placeholder="Enter number of scholars guiding"
            />
          </div>
          <ScoreCard
            label="PhD Guided Score"
            score={scores.phdGuidedScore}
            total="No limit"
          />
        </SectionCard>
      )}

      {/* Total Score Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Total Score</h2>
        </div>
        <div className="p-6">
          <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">Total Score:</span>
              <span className="text-3xl font-bold text-blue-700">{scores.totalScore}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Maximum score for {userData.role}: {
                userData.role === "Professor" ? "160" :
                  userData.role === "Associate Professor" ? "170" :
                    userData.role === "Assistant Professor" ? "180" : "N/A"
              }
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-3 text-white rounded-lg focus:ring-4 focus:ring-blue-300 transition-colors duration-300
            ${isSubmitting
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <ClipLoader color="#ffffff" size={20} />
              Submitting...
            </span>
          ) : (
            'Submit Self Development Details'
          )}
        </button>
      </div>
    </div>
  );
};

export default SelfDevelopment;