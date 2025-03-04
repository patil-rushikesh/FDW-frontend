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

const CourseResultInput = ({
  courseData,
  onChange,
  index,
  directScoreInput,
}) => (
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
        disabled={directScoreInput}
      />
      <InputField
        label="Students with CGPA 5.26 to 6.3"
        name={`students50to59`}
        value={courseData.students50to59}
        onChange={(e) => onChange(index, "students50to59", e.target.value)}
        placeholder="Enter number of students"
        disabled={directScoreInput}
      />
      <InputField
        label="Students with CGPA 4.21 to 5.25"
        name={`students40to49`}
        value={courseData.students40to49}
        onChange={(e) => onChange(index, "students40to49", e.target.value)}
        placeholder="Enter number of students"
        disabled={directScoreInput}
      />
      <InputField
        label="Total Students"
        name={`totalStudents`}
        value={courseData.totalStudents}
        onChange={(e) => onChange(index, "totalStudents", e.target.value)}
        placeholder="Enter total number of students"
        disabled={directScoreInput}
      />
    </div>
  </div>
);

const CourseOutcomeInput = ({
  courseData,
  onChange,
  index,
  directScoreInput,
}) => (
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
          disabled={directScoreInput}
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
            disabled={directScoreInput}
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
const AcademicEngagementInput = ({
  courseData,
  onChange,
  index,
  directScoreInput,
}) => (
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
        disabled={directScoreInput}
      />
      <InputField
        label="Total enrolled students for lectures/practical labs/tutorials"
        name="totalEnrolledStudents"
        value={courseData.totalEnrolledStudents}
        onChange={(e) =>
          onChange(index, "totalEnrolledStudents", e.target.value)
        }
        placeholder="Enter total enrolled students"
        disabled={directScoreInput}
      />
    </div>
  </div>
);

const FeedbackInput = ({ courseData, onChange, index, directScoreInput }) => (
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
        disabled={directScoreInput}
      />
    </div>
  </div>
);

const ScoreCard = ({ label, score, total, isManual, onManualScoreChange, manualScore }) => (
  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-between shadow-sm">
    <span className="font-medium text-gray-700">{label}:</span>
    {isManual ? (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={manualScore}
          onChange={(e) => onManualScoreChange(e.target.value)}
          className="w-20 px-2 py-1 border rounded"
          min="0"
          max={total}
        />
        <span className="text-lg font-bold text-blue-600">/ {total}</span>
      </div>
    ) : (
      <span className="text-lg font-bold text-blue-600">
        {score} / {total}
      </span>
    )}
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

// Modify the InputField component to accept and use the disabled prop
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
        if (e.key === "-") {
          e.preventDefault();
        }
      }}
      onWheel={(e) => e.target.blur()}
      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

    />
  </div>
);

// Add this component definition near your other component definitions
const ManualScoreToggle = ({ checked, onChange }) => (
  <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 text-blue-600 rounded"
      id="manualScoring"
    />
    <label htmlFor="manualScoring" className="text-sm font-medium text-gray-700">
      Enable Manual Score Entry
    </label>

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

  const [manualScoring, setManualScoring] = useState(false);
  const [manualScores, setManualScores] = useState({

    resultAnalysis: 0,
    courseOutcome: 0,
    elearning: 0,
    academicEngagement: 0,
    teachingLoad: 0,
    projects: 0,
    feedback: 0,
    ptgMeetings: 0,
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

        // Set manual scoring based on existing data
        if (data.isManualScoring) {
          setManualScoring(true);
          setManualScores({
            resultAnalysis: data["1"]?.total_marks || 0,
            courseOutcome: data["2"]?.total_marks || 0,
            elearning: data["3"]?.total_marks || 0,
            academicEngagement: data["4"]?.total_marks || 0,
            teachingLoad: data["5"]?.total_marks || 0,
            projects: data["6"]?.total_marks || 0,
            feedback: data["7"]?.total_marks || 0,
            ptgMeetings: data["8"]?.total_marks || 0
          });
        }

        // Rest of your existing fetch data code...
        if (data["1"]?.courses) {
          const updatedCourseResults = Object.entries(data["1"].courses).map(
            ([courseCode, courseData]) => ({
              courseCode,
              studentsAbove60: courseData.studentsAbove60.toString(),
              students50to59: courseData.students50to59.toString(),
              students40to49: courseData.students40to49.toString(),
              totalStudents: courseData.totalStudents.toString(),
              coAttainment:
                data["2"]?.courses[courseCode]?.coAttainment?.toString() || "",
              timelySubmissionCO:
                data["2"]?.courses[courseCode]?.timelySubmissionCO || false,
              courseSem: data["2"]?.courses[courseCode]?.semester || "",
              studentsPresent:
                data["4"]?.courses[courseCode]?.studentsPresent?.toString() ||
                "",
              totalEnrolledStudents:
                data["4"]?.courses[
                  courseCode
                ]?.totalEnrolledStudents?.toString() || "",
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
  
    // Create resultAnalysisCourses object from courseResults
    const resultAnalysisCourses = Object.fromEntries(
      courseResults.map((course) => [
        course.courseCode,
        {
          studentsAbove60: Number(course.studentsAbove60) || 0,
          students50to59: Number(course.students50to59) || 0,
          students40to49: Number(course.students40to49) || 0,
          totalStudents: Number(course.totalStudents) || 0,
          marks: calculateCourseScore(course),
        },
      ])
    );
  
    const scores = manualScoring ? {
      resultScore: Number(manualScores.resultAnalysis),
      coScore: Number(manualScores.courseOutcome),
      elearningScore: Number(manualScores.elearning),
      academicEngagementScore: Number(manualScores.academicEngagement),
      teachingLoadScore: Number(manualScores.teachingLoad),
      projectScore: Number(manualScores.projects),
      feedbackScore: Number(manualScores.feedback),
      ptgScore: Number(manualScores.ptgMeetings),
      finalScore: Object.values(manualScores).reduce((a, b) => Number(a) + Number(b), 0)
    } : calculateScores();
  
    const payload = {
      isManualScoring: manualScoring,
      1: {
        courses: resultAnalysisCourses,
        total_marks: manualScoring ? Number(manualScores.resultAnalysis) : scores.resultScore,
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
        total_marks: manualScoring ? Number(manualScores.courseOutcome) : scores.coScore,
      },
      3: {
        elearningInstances: Number(formData.elearningInstances),
        total_marks: manualScoring ? Number(manualScores.elearning) : scores.elearningScore,
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
        total_marks: manualScoring ? Number(manualScores.academicEngagement) : scores.academicEngagementScore,
      },
      5: {
        weeklyLoadSem1: Number(formData.weeklyLoadSem1),
        weeklyLoadSem2: Number(formData.weeklyLoadSem2),
        adminResponsibility: formData.adminResponsibility ? 1 : 0,
        cadre: userData.role,
        total_marks: manualScoring ? Number(manualScores.teachingLoad) : scores.teachingLoadScore,
      },
      6: {
        projectsGuided: Number(formData.projectsGuided),
        total_marks: manualScoring ? Number(manualScores.projects) : scores.projectScore,
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
        total_marks: manualScoring ? Number(manualScores.feedback) : scores.feedbackScore,
      },
      8: {
        ptgMeetings: Number(formData.ptgMeetings),
        total_marks: manualScoring ? Number(manualScores.ptgMeetings) : scores.ptgScore,
      },
        total_marks: manualScoring 
    ? Object.values(manualScores).reduce((a, b) => Number(a) + Number(b), 0)
    : scores.finalScore,
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <Header />
      <ManualScoreToggle 
  checked={manualScoring} 
  onChange={(e) => setManualScoring(e.target.checked)} 
/>

      <TestComponent onCoursesUpdate={setCourseResults} />

      {/* Result Analysis Section */}
<SectionCard title="Result Analysis" icon="📊" borderColor="border-blue-500">
  {!manualScoring && courseResults.map((courseData, index) => (
    <CourseResultInput
      key={courseData.courseCode}
      courseData={courseData}
      onChange={handleCourseResultChange}
      index={index}
    />
  ))}
  <ScoreCard
    label="Result Analysis Score"
    score={scores.resultScore.toFixed(2)}
    total="50"
    isManual={manualScoring}
    manualScore={manualScores.resultAnalysis}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, resultAnalysis: value}))
    }
  />
</SectionCard>

{/* Course Outcome Section */}
<SectionCard title="Course Outcome Analysis" icon="📈" borderColor="border-green-500">
  {!manualScoring && courseResults.map((courseData, index) => (
    <CourseOutcomeInput
      key={courseData.courseCode}
      courseData={courseData}
      onChange={handleCourseResultChange}
      index={index}
    />
  ))}
  <ScoreCard
    label="Course Outcome Score"
    score={scores.coScore.toFixed(2)}
    total="50"
    isManual={manualScoring}
    manualScore={manualScores.courseOutcome}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, courseOutcome: value}))
    }
  />
</SectionCard>

{/* E-learning Section */}
<SectionCard title="E-learning Content Development" icon="💻" borderColor="border-purple-500">
  {!manualScoring && (
    <InputField
      label="Number of e-learning contents developed"
      name="elearningInstances"
      value={formData.elearningInstances}
      onChange={handleChange}
      placeholder="Enter number of e-learning contents"
    />
  )}
  <ScoreCard
    label="E-learning Score"
    score={scores.elearningScore.toFixed(2)}
    total="50"
    isManual={manualScoring}
    manualScore={manualScores.elearning}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, elearning: value}))
    }
  />
</SectionCard>

{/* Academic Engagement Section */}
<SectionCard title="Academic Engagement" icon="📖" borderColor="border-indigo-500">
  {!manualScoring && courseResults.map((courseData, index) => (
    <AcademicEngagementInput
      key={courseData.courseCode}
      courseData={courseData}
      onChange={handleCourseResultChange}
      index={index}
    />
  ))}
  <ScoreCard
    label="Academic Engagement Score"
    score={scores.academicEngagementScore.toFixed(2)}
    total="50"
    isManual={manualScoring}
    manualScore={manualScores.academicEngagement}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, academicEngagement: value}))
    }
  />
</SectionCard>

{/* Teaching Load Section */}
<SectionCard title="Teaching Load" icon="📚" borderColor="border-yellow-500">
  {!manualScoring && (
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
        <input
          type="checkbox"
          name="adminResponsibility"
          checked={formData.adminResponsibility}
          onChange={handleChange}
          className="h-5 w-5 text-blue-600 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Are You Ph.D Supervisor Having Scholars Enrolled at PCCOE Research Center
        </label>
      </div>
    </div>
  )}
  <ScoreCard
    label="Teaching Load Score"
    score={scores.teachingLoadScore.toFixed(2)}
    total="50"
    isManual={manualScoring}
    manualScore={manualScores.teachingLoad}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, teachingLoad: value}))
    }
  />
</SectionCard>

{/* Projects Section */}
<SectionCard title="UG Project / PG Dissertations Guided" icon="🎓" borderColor="border-green-500">
  {!manualScoring && (
    <InputField
      label="Number of projects guided"
      name="projectsGuided"
      value={formData.projectsGuided}
      onChange={handleChange}
      placeholder="Enter number of projects guided"
    />
  )}
  <ScoreCard
    label="Projects Score"
    score={scores.projectScore.toFixed(2)}
    total="40"
    isManual={manualScoring}
    manualScore={manualScores.projects}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, projects: value}))
    }
  />
</SectionCard>

{/* Feedback Section */}
<SectionCard title="Feedback of Faculty by Student" icon="📊" borderColor="border-blue-500">
  {!manualScoring && courseResults.map((courseData, index) => (
    <FeedbackInput
      key={courseData.courseCode}
      courseData={courseData}
      onChange={handleCourseResultChange}
      index={index}
    />
  ))}
  <ScoreCard
    label="Feedback Score"
    score={scores.feedbackScore.toFixed(2)}
    total="100"
    isManual={manualScoring}
    manualScore={manualScores.feedback}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, feedback: value}))
    }
  />
</SectionCard>

{/* PTG Meetings Section */}
<SectionCard title="Conduction of Guardian [PTG] Meetings" icon="📅" borderColor="border-purple-500">
  {!manualScoring && (
    <InputField
      label="Number of PTG meetings conducted"
      name="ptgMeetings"
      value={formData.ptgMeetings}
      onChange={handleChange}
      placeholder="Enter number of PTG meetings"
    />
  )}
  <ScoreCard
    label="PTG Meetings Score"
    score={scores.ptgScore.toFixed(2)}
    total="50"
    isManual={manualScoring}
    manualScore={manualScores.ptgMeetings}
    onManualScoreChange={(value) => 
      setManualScores(prev => ({...prev, ptgMeetings: value}))
    }
  />
</SectionCard>

{/* Total Score Section */}
<SectionCard title="Total Academic Performance Score" icon="📑" borderColor="border-red-500">
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
          <td className="px-6 py-4 whitespace-nowrap">{userData.role}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            {userData.role === "Professor" ? "300" : 
             userData.role === "Associate Professor" ? "360" : "440"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {manualScoring 
              ? Object.values(manualScores).reduce((a, b) => Number(a) + Number(b), 0).toFixed(2)
              : scores.finalScore.toFixed(2)}
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
