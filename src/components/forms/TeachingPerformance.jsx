import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CourseProvider, useCourses } from "../../context/CourseContext";
import Header from "./Header";

// Get user data from localStorage

// const Header = () => {
//   const [currentDateTime, setCurrentDateTime] = useState(new Date());
//   const userData = JSON.parse(localStorage.getItem("userData"));

//   useEffect(() => {
//     // Set up timer for datetime
//     const timer = setInterval(() => {
//       setCurrentDateTime(new Date());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatDateTime = (date) => {
//     return date.toLocaleDateString() + " " + date.toLocaleTimeString();
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="flex items-center space-x-2">
//           <span className="text-gray-600">Current Time:</span>
//           <span className="font-mono text-blue-600 font-medium">
//             {formatDateTime(currentDateTime)}
//           </span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className="text-gray-600">User:</span>
//           <span className="font-mono text-green-600 font-medium">
//             {userData?.name || "User"} {/* Display name from userData */}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

const TestComponent = () => {
  const { courses } = useCourses();

  useEffect(() => {
    console.log("Accessing Courses Outside Header:", courses[0].code);
  }, [courses]);

  return null; // No UI, just logging to console
};

const ScoreCard = ({ label, score, total }) => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-between shadow-sm">
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="text-lg font-bold text-blue-600">
      {score} / {total}
    </span>
  </div>
);

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

const InputField = ({
  label,
  name,
  type = "number",
  value,
  onChange,
  placeholder,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-700">{label}</label>
    )}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onWheel={(e) => e.target.blur()} // Prevent scrolling effect
      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);

const TeachingPerformance = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log(userData);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    studentsAbove60: "",
    students50to59: "",
    students40to49: "",
    totalStudents: "",
    coAttainmentSem1: "",
    coAttainmentSem2: "",
    timelySubmissionCO: false,
    elearningInstances: "",
    studentsPresent: "",
    totalEnrolledStudentsForLectures: "",
    weeklyLoadSem1: "",
    weeklyLoadSem2: "",
    e: "",
    projectsGuided: "",
    feedbackPercentage: "",
    cadre: userData.role,
    ptgMeetings: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calculateScores = () => {
    // Result Analysis Score
    const studentsAbove60 = Number(formData.studentsAbove60 || 0);
    const students50to59 = Number(formData.students50to59 || 0);
    const students40to49 = Number(formData.students40to49 || 0);
    const totalStudents = Number(formData.totalStudents || 0);
    const resultScore =
      totalStudents > 0
        ? ((studentsAbove60 * 5 + students50to59 * 4 + students40to49 * 3) /
            totalStudents) *
          10
        : 0;

    // CO Attainment Score
    const coAttainmentSem1 = Number(formData.coAttainmentSem1 || 0);
    const coAttainmentSem2 = Number(formData.coAttainmentSem2 || 0);
    const averageCO = (coAttainmentSem1 + coAttainmentSem2) / 2;
    const coScore = formData.timelySubmissionCO
      ? (averageCO * 30) / 100 + 20
      : (averageCO * 30) / 100;

    // Other scores calculations as before
    const elearningScore =
      Number(Math.min(5, formData.elearningInstances) || 0) * 10;
    const feedbackScore = Number(formData.feedbackPercentage || 0);
    const ptgMeetings = Number(formData.ptgMeetings || 0);
    const ptgScore = (ptgMeetings * 50) / 6;

    // Academic Engagement Score
    const studentsPresent = Number(formData.studentsPresent || 0);
    const totalEnrolled = Number(
      formData.totalEnrolledStudentsForLectures || 0
    );
    const academicEngagementScore =
      totalEnrolled > 0 ? 50 * (studentsPresent / totalEnrolled) : 0;

    // Teaching Load Score
    const loadSem1 = Number(formData.weeklyLoadSem1 || 0);
    const loadSem2 = Number(formData.weeklyLoadSem2 || 0);
    let e = formData.adminResponsibility ? 2 : 0;
    const avgLoad = (loadSem1 + loadSem2) / 2;

    let minLoad;
    console.log(userData.role);
    switch (userData.role) {
      case "Professor":
        minLoad = 12;
        break;
      case "Associate Professor":
        minLoad = 14;
        break;
      case "Assistant Professor":
        minLoad = 16;
        break;
      default:
        (minLoad = 1), (e = e + 2);
    }
    console.log(minLoad);
    console.log(avgLoad);
    console.log(e);

    const teachingLoadScore =
      minLoad > 0 ? Math.min(50, 50 * ((avgLoad + e) / minLoad)) : 0;

    // Projects Score
    const projectsGuided = Number(formData.projectsGuided || 0);
    const projectScore = Math.min(40, projectsGuided * 20);

    // Calculate total score based on cadre
    const rawTotal =
      resultScore +
      coScore +
      elearningScore +
      academicEngagementScore +
      teachingLoadScore +
      projectScore +
      feedbackScore +
      ptgScore;

    let finalScore;
    switch (userData.role) {
      case "Professor":
        finalScore = rawTotal * 0.68;
        break;
      case "Associate Professor":
        finalScore = rawTotal * 0.818;
        break;
      case "Assistant Professor":
        finalScore = rawTotal;
        break;
      default:
        finalScore = 0;
    }

    return {
      resultScore,
      coScore,
      elearningScore,
      academicEngagementScore,
      teachingLoadScore,
      projectScore,
      feedbackScore,
      ptgScore,
      rawTotal,
      finalScore,
    };
  };

  const handleSubmit = async () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const department = userData.dept;
    const user_id = userData._id;

    if (!department || !user_id) {
      alert("Department and User ID are required. Please login again.");
      return;
    }

    const scores = calculateScores();

    const payload = {
      1: {
        studentsAbove60: Number(formData.studentsAbove60),
        students50to59: Number(formData.students50to59),
        students40to49: Number(formData.students40to49),
        totalStudents: Number(formData.totalStudents),
        marks: scores.resultScore,
      },
      2: {
        coAttainmentSem1: Number(formData.coAttainmentSem1),
        coAttainmentSem2: Number(formData.coAttainmentSem2),
        timelySubmissionCO: formData.timelySubmissionCO,
        marks: scores.coScore,
      },
      3: {
        elearningInstances: Number(formData.elearningInstances),
        marks: scores.elearningScore,
      },
      4: {
        studentsPresent: Number(formData.studentsPresent),
        totalEnrolledStudents: Number(
          formData.totalEnrolledStudentsForLectures
        ),
        marks: scores.academicEngagementScore,
      },
      5: {
        weeklyLoadSem1: Number(formData.weeklyLoadSem1),
        weeklyLoadSem2: Number(formData.weeklyLoadSem2),
        adminResponsibility: formData.adminResponsibility ? 1 : 0,
        cadre: userData.role,
        marks: scores.teachingLoadScore,
      },
      6: {
        projectsGuided: Number(formData.projectsGuided),
        marks: scores.projectScore,
      },
      7: {
        feedbackPercentage: Number(formData.feedbackPercentage),
        marks: scores.feedbackScore,
      },
      8: {
        ptgMeetings: Number(formData.ptgMeetings),
        marks: scores.ptgScore,
      },
      9: {
        total: scores.finalScore,
      },
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/${department}/${user_id}/A`,
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

      const result = await response.json();
      alert(result.message);
      navigate("/dashboard");
    } catch (error) {
      alert("Error submitting data: " + error.message);
    }
  };

  const scores = calculateScores();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <CourseProvider>
        <Header />
        <TestComponent /> {/* Testing courses outside Header */}
      </CourseProvider>

      {/* Result Analysis Section */}
      <SectionCard
        title="Result Analysis"
        icon="📊"
        borderColor="border-blue-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Students with CGPA 6.31 and above"
            name="studentsAbove60"
            value={formData.studentsAbove60}
            onChange={handleChange}
            placeholder="Enter number of students"
          />
          <InputField
            label="Students with CGPA 5.26 to 6.3"
            name="students50to59"
            value={formData.students50to59}
            onChange={handleChange}
            placeholder="Enter number of students"
          />
          <InputField
            label="Students with CGPA 4.21 to 5.25"
            name="students40to49"
            value={formData.students40to49}
            onChange={handleChange}
            placeholder="Enter number of students"
          />
          <InputField
            label="Total Students"
            name="totalStudents"
            value={formData.totalStudents}
            onChange={handleChange}
            placeholder="Enter total number of students"
          />
        </div>
        <ScoreCard
          label="Result Analysis Score"
          score={scores.resultScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* Course Outcome Section */}
      <SectionCard
        title="Course Outcome Analysis"
        icon="📈"
        borderColor="border-green-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="CO Attainment Semester I (%)"
            name="coAttainmentSem1"
            value={formData.coAttainmentSem1}
            onChange={handleChange}
            placeholder="Enter CO attainment percentage"
          />
          <InputField
            label="CO Attainment Semester II (%)"
            name="coAttainmentSem2"
            value={formData.coAttainmentSem2}
            onChange={handleChange}
            placeholder="Enter CO attainment percentage"
          />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center space-x-3">
            <input
              type="checkbox"
              name="timelySubmissionCO"
              checked={formData.timelySubmissionCO}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "timelySubmissionCO",
                    type: "checkbox",
                    checked: e.target.checked,
                  },
                })
              }
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">
              Timely submission of CO attainment
            </span>
          </label>
        </div>
        <ScoreCard
          label="CO Analysis Score"
          score={scores.coScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* E-learning Section */}
      <SectionCard
        title="E-learning Content Development"
        icon="💻"
        borderColor="border-purple-500"
      >
        <InputField
          label="Number of e-learning contents developed"
          name="elearningInstances"
          value={formData.elearningInstances}
          onChange={handleChange}
          placeholder="Enter number of e-learning contents"
        />
        <ScoreCard
          label="E-learning Score"
          score={scores.elearningScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* Academic Engagement Section */}
      <SectionCard
        title="Academic Engagement"
        icon="📖"
        borderColor="border-indigo-500"
      >
        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Students present for lectures/practical labs/tutorials"
            name="studentsPresent"
            value={formData.studentsPresent}
            onChange={handleChange}
            placeholder="Enter number of students present"
          />
          <InputField
            label="Total enrolled students"
            name="totalEnrolledStudentsForLectures"
            value={formData.totalEnrolledStudentsForLectures}
            onChange={handleChange}
            placeholder="Enter total enrolled students"
          />
        </div>
        <ScoreCard
          label="Academic Engagement Score"
          score={scores.academicEngagementScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* Teaching Load Section */}
      <SectionCard
        title="Teaching Load"
        icon="📚"
        borderColor="border-yellow-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Weekly Load Semester I"
            name="weeklyLoadSem1"
            value={formData.weeklyLoadSem1}
            onChange={handleChange}
            placeholder="Enter weekly load"
          />
          <InputField
            label="Weekly Load Semester II"
            name="weeklyLoadSem2"
            value={formData.weeklyLoadSem2}
            onChange={handleChange}
            placeholder="Enter weekly load"
          />
          <InputField
            label="Are You Ph.D Supervisor Having Scholers Enrolled at PCCOE Research Center"
            name="adminResponsibility"
            type="checkbox"
            checked={formData.adminResponsibility}
            onChange={handleChange}
          />

          {/* <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Cadre</label>
            <select
              name="cadre"
              value={formData.cadre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Cadre</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
            </select>
          </div> */}
        </div>
        <ScoreCard
          label="Teaching Load Score"
          score={scores.teachingLoadScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* Projects Guided Section */}
      <SectionCard
        title="UG Project / PG Dissertations Guided"
        icon="🎓"
        borderColor="border-green-500"
      >
        <InputField
          label="Number of projects guided"
          name="projectsGuided"
          value={formData.projectsGuided}
          onChange={handleChange}
          placeholder="Enter number of projects guided"
        />
        <ScoreCard
          label="Projects Score"
          score={scores.projectScore.toFixed(2)}
          total="40"
        />
      </SectionCard>

      {/* Feedback Section */}
      <SectionCard
        title="Feedback of Faculty by Student"
        icon="📊"
        borderColor="border-blue-500"
      >
        <InputField
          label="Average feedback percentage"
          name="feedbackPercentage"
          value={formData.feedbackPercentage}
          onChange={handleChange}
          placeholder="Enter feedback percentage"
        />
        <ScoreCard
          label="Feedback Score"
          score={scores.feedbackScore.toFixed(2)}
          total="100"
        />
      </SectionCard>

      {/* PTG Meetings Section */}
      <SectionCard
        title="Conduction of Guardian [PTG] Meetings"
        icon="📅"
        borderColor="border-purple-500"
      >
        <InputField
          label="Number of PTG meetings conducted"
          name="ptgMeetings"
          value={formData.ptgMeetings}
          onChange={handleChange}
          placeholder="Enter number of PTG meetings"
        />
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold">Note:</p>
          <p>
            Minimum 6 meetings required in a year. For Student Counseling
            efforts, marks will be taken as 50 in case of Deputy
            Director/Deans/HoDs/PG Coordinators/Ph. D. Coordinators.
          </p>
        </div>
        <ScoreCard
          label="PTG Meetings Score"
          score={scores.ptgScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* Total Score Section */}
      <SectionCard
        title="Total Academic Performance Score"
        icon="📑"
        borderColor="border-red-500"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Maximum Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Professor</td>
                <td className="px-6 py-4 whitespace-nowrap">300</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {userData.role === "Professor"
                    ? scores.finalScore.toFixed(2)
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  Associate Professor
                </td>
                <td className="px-6 py-4 whitespace-nowrap">360</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {userData.role === "Associate Professor"
                    ? scores.finalScore.toFixed(2)
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  Assistant Professor
                </td>
                <td className="px-6 py-4 whitespace-nowrap">440</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {userData.role === "Assistant Professor"
                    ? scores.finalScore.toFixed(2)
                    : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Submit Teaching Performance Data
        </button>
      </div>
    </div>
  );
};

export default TeachingPerformance;
