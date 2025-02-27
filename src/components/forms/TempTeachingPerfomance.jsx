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
        studentsAbove60: course.resultData?.studentsAbove60 || "",
        students50to59: course.resultData?.students50to59 || "",
        students40to49: course.resultData?.students40to49 || "",
        totalStudents: course.resultData?.totalStudents || "",
        // Academic Engagement fields
        studentsPresent: course.academicData?.studentsPresent || "",
        totalEnrolledStudents: course.academicData?.totalEnrolledStudents || "",
        // Feedback field
        feedbackPercentage: course.feedbackData?.feedbackPercentage || "",
        // Course Outcome fields
        coAttainment: course.coData?.coAttainment || "",
        timelySubmissionCO: course.coData?.timelySubmissionCO || false,
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timely submission
        </label>
        <label className="inline-flex items-center space-x-3">
          <input
            type="checkbox"
            checked={courseData.timelySubmissionCO}
            onChange={(e) =>
              onChange(index, "timelySubmissionCO", e.target.checked)
            }
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="text-gray-700">
            Timely submission of CO attainment
          </span>
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

// Update the SectionCard component to handle marks calculated state
const SectionCard = ({ title, icon, borderColor, children, maxMarks, systemScore, marksCalculated }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} hover:shadow-lg transition-all duration-300`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      {maxMarks && (
        <span className="text-sm font-medium text-gray-600">
          Max Marks: {maxMarks}
        </span>
      )}
    </div>
    
    {marksCalculated ? (
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">System Calculated Score</div>
          <div className="text-2xl font-bold text-blue-600">
            {systemScore.toFixed(2)} / {maxMarks}
          </div>
        </div>
        {children}
      </div>
    ) : (
      children
    )}
  </div>
);

const InputField = ({
  label,
  name,
  type = "number",
  value,
  onChange,
  placeholder,
  disabled,
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
      disabled={disabled}
      min="0" // Add min attribute to prevent negative values
      onKeyDown={(e) => {
        // Prevent minus sign
        if (e.key === "-") {
          e.preventDefault();
        }
      }}
      onWheel={(e) => e.target.blur()}
      className={`block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
        disabled ? "bg-gray-100" : ""
      }`}
    />
  </div>
);

const TeachingPerformance = () => {
  // Add new state for marks calculation checkbox
  const [marksCalculated, setMarksCalculated] = useState(false);
  
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

  // Add a new state for final marks
  const [finalMarks, setFinalMarks] = useState({
    resultAnalysis: 0,
    courseOutcome: 0,
    eLearning: 0,
    academicEngagement: 0,
    teachingLoad: 0,
    projectsGuided: 0,
    feedback: 0,
    ptgMeetings: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.dept || !userData?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/${userData.dept}/${userData._id}/A`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("data is ", data);
        // Update courseResults with fetched data
        if (data["1"]?.courses) {
          const updatedCourseResults = Object.entries(data["1"].courses).map(
            ([courseCode, courseData]) => ({
              courseCode,
              studentsAbove60: courseData.studentsAbove60.toString(),
              students50to59: courseData.students50to59.toString(),
              students40to49: courseData.students40to49.toString(),
              totalStudents: courseData.totalStudents.toString(),
              // Get CO data from section 2
              coAttainment:
                data["2"]?.courses[courseCode]?.coAttainment?.toString() || "",
              timelySubmissionCO:
                data["2"]?.courses[courseCode]?.timelySubmissionCO || false,
              courseSem: data["2"]?.courses[courseCode]?.semester || "",
              // Get Academic Engagement data from section 4
              studentsPresent:
                data["4"]?.courses[courseCode]?.studentsPresent?.toString() ||
                "",
              totalEnrolledStudents:
                data["4"]?.courses[
                  courseCode
                ]?.totalEnrolledStudents?.toString() || "",
              // Get Feedback data from section 7
              feedbackPercentage:
                data["7"]?.courses[
                  courseCode
                ]?.feedbackPercentage?.toString() || "",
            })
          );
          setCourseResults(updatedCourseResults);
        }

        // Update formData with fetched data
        setFormData((prev) => ({
          ...prev,
          elearningInstances: data["3"]?.elearningInstances?.toString() || "",
          weeklyLoadSem1: data["5"]?.weeklyLoadSem1?.toString() || "",
          weeklyLoadSem2: data["5"]?.weeklyLoadSem2?.toString() || "",
          adminResponsibility: data["5"]?.adminResponsibility === 1,
          projectsGuided: data["6"]?.projectsGuided?.toString() || "",
          ptgMeetings: data["8"]?.ptgMeetings?.toString() || "",
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
    const semesterCourses = courses.filter(
      (course) => course.courseSem === semester
    );

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
    const feedbackScores = courseResults.map((course) =>
      calculateFeedbackScore(course)
    );
    const feedbackScore =
      feedbackScores.length > 0
        ? feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length
        : 0;
    // PTG Meetings Score
    const ptgMeetings = Number(formData.ptgMeetings || 0);
    const ptgScore = (ptgMeetings * 50) / 6;

    // Academic Engagement Score
    const academicEngagementScores = courseResults.map((course) =>
      calculateAcademicEngagementScore(course)
    );
    const academicEngagementScore =
      academicEngagementScores.length > 0
        ? academicEngagementScores.reduce((a, b) => a + b, 0) /
          academicEngagementScores.length
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
      return (
        ((studentsAbove60 * 5 + students50to59 * 4 + students40to49 * 3) /
          totalStudents) *
        10
      );
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
        marks: calculateCourseScore(course),
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
              marks:
                (Number(course.coAttainment || 0) * 30) / 100 +
                (course.timelySubmissionCO ? 20 : 0),
            },
          ])
        ),
        semesterScores: {
          "Sem I": scores.sem1COScore,
          "Sem II": scores.sem2COScore,
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
            },
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
      total_marks: scores.finalScore,
      finalMarks: {
        resultAnalysis: finalMarks.resultAnalysis,
        courseOutcome: finalMarks.courseOutcome,
        eLearning: finalMarks.eLearning,
        academicEngagement: finalMarks.academicEngagement,
        teachingLoad: finalMarks.teachingLoad,
        projectsGuided: finalMarks.projectsGuided,
        feedback: finalMarks.feedback,
        ptgMeetings: finalMarks.ptgMeetings,
        total: Object.values(finalMarks).reduce((a, b) => a + b, 0)
      }
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

      if (response.ok) {
        navigate("/submission-status", {
          state: {
            status: "success",
            formName: "Teaching Performance Form",
            message:
              "Your Teaching Performance details have been successfully submitted!",
          },
        });
      } else {
        throw new Error(errorData.error || "Failed to submit data");
      }
    } catch (error) {
      navigate("/submission-status", {
        state: {
          status: "error",
          formName: "Teaching Performance Form",
          error: error.message,
        },
      });
    }
  };

  const scores = calculateScores();

  // Add this new component for the checkbox
  const MarksCalculationCheckbox = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={marksCalculated}
          onChange={(e) => setMarksCalculated(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600 rounded"
        />
        <span className="text-gray-700 font-medium">
          Have you calculated your marks?
        </span>
      </label>
    </div>
  );

  // Add a new component for final marks input
  const FinalMarkInput = React.memo(({ section, value, onChange, maxMarks }) => {
    // Use a ref to maintain focus
    const inputRef = React.useRef(null);
  
    // Handle the change without losing focus
    const handleChange = (e) => {
      const newValue = Math.min(Math.max(0, Number(e.target.value)), maxMarks);
      onChange(section, newValue);
    };
  
    return (
      <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
        <div className="flex flex-col space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Enter final marks for this section
          </label>
          <div className="flex items-center gap-4">
            <input
              ref={inputRef}
              type="number"
              value={value}
              onChange={handleChange}
              className="w-24 px-3 py-2 text-lg font-medium text-blue-700 bg-white border border-gray-300 
                       rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max={maxMarks}
              step="0.01"
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === '+' || e.key === 'e') {
                  e.preventDefault();
                }
              }}
            />
            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(value / maxMarks) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-16">
              {((value / maxMarks) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    );
  });

// Update the final marks total display
const FinalMarksTotal = ({ systemScore, finalMarks }) => (
  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200">
    <h3 className="text-lg font-semibold text-blue-800 mb-4">
      Total Marks Summary
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-600 mb-1">System Calculated Total</p>
        <p className="text-2xl font-bold text-blue-600">
          {systemScore.toFixed(2)}
        </p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-600 mb-1">Final Marks Total</p>
        <p className="text-2xl font-bold text-blue-600">
          {Object.values(finalMarks).reduce((a, b) => a + b, 0).toFixed(2)}
        </p>
      </div>
    </div>
  </div>
);

  // Add handler for final marks change
  const handleFinalMarkChange = (section, value) => {
    setFinalMarks(prev => ({
      ...prev,
      [section]: Number(value)
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <Header />
      <MarksCalculationCheckbox />

      <TestComponent onCoursesUpdate={setCourseResults} />

      {/* Result Analysis Section */}
      <SectionCard title="Result Analysis" icon="📊" borderColor="border-blue-500" maxMarks={50} systemScore={scores.resultScore} marksCalculated={marksCalculated}>
        {marksCalculated ? (
          <FinalMarkInput 
            section="resultAnalysis"
            value={finalMarks.resultAnalysis}
            onChange={handleFinalMarkChange}
            maxMarks={50} // Adjust max marks based on section
          />
        ) : (
          courseResults.map((courseData, index) => (
            <CourseResultInput
              key={courseData.courseCode}
              courseData={courseData}
              onChange={handleCourseResultChange}
              index={index}
            />
          ))
        )}
      </SectionCard>

      {/* Course Outcome Section */}
      <SectionCard
        title="Course Outcome Analysis"
        icon="📈"
        borderColor="border-green-500"
        maxMarks={50}
        systemScore={scores.coScore}
        marksCalculated={marksCalculated}
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
        {marksCalculated && (
          <FinalMarkInput
            section="courseOutcome"
            value={finalMarks.courseOutcome}
            onChange={handleFinalMarkChange}
          />
        )}
      </SectionCard>

      {/* E-learning Section */}
      <SectionCard
        title="E-learning Content Development"
        icon="💻"
        borderColor="border-purple-500"
        maxMarks={50}
        systemScore={scores.elearningScore}
        marksCalculated={marksCalculated}
      >
        <InputField
          label="Number of e-learning contents developed"
          name="elearningInstances"
          value={formData.elearningInstances}
          onChange={handleChange}
          placeholder="Enter number of e-learning contents"
          disabled={marksCalculated}
        />
        <ScoreCard
          label="E-learning Score"
          score={scores.elearningScore.toFixed(2)}
          total="50"
        />
        {marksCalculated && (
          <FinalMarkInput
            section="eLearning"
            value={finalMarks.eLearning}
            onChange={handleFinalMarkChange}
          />
        )}
      </SectionCard>
      <SectionCard
        title="Academic Engagement"
        icon="📖"
        borderColor="border-indigo-500"
        maxMarks={50}
        systemScore={scores.academicEngagementScore}
        marksCalculated={marksCalculated}
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
        {marksCalculated && (
          <FinalMarkInput
            section="academicEngagement"
            value={finalMarks.academicEngagement}
            onChange={handleFinalMarkChange}
          />
        )}
      </SectionCard>

      {/* Teaching Load Section */}
      <SectionCard
        title="Teaching Load"
        icon="📚"
        borderColor="border-yellow-500"
        maxMarks={50}
        systemScore={scores.teachingLoadScore}
        marksCalculated={marksCalculated}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Weekly Load Semester I"
            name="weeklyLoadSem1"
            value={formData.weeklyLoadSem1}
            onChange={handleChange}
            placeholder="Enter weekly load"
            disabled={marksCalculated}
          />
          <InputField
            label="Weekly Load Semester II"
            name="weeklyLoadSem2"
            value={formData.weeklyLoadSem2}
            onChange={handleChange}
            placeholder="Enter weekly load"
            disabled={marksCalculated}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Are You Ph.D Supervisor Having Scholars Enrolled at PCCOE Research
              Center
            </label>
            <input
              type="checkbox"
              name="adminResponsibility"
              checked={formData.adminResponsibility}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 rounded"
              disabled={marksCalculated}
            />
          </div>
        </div>
        <ScoreCard
          label="Teaching Load Score"
          score={scores.teachingLoadScore.toFixed(2)}
          total="50"
        />
        {marksCalculated && (
          <FinalMarkInput
            section="teachingLoad"
            value={finalMarks.teachingLoad}
            onChange={handleFinalMarkChange}
          />
        )}
      </SectionCard>

      {/* Projects Guided Section */}
      <SectionCard
        title="UG Project / PG Dissertations Guided"
        icon="🎓"
        borderColor="border-green-500"
        maxMarks={40}
        systemScore={scores.projectScore}
        marksCalculated={marksCalculated}
      >
        <InputField
          label="Number of projects guided"
          name="projectsGuided"
          value={formData.projectsGuided}
          onChange={handleChange}
          placeholder="Enter number of projects guided"
          disabled={marksCalculated}
        />
        <ScoreCard
          label="Projects Score"
          score={scores.projectScore.toFixed(2)}
          total="40"
        />
        {marksCalculated && (
          <FinalMarkInput
            section="projectsGuided"
            value={finalMarks.projectsGuided}
            onChange={handleFinalMarkChange}
          />
        )}
      </SectionCard>

      {/* Feedback Section */}
      <SectionCard
        title="Feedback of Faculty by Student"
        icon="📊"
        borderColor="border-blue-500"
        maxMarks={100}
        systemScore={scores.feedbackScore}
        marksCalculated={marksCalculated}
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
        {marksCalculated && (
          <FinalMarkInput
            section="feedback"
            value={finalMarks.feedback}
            onChange={handleFinalMarkChange}
          />
        )}
      </SectionCard>

      {/* PTG Meetings Section */}
      <SectionCard
        title="Conduction of Guardian [PTG] Meetings"
        icon="📅"
        borderColor="border-purple-500"
        maxMarks={50}
        systemScore={scores.ptgScore}
        marksCalculated={marksCalculated}
      >
        <InputField
          label="Number of PTG meetings conducted"
          name="ptgMeetings"
          value={formData.ptgMeetings}
          onChange={handleChange}
          placeholder="Enter number of PTG meetings"
          disabled={marksCalculated}
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
        {marksCalculated && (
          <FinalMarkInput
            section="ptgMeetings"
            value={finalMarks.ptgMeetings}
            onChange={handleFinalMarkChange}
          />
        )}
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
              {(() => {
                const maxMarks = {
                  Professor: 300,
                  "Associate Professor": 360,
                  "Assistant Professor": 440,
                };

                return (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {maxMarks[userData.role]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {scores.finalScore.toFixed(2)}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </SectionCard>
      {/* Total Final Marks */}
      {marksCalculated && (
        <FinalMarksTotal 
          systemScore={scores.finalScore} 
          finalMarks={finalMarks}
        />
      )}
      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSubmit}
          disabled={!marksCalculated}
          className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${
            marksCalculated
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
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
