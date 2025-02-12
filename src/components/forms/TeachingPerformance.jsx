import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CourseProvider, useCourses } from "../../context/CourseContext";
import Header from "./Header";

const TestComponent = ({ onCoursesUpdate }) => {
  const { courses } = useCourses();

  useEffect(() => {
    if (courses && courses.length > 0) {
      const initialCourseResults = courses.map((course) => ({
        courseCode: course.code,
        courseSem: course.semester,
        // Result Analysis fields
        studentsAbove60: "",
        students50to59: "",
        students40to49: "",
        totalStudents: "",
        // Academic Engagement fields
        studentsPresent: "",
        totalEnrolledStudents: "",
        // Feedback field
        feedbackPercentage: "",
        // Course Outcome fields
        coAttainment: "",
        timelySubmissionCO: false,
      }));
      onCoursesUpdate(initialCourseResults);
    }
  }, [courses, onCoursesUpdate]);

  return null;
};

const CourseResultInput = ({ courseData, onChange, index }) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h4 className="text-lg font-medium  mb-3">
      <CourseNameCard name={courseData.courseCode} />
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Students with CGPA 6.31 and above"
        name={`studentsAbove60`}
        value={courseData.studentsAbove60}
        onChange={(e) => onChange(index, "studentsAbove60", e.target.value)}
        placeholder="Enter number of students"
      />
      <InputField
        label="Students with CGPA 5.26 to 6.3"
        name={`students50to59`}
        value={courseData.students50to59}
        onChange={(e) => onChange(index, "students50to59", e.target.value)}
        placeholder="Enter number of students"
      />
      <InputField
        label="Students with CGPA 4.21 to 5.25"
        name={`students40to49`}
        value={courseData.students40to49}
        onChange={(e) => onChange(index, "students40to49", e.target.value)}
        placeholder="Enter number of students"
      />
      <InputField
        label="Total Students"
        name={`totalStudents`}
        value={courseData.totalStudents}
        onChange={(e) => onChange(index, "totalStudents", e.target.value)}
        placeholder="Enter total number of students"
      />
    </div>
  </div>
);

const CourseOutcomeInput = ({ courseData, onChange, index }) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h4 className="text-lg font-medium text-gray-800 mb-3 ">
      <CourseNameCard name={courseData.courseCode} /> ({courseData.courseSem})
    </h4>
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <InputField
          label="CO Attainment (%)"
          name="coAttainment"
          value={courseData.coAttainment}
          onChange={(e) => onChange(index, "coAttainment", e.target.value)}
          placeholder="Enter CO attainment percentage"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">Timely submission</label>
        <label className="inline-flex items-center space-x-3">
          <input
            type="checkbox"
            checked={courseData.timelySubmissionCO}
            onChange={(e) => onChange(index, "timelySubmissionCO", e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="text-gray-700">Timely submission of CO attainment</span>
        </label>
      </div>
    </div>
  </div>
);


// Create a new component for Academic Engagement Input
const AcademicEngagementInput = ({ courseData, onChange, index }) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h4 className="text-lg font-medium text-gray-800 mb-3">
      <CourseNameCard name={courseData.courseCode} />
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Students present for lectures/practical labs/tutorials"
        name="studentsPresent"
        value={courseData.studentsPresent}
        onChange={(e) => onChange(index, "studentsPresent", e.target.value)}
        placeholder="Enter number of students present"
      />
      <InputField
        label="Total enrolled students for lectures/practical labs/tutorials"
        name="totalEnrolledStudents"
        value={courseData.totalEnrolledStudents}
        onChange={(e) =>
          onChange(index, "totalEnrolledStudents", e.target.value)
        }
        placeholder="Enter total enrolled students"
      />
    </div>
  </div>
);


const FeedbackInput = ({ courseData, onChange, index }) => (
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h4 className="text-lg font-medium text-gray-800 mb-3">
      <CourseNameCard name={courseData.courseCode} />
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="Feedback Percentage"
        name="feedbackPercentage"
        value={courseData.feedbackPercentage}
        onChange={(e) => onChange(index, "feedbackPercentage", e.target.value)}
        placeholder="Enter feedback percentage"
      />
    </div>
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

const CourseNameCard = ({ name }) => (
  <span className="mt-1 p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg items-center justify-between shadow-sm">
    <span className="font-medium text-gray-700">
      Course:<strong> {name}</strong>
    </span>
  </span>
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
      min="0" // Add min attribute to prevent negative values
      onKeyDown={(e) => {
        // Prevent minus sign
        if (e.key === '-') {
          e.preventDefault();
        }
      }}
      onWheel={(e) => e.target.blur()} 
      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"    />
  </div>
);

const TeachingPerformance = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log(userData);
  const navigate = useNavigate();
  const { courses, setCourses } = useCourses(); // Correctly destructure the context value
  const [courseResults, setCourseResults] = useState([]);
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

  const handleCourseResultChange = (index, field, value) => {
    setCourseResults((prevResults) => {
      const newResults = [...prevResults];
      newResults[index] = {
        ...newResults[index],
        [field]: value,
      };
      return newResults;
    });
  };

  const calculateResultScore = () => {
    let totalScore = 0;
    let totalCourses = courseResults.length;

    if (totalCourses === 0) return 0;

    courseResults.forEach((course) => {
      const studentsAbove60 = Number(course.studentsAbove60 || 0);
      const students50to59 = Number(course.students50to59 || 0);
      const students40to49 = Number(course.students40to49 || 0);
      const totalStudents = Number(course.totalStudents || 0);

      if (totalStudents > 0) {
        const courseScore =
          ((studentsAbove60 * 5 + students50to59 * 4 + students40to49 * 3) /
            totalStudents) *
          10;
        totalScore += courseScore;
      }
    });

    return totalScore / totalCourses;
  }; 

// Add helper functions to calculate CO scores
const calculateSemesterCOScore = (courses, semester) => {
  const semesterCourses = courses.filter(course => course.courseSem === semester);
  
  if (semesterCourses.length === 0) return 0;
  
  const semesterTotal = semesterCourses.reduce((total, course) => {
    const coAttainment = Number(course.coAttainment || 0);
    const timelyBonus = course.timelySubmissionCO ? 20 : 0;
    const courseScore = (coAttainment * 30) / 100 + timelyBonus;
    return total + courseScore;
  }, 0);
  
  return semesterTotal / semesterCourses.length;
};


  // Add this helper function to calculate individual academic engagement scores
const calculateAcademicEngagementScore = (course) => {
  const studentsPresent = Number(course.studentsPresent || 0);
  const totalEnrolled = Number(course.totalEnrolledStudents || 0);
  
  if (totalEnrolled > 0) {
    return 50 * (studentsPresent / totalEnrolled);
  }
  return 0;
};


const calculateFeedbackScore = (course) => {
  return Number(course.feedbackPercentage || 0);
};

  const calculateScores = () => {
    // Result Analysis Score
    const resultScore = calculateResultScore();

  // Calculate CO Score semester-wise
  const sem1Score = calculateSemesterCOScore(courseResults, "Sem I");
  const sem2Score = calculateSemesterCOScore(courseResults, "Sem II");
  
  // Calculate final CO score as average of both semesters
  const coScore = (sem1Score + sem2Score) / 2;

    // Other scores calculations as before
    const elearningScore =
      Number(Math.min(5, formData.elearningInstances) || 0) * 10;
    // Feedback Score
      const feedbackScores = courseResults.map(course => calculateFeedbackScore(course));
      const feedbackScore = feedbackScores.length > 0
        ? feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length
        : 0;
    // PTG Meetings Score
    const ptgMeetings = Number(formData.ptgMeetings || 0);
    const ptgScore = (ptgMeetings * 50) / 6;

    // Academic Engagement Score
    const academicEngagementScores = courseResults.map(course => calculateAcademicEngagementScore(course));
    const academicEngagementScore = academicEngagementScores.length > 0
      ? academicEngagementScores.reduce((a, b) => a + b, 0) / academicEngagementScores.length
      : 0;

    // Teaching Load Score
    const loadSem1 = Number(formData.weeklyLoadSem1 || 0);
    const loadSem2 = Number(formData.weeklyLoadSem2 || 0);
    let e = formData.adminResponsibility ? 2 : 0;
    const avgLoad = (loadSem1 + loadSem2) / 2;

    let minLoad;
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
      sem1COScore: sem1Score,
      sem2COScore: sem2Score,
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

  // Add this helper function to calculate individual course scores
const calculateCourseScore = (course) => {
  const studentsAbove60 = Number(course.studentsAbove60 || 0);
  const students50to59 = Number(course.students50to59 || 0);
  const students40to49 = Number(course.students40to49 || 0);
  const totalStudents = Number(course.totalStudents || 0);

  if (totalStudents > 0) {
    return ((studentsAbove60 * 5 + students50to59 * 4 + students40to49 * 3) / totalStudents) * 10;
  }
  return 0;
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

    const resultAnalysisCourses = {};
    courseResults.forEach((course) => {
      resultAnalysisCourses[course.courseCode] = {
        studentsAbove60: Number(course.studentsAbove60) || 0,
        students50to59: Number(course.students50to59) || 0,
        students40to49: Number(course.students40to49) || 0,
        totalStudents: Number(course.totalStudents) || 0,
        // Calculate individual course marks
        marks: calculateCourseScore(course)
      };
    });

    const payload = {
      1: {
        courses: resultAnalysisCourses,
        total_marks: scores.resultScore,
      },
      2: {
        courses: Object.fromEntries(
          courseResults.map((course) => [
            course.courseCode,
            {
              coAttainment: Number(course.coAttainment) || 0,
              timelySubmissionCO: course.timelySubmissionCO,
              semester: course.courseSem,
              marks: (Number(course.coAttainment || 0) * 30) / 100 + (course.timelySubmissionCO ? 20 : 0)
            },
          ])
        ),
        semesterScores: {
          "Sem I": scores.sem1COScore,
          "Sem II": scores.sem2COScore
        },
        total_marks: scores.coScore,
      },
      3: {
        elearningInstances: Number(formData.elearningInstances),
        total_marks: scores.elearningScore,
      },
      4: {
        courses: Object.fromEntries(
          courseResults.map((course) => [
            course.courseCode,
            {
              studentsPresent: Number(course.studentsPresent) || 0,
              totalEnrolledStudents: Number(course.totalEnrolledStudents) || 0,
              marks: calculateAcademicEngagementScore(course),
            }
          ])
        ),
        total_marks: scores.academicEngagementScore,
      },
      5: {
        weeklyLoadSem1: Number(formData.weeklyLoadSem1),
        weeklyLoadSem2: Number(formData.weeklyLoadSem2),
        adminResponsibility: formData.adminResponsibility ? 1 : 0,
        cadre: userData.role,
        total_marks: scores.teachingLoadScore,
      },
      6: {
        projectsGuided: Number(formData.projectsGuided),
        total_marks: scores.projectScore,
      },
      7: {
        courses: Object.fromEntries(
          courseResults.map((course) => [
            course.courseCode,
            {
              feedbackPercentage: Number(course.feedbackPercentage) || 0,
              marks: calculateFeedbackScore(course),
            },
          ])
        ),
        total_marks: scores.feedbackScore,
      },
      8: {
        ptgMeetings: Number(formData.ptgMeetings),
        total_marks: scores.ptgScore,
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
        <Header/>

        <TestComponent onCoursesUpdate={setCourseResults} />

      {/* Result Analysis Section */}
      <SectionCard
        title="Result Analysis"
        icon="📊"
        borderColor="border-blue-500"
      >
        {courseResults.map((courseData, index) => (
          <CourseResultInput
            key={courseData.courseCode}
            courseData={courseData}
            onChange={handleCourseResultChange}
            index={index}
          />
        ))}
        <ScoreCard
          label="Result Analysis Score (Average across all courses)"
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
    {courseResults.map((courseData, index) => (
      <CourseOutcomeInput
        key={courseData.courseCode}
        courseData={courseData}
        onChange={handleCourseResultChange}
        index={index}
      />
    ))}
    <div className="mt-4 space-y-4">
      <ScoreCard
        label="Semester I CO Score"
        score={scores.sem1COScore.toFixed(2)}
        total="50"
      />
      <ScoreCard
        label="Semester II CO Score"
        score={scores.sem2COScore.toFixed(2)}
        total="50"
      />
      <ScoreCard
        label="Final CO Analysis Score (Average of both semesters)"
        score={scores.coScore.toFixed(2)}
        total="50"
      />
    </div>
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
<SectionCard
  title="Academic Engagement"
  icon="📖"
  borderColor="border-indigo-500"
>
  {courseResults.map((courseData, index) => (
    <AcademicEngagementInput
      key={courseData.courseCode}
      courseData={courseData}
      onChange={handleCourseResultChange}
      index={index}
    />
  ))}
  <ScoreCard
    label="Academic Engagement Score (Average across all courses)"
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
            <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Are You Ph.D Supervisor Having Scholars Enrolled at PCCOE Research Center
          </label>
          <input
            type="checkbox" 
            name="adminResponsibility"
            checked={formData.adminResponsibility}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 rounded"
          />
            </div>
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
    {courseResults.map((courseData, index) => (
      <FeedbackInput
        key={courseData.courseCode}
        courseData={courseData}
        onChange={handleCourseResultChange}
        index={index}
      />
    ))}
    <ScoreCard
      label="Average Feedback Score (across all courses)"
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


const TeachingPerformanceWithProvider = () => (
  <CourseProvider>
    <TeachingPerformance />
  </CourseProvider>
);

export default TeachingPerformanceWithProvider;