import React from "react";
import { useFormContext } from "../../context/FormContext";

export default function TeachingPerformance() {
  const { formData, updateFormData } = useFormContext();

  const handleChange = (e) => {
    updateFormData("teaching", { [e.target.name]: e.target.value });
  };

  const studentsAbove60 = Number(formData.teaching?.studentsAbove60 || 0);
  const students50to59 = Number(formData.teaching?.students50to59 || 0);
  const students40to49 = Number(formData.teaching?.students40to49 || 0);
  const totalStudents = Number(formData.teaching?.totalStudents || 0);

  const computedScore =
    totalStudents > 0
      ? ((
          (studentsAbove60 * 5 + students50to59 * 4 + students40to49 * 3) /
          totalStudents
        ).toFixed(2))* 10
      : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Average of Result analysis of Courses Taught in Semester I and
          Semester II
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="studentsAbove60"
            placeholder="No. of students with 60% and above"
            value={formData.teaching?.studentsAbove60 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="students50to59"
            placeholder="No. of students with 50% to 59%"
            value={formData.teaching?.students50to59 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="students40to49"
            placeholder="No. of students with 40% to 49%"
            value={formData.teaching?.students40to49 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="totalStudents"
            placeholder="Total No. of students"
            value={formData.teaching?.totalStudents || ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="mt-2">
          <span className="font-semibold">Computed Score:</span> {computedScore}{" "}
          out of 50
        </div>
      </div>
      
      <hr className="border-t-4 border-gray-950 my-4" />
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Course Outcome of Courses Taught in Semester-I and Semester-II
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="coAttainmentSem1"
            placeholder="CO Attainment Semester I (%)"
            value={formData.teaching?.coAttainmentSem1 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="coAttainmentSem2"
            placeholder="CO Attainment Semester II (%)"
            value={formData.teaching?.coAttainmentSem2 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="timelySubmissionCO"
                checked={formData.teaching?.timelySubmissionCO || false}
                onChange={(e) =>
                  updateFormData("teaching", {
                    timelySubmissionCO: e.target.checked,
                  })
                }
                className="form-checkbox"
              />
              <span className="ml-2">
                Timely submission and updation of CO attainment with Program NBA
                Team
              </span>
            </label>
          </div>
        </div>
        {(() => {
          const coAttainmentSem1 = Number(
            formData.teaching?.coAttainmentSem1 || 0
          );
          const coAttainmentSem2 = Number(
            formData.teaching?.coAttainmentSem2 || 0
          );
          const averageCO = (coAttainmentSem1 + coAttainmentSem2) / 2;
          // Marks = 20 * (Average CO attainment * 30/100)
          // Normalizing to a score out of 50 by dividing by 2 (when timely submission is checked)
          const computedCOScore = formData.teaching?.timelySubmissionCO
            ? (averageCO * 30 /100 ).toFixed(2)
            : "0.00";
          return (
            <div className="mt-2">
              <span className="font-semibold">Computed CO Score:</span>{" "}
              {computedCOScore} out of 50
            </div>
          );
        })()}
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Development of e-learning contents
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="elearningInstances"
            placeholder="No. of e-learning contents developed and uploaded in AY"
            value={formData.teaching?.elearningInstances || ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="mt-2">
          <span className="font-semibold">
            Computed e-learning Content Score:
          </span>{" "}
          {(Number(formData.teaching?.elearningInstances || 0) * 10).toFixed(2)}
        </div>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Academnic Engagement
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="studentsPresent"
            placeholder="Number of students present for lectures/practical labs/tutorials in AY"
            value={formData.teaching?.studentsPresent || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="totalEnrolledStudentsForLectures"
            placeholder="Total number of enrolled students for these subjects"
            value={formData.teaching?.totalEnrolledStudentsForLectures || ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="mt-2">
          <span className="font-semibold">
            Computed Academnic Engagement Score:
          </span>{" "}
          {(() => {
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
        </div>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Theory / Practical Teaching Load
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="weeklyLoadSem1"
            placeholder="Total Weekly Load for Semester I (Hours)"
            value={formData.teaching?.weeklyLoadSem1 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="weeklyLoadSem2"
            placeholder="Total Weekly Load for Semester II (Hours)"
            value={formData.teaching?.weeklyLoadSem2 || ""}
            onChange={handleChange}
            className="input-field"
          />
          <input
            type="number"
            name="adminResponsibility"
            placeholder="Additional Responsibility (E value)"
            value={formData.teaching?.adminResponsibility || ""}
            onChange={handleChange}
            className="input-field"
          />
          <select
            name="cadre"
            value={formData.teaching?.cadre || ""}
            onChange={handleChange}
            className="input-field"
          >
            <option value="" disabled>
              Select Cadre
            </option>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            <strong>Instructions:</strong>
          </p>
          <p>
            Marks = Minimum of (50, 50 * (Average of Total Weekly Load per
            Semester + E) / Minimum Load as per Cadre)
          </p>
          <p>Minimum Load as per Cadre per week per Semester:</p>
          <ul className="list-disc ml-4">
            <li>Professor: 12 Hrs</li>
            <li>Associate Professor: 14 Hrs</li>
            <li>Assistant Professor: 16 Hrs</li>
          </ul>
          <p>
            E = 2 for taking admin responsibility
            (Deputy/Director/Dean/HoD/Asso. Dean) or monitoring Ph.D. Scholars,
            with a maximum value of E = 4.
          </p>
        </div>
        <div className="mt-2">
          <span className="font-semibold">Computed Teaching Load Score:</span>{" "}
          {(() => {
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
                minLoad = 1; // fallback value to avoid division by zero
            }
            const computedScore =
              minLoad > 0
                ? Math.min(50, 50 * ((avgLoad + adminValue) / minLoad))
                : 0;
            return computedScore.toFixed(2);
          })()}
        </div>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          UG project / PG Dissertations Guided
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="projectsGuided"
            placeholder="Total number of UG projects and PG dissertations guided in AY"
            value={formData.teaching?.projectsGuided || ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="mt-2">
          <span className="font-semibold">Computed Score:</span>{" "}
          {(() => {
            const projectsGuided = Number(
              formData.teaching?.projectsGuided || 0
            );
            return Math.min(40, projectsGuided * 20).toFixed(2);
          })()}{" "}
          out of 40
        </div>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Feedback of faculty by student
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="feedbackPercentage"
            placeholder="Average feedback percentage for subjects taught in current AY"
            value={formData.teaching?.feedbackPercentage || ""}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="mt-2">
          <span className="font-semibold">Computed Feedback Score:</span>{" "}
          {(() => {
            const feedbackPercentage = Number(
              formData.teaching?.feedbackPercentage || 0
            );
            return feedbackPercentage.toFixed(2);
          })()}{" "}
          out of 100
        </div>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Conduction of Guardian [PTG] Meetings
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-4">
          <input
            type="number"
            name="ptgMeetings"
            placeholder="Total number of PTG meetings conducted in AY"
            value={formData.teaching?.ptgMeetings || ""}
            onChange={handleChange}
            className="input-field"
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
        <div className="mt-2">
          <span className="font-semibold">Computed PTG Meetings Score:</span>{" "}
          {(() => {
            const ptgMeetings = Number(formData.teaching?.ptgMeetings || 0);
            const computedScore = (ptgMeetings * 50) / 6;
            return computedScore.toFixed(2);
          })()}{" "}
          out of 50
        </div>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900">
          Total of Marks Obtained:{" "}
          {(() => {
            // Total marks calculation (as before)
            const studentsAbove60 = Number(
              formData.teaching?.studentsAbove60 || 0
            );
            const students50to59 = Number(
              formData.teaching?.students50to59 || 0
            );
            const students40to49 = Number(
              formData.teaching?.students40to49 || 0
            );
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
                minLoad = 1; // fallback
            }
            const teachingLoadScore =
              minLoad > 0
                ? Math.min(50, 50 * ((avgLoad + adminValue) / minLoad))
                : 0;

            const projectsGuided = Number(
              formData.teaching?.projectsGuided || 0
            );
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

            return totalMarks.toFixed(2);
          })()}
        </h3>
      </div>

      <hr className="border-t-4 border-gray-950 my-4" />

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

      <hr className="border-t-4 border-gray-950 my-4" />

      <button
        type="Change Passward"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
      >
        Save & Next
      </button>
    </div>
  );
}
