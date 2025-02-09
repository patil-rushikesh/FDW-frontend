import React, { useState, useEffect } from "react";
import { useFormContext } from "../../context/FormContext";

// Reusable Components
const Header = ({ userLogin }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">UTC Time:</span>
          <span className="font-mono text-blue-600 font-medium">
            {formatDateTime(currentDateTime)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">User:</span>
          <span className="font-mono text-green-600 font-medium">
            {userLogin}
          </span>
        </div>
      </div>
    </div>
  );
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
      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);

export default function TeachingPerformance() {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (e) => {
    updateFormData("teaching", { [e.target.name]: e.target.value });
  };

  // Result Analysis Calculations
  const studentsAbove60 = Number(formData.teaching?.studentsAbove60 || 0);
  const students50to59 = Number(formData.teaching?.students50to59 || 0);
  const students40to49 = Number(formData.teaching?.students40to49 || 0);
  const totalStudents = Number(formData.teaching?.totalStudents || 0);

  const resultScore =
    totalStudents > 0
      ? ((studentsAbove60 * 5 + students50to59 * 4 + students40to49 * 3) /
          totalStudents) *
        10
      : 0;

  // CO Attainment Calculations
  const coAttainmentSem1 = Number(formData.teaching?.coAttainmentSem1 || 0);
  const coAttainmentSem2 = Number(formData.teaching?.coAttainmentSem2 || 0);
  const averageCO = (coAttainmentSem1 + coAttainmentSem2) / 2;
  const coScore = formData.teaching?.timelySubmissionCO ? averageCO / 2 : 0;

  // Other scores calculations
  const elearningScore =
    Number(formData.teaching?.elearningInstances || 0) * 10;
  const feedbackScore = Number(formData.teaching?.feedbackPercentage || 0);
  const ptgMeetings = Number(formData.teaching?.ptgMeetings || 0);
  const ptgScore = (ptgMeetings * 50) / 6;

  // Academic Engagement Score
  const studentsPresent = Number(formData.teaching?.studentsPresent || 0);
  const totalEnrolled = Number(
    formData.teaching?.totalEnrolledStudentsForLectures || 0
  );
  const academicEngagementScore =
    totalEnrolled > 0 ? 50 * (studentsPresent / totalEnrolled) : 0;

  // Teaching Load Score
  const loadSem1 = Number(formData.teaching?.weeklyLoadSem1 || 0);
  const loadSem2 = Number(formData.teaching?.weeklyLoadSem2 || 0);
  const adminValue = Number(formData.teaching?.adminResponsibility || 0);
  const avgLoad = (loadSem1 + loadSem2) / 2;

  let minLoad;
  switch (formData.teaching?.cadre) {
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
      minLoad = 1;
  }

  const teachingLoadScore =
    minLoad > 0 ? Math.min(50, 50 * ((avgLoad + adminValue) / minLoad)) : 0;

  // Projects Score
  const projectsGuided = Number(formData.teaching?.projectsGuided || 0);
  const projectScore = Math.min(40, projectsGuided * 20);

  // Total Score
  const totalScore =
    resultScore +
    coScore +
    elearningScore +
    academicEngagementScore +
    teachingLoadScore +
    projectScore +
    feedbackScore +
    ptgScore;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <Header userLogin="ashirwad5555" />

      {/* Result Analysis Section */}
      <SectionCard
        title="Result Analysis"
        icon="📊"
        borderColor="border-blue-500"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            name="studentsAbove60"
            value={formData.teaching?.studentsAbove60 || ""}
            onChange={handleChange}
            placeholder="No. of students with 60% and above"
          />
          <InputField
            name="students50to59"
            value={formData.teaching?.students50to59 || ""}
            onChange={handleChange}
            placeholder="No. of students with 50% to 59%"
          />
          <InputField
            name="students40to49"
            value={formData.teaching?.students40to49 || ""}
            onChange={handleChange}
            placeholder="No. of students with 40% to 49%"
          />
          <InputField
            name="totalStudents"
            value={formData.teaching?.totalStudents || ""}
            onChange={handleChange}
            placeholder="Total No. of students"
          />
        </div>
        <ScoreCard
          label="Result Analysis Score"
          score={resultScore.toFixed(2)}
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
            name="coAttainmentSem1"
            value={formData.teaching?.coAttainmentSem1 || ""}
            onChange={handleChange}
            placeholder="CO Attainment Semester I (%)"
          />
          <InputField
            name="coAttainmentSem2"
            value={formData.teaching?.coAttainmentSem2 || ""}
            onChange={handleChange}
            placeholder="CO Attainment Semester II (%)"
          />
        </div>
        <div className="mt-4">
          <label className="inline-flex items-center space-x-3">
            <input
              type="checkbox"
              name="timelySubmissionCO"
              checked={formData.teaching?.timelySubmissionCO || false}
              onChange={(e) =>
                updateFormData("teaching", {
                  timelySubmissionCO: e.target.checked,
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
          score={coScore.toFixed(2)}
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
          name="elearningInstances"
          value={formData.teaching?.elearningInstances || ""}
          onChange={handleChange}
          placeholder="Number of e-learning contents developed"
        />
        <ScoreCard
          label="E-learning Score"
          score={elearningScore.toFixed(2)}
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
            name="studentsPresent"
            value={formData.teaching?.studentsPresent || ""}
            onChange={handleChange}
            placeholder="Number of students present for lectures/practical labs/tutorials in AY"
          />
          <InputField
            name="totalEnrolledStudentsForLectures"
            value={formData.teaching?.totalEnrolledStudentsForLectures || ""}
            onChange={handleChange}
            placeholder="Total number of enrolled students for these subjects"
          />
        </div>
        <ScoreCard
          label="Computed Academic Engagement Score"
          score={(() => {
            const studentsPresent = Number(
              formData.teaching?.studentsPresent || 0
            );
            const totalEnrolled = Number(
              formData.teaching?.totalEnrolledStudentsForLectures || 0
            );
            return totalEnrolled > 0
              ? (50 * (studentsPresent / totalEnrolled)).toFixed(2)
              : "0.00";
          })()}
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
            name="weeklyLoadSem1"
            value={formData.teaching?.weeklyLoadSem1 || ""}
            onChange={handleChange}
            placeholder="Weekly Load Semester I"
          />
          <InputField
            name="weeklyLoadSem2"
            value={formData.teaching?.weeklyLoadSem2 || ""}
            onChange={handleChange}
            placeholder="Weekly Load Semester II"
          />
          <InputField
            name="adminResponsibility"
            value={formData.teaching?.adminResponsibility || ""}
            onChange={handleChange}
            placeholder="Administrative Responsibility (E value)"
          />
          <select
            name="cadre"
            value={formData.teaching?.cadre || ""}
            onChange={handleChange}
            className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Cadre</option>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
          </select>
        </div>
        <ScoreCard
          label="Teaching Load Score"
          score={teachingLoadScore.toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* UG Project / PG Dissertations Guided Section */}
      <SectionCard
        title="UG Project / PG Dissertations Guided"
        icon="🎓"
        borderColor="border-green-500"
      >
        <div className="grid grid-cols-1 gap-4">
          <InputField
            name="projectsGuided"
            value={formData.teaching?.projectsGuided || ""}
            onChange={handleChange}
            placeholder="Total number of UG projects and PG dissertations guided in AY"
          />
        </div>
        <ScoreCard
          label="Computed Score"
          score={Math.min(
            40,
            (Number(formData.teaching?.projectsGuided) || 0) * 20
          ).toFixed(2)}
          total="40"
        />
      </SectionCard>

      {/* Feedback of Faculty by Student Section */}
      <SectionCard
        title="Feedback of Faculty by Student"
        icon="📊"
        borderColor="border-blue-500"
      >
        <div className="grid grid-cols-1 gap-4">
          <InputField
            name="feedbackPercentage"
            value={formData.teaching?.feedbackPercentage || ""}
            onChange={handleChange}
            placeholder="Average feedback percentage for subjects taught in current AY"
          />
        </div>
        <ScoreCard
          label="Computed Feedback Score"
          score={(Number(formData.teaching?.feedbackPercentage) || 0).toFixed(
            2
          )}
          total="100"
        />
      </SectionCard>

      {/* Conduction of Guardian [PTG] Meetings Section */}
      <SectionCard
        title="Conduction of Guardian [PTG] Meetings"
        icon="📅"
        borderColor="border-purple-500"
      >
        <div className="grid grid-cols-1 gap-4">
          <InputField
            name="ptgMeetings"
            value={formData.teaching?.ptgMeetings || ""}
            onChange={handleChange}
            placeholder="Total number of PTG meetings conducted in AY"
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            <strong>Instructions:</strong>
          </p>
          <p>
            Proper conduction of PTG meetings in a semester (Minimum 6 meetings
            in a year). (For Student Counseling efforts, marks will be taken as
            50 in case of Deputy Director/Deans/HoDs/PG Coordinators/Ph. D.
            Coordinators).
          </p>
          <p>Marks = (Total number of PTG meetings * 50) / 6</p>
        </div>
        <ScoreCard
          label="Computed PTG Meetings Score"
          score={(
            ((Number(formData.teaching?.ptgMeetings) || 0) * 50) /
            6
          ).toFixed(2)}
          total="50"
        />
      </SectionCard>

      {/* Summary Section */}
      <div className="mt-4 overflow-x-auto">
        {(() => {
          // Recalculate the total marks to use in the table
          const studentsAbove60 = Number(
            formData.teaching?.studentsAbove60 || 0
          );
          const students50to59 = Number(formData.teaching?.students50to59 || 0);
          const students40to49 = Number(formData.teaching?.students40to49 || 0);
          const totalStudents = Number(formData.teaching?.totalStudents || 0);
          const resultScore =
            totalStudents > 0
              ? (studentsAbove60 * 5 +
                  students50to59 * 4 +
                  students40to49 * 3) /
                totalStudents
              : 0;

          const coAttainmentSem1 = Number(
            formData.teaching?.coAttainmentSem1 || 0
          );
          const coAttainmentSem2 = Number(
            formData.teaching?.coAttainmentSem2 || 0
          );
          const averageCO = (coAttainmentSem1 + coAttainmentSem2) / 2;
          const coScore = formData.teaching?.timelySubmissionCO
            ? averageCO / 2
            : 0;

          const elearningScore =
            Number(formData.teaching?.elearningInstances || 0) * 10;

          const studentsPresent = Number(
            formData.teaching?.studentsPresent || 0
          );
          const totalEnrolled = Number(
            formData.teaching?.totalEnrolledStudentsForLectures || 0
          );
          const academnicEngagementScore =
            totalEnrolled > 0 ? 50 * (studentsPresent / totalEnrolled) : 0;

          const loadSem1 = Number(formData.teaching?.weeklyLoadSem1 || 0);
          const loadSem2 = Number(formData.teaching?.weeklyLoadSem2 || 0);
          const adminValue = Number(
            formData.teaching?.adminResponsibility || 0
          );
          const avgLoad = (loadSem1 + loadSem2) / 2;
          let minLoad;
          switch (formData.teaching?.cadre) {
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
              minLoad = 1;
          }
          const teachingLoadScore =
            minLoad > 0
              ? Math.min(50, 50 * ((avgLoad + adminValue) / minLoad))
              : 0;

          const projectsGuided = Number(formData.teaching?.projectsGuided || 0);
          const projectScore = Math.min(40, projectsGuided * 20);

          const feedbackScore = Number(
            formData.teaching?.feedbackPercentage || 0
          );

          const ptgMeetings = Number(formData.teaching?.ptgMeetings || 0);
          const ptgScore = (ptgMeetings * 50) / 6;

          const totalMarks =
            resultScore +
            coScore +
            elearningScore +
            academnicEngagementScore +
            teachingLoadScore +
            projectScore +
            feedbackScore +
            ptgScore;

          return (
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2" colSpan="5">
                    <strong>
                      Part A: Academic Involvement: Obtained Marks Summary
                    </strong>
                  </th>
                </tr>
                <tr>
                  <th className="border border-gray-300 p-2">Cadre</th>
                  <th className="border border-gray-300 p-2"></th>
                  <th className="border border-gray-300 p-2">Professor</th>
                  <th className="border border-gray-300 p-2">
                    Associate Professor
                  </th>
                  <th className="border border-gray-300 p-2">
                    Assistant Professor
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2" colSpan="2">
                    <strong>
                      Cadre wise maximum considerable marks of Academic
                      Involvement
                    </strong>
                  </td>
                  <td className="border border-gray-300 p-2">300</td>
                  <td className="border border-gray-300 p-2">360</td>
                  <td className="border border-gray-300 p-2">440</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2" colSpan="2">
                    <strong>
                      Obtained marks Calculated from Academic Involvement (as
                      per Table 'A')
                    </strong>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formData.teaching?.cadre === "Professor"
                      ? totalMarks.toFixed(2)
                      : ""}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formData.teaching?.cadre === "Associate Professor"
                      ? totalMarks.toFixed(2)
                      : ""}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formData.teaching?.cadre === "Assistant Professor"
                      ? totalMarks.toFixed(2)
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2" colSpan="2">
                    <strong>
                      Actual Academic involvement Marks in Self Appraisal
                    </strong>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formData.teaching?.cadre === "Professor"
                      ? (totalMarks * 0.68).toFixed(2)
                      : ""}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formData.teaching?.cadre === "Associate Professor"
                      ? (totalMarks * 0.818).toFixed(2)
                      : ""}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formData.teaching?.cadre === "Assistant Professor"
                      ? totalMarks.toFixed(2)
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );
}
