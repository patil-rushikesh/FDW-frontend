import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { User, Save, ArrowLeft, Check, AlertCircle } from "lucide-react";

const EvaluateFacultyPage = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faculty, setFaculty] = useState(null);
  const [externalId, setExternalId] = useState(null);
  const [internalFacultyList, setInternalFacultyList] = useState([]);

  // Evaluation form data - add teamPerformance field
  const [evaluation, setEvaluation] = useState({
    knowledge: "",
    skills: "",
    attributes: "",
    outcomesInitiatives: "",
    selfBranching: "",
    teamPerformance: "", // Added team performance field
    comments: "",
  });

  useEffect(() => {
    // Get current external faculty ID from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const currentExternalId = userData.id || null;
    setExternalId(currentExternalId);

    // Load internal faculty list (normally from API, using mock for now)
    const mockInternalFaculty = [
      { id: "1", name: "Dr. Amit Sharma", department: "Computer Science" },
      { id: "2", name: "Dr. Priya Patel", department: "Electronics" },
      { id: "3", name: "Prof. Rajesh Kumar", department: "Mechanical" },
      {
        id: "4",
        name: "Dr. Sunita Verma",
        department: "Information Technology",
      },
      { id: "5", name: "Prof. Dinesh Gupta", department: "Electrical" },
      { id: "6", name: "Dr. Kavita Singh", department: "Civil" },
    ];
    setInternalFacultyList(mockInternalFaculty);

    // Find the faculty being evaluated
    const facultyToEvaluate = mockInternalFaculty.find(
      (f) => f.id === facultyId
    );
    if (facultyToEvaluate) {
      setFaculty(facultyToEvaluate);
    }

    // Load any existing evaluation data from localStorage
    if (currentExternalId) {
      const savedEvaluations = JSON.parse(
        localStorage.getItem("externalEvaluations") || "{}"
      );
      if (savedEvaluations[currentExternalId]?.[facultyId]) {
        setEvaluation(savedEvaluations[currentExternalId][facultyId]);
      }
    }

    setLoading(false);
  }, [facultyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric inputs don't exceed maximum values - add teamPerformance
    if (
      [
        "knowledge",
        "skills",
        "outcomesInitiatives",
        "attributes",
        "selfBranching",
        "teamPerformance",
      ].includes(name)
    ) {
      const maxValues = {
        knowledge: 20,
        skills: 20,
        attributes: 10,
        outcomesInitiatives: 20,
        selfBranching: 10,
        teamPerformance: 20, // Add max value for team performance
      };

      const numValue =
        value === "" ? "" : Math.min(parseInt(value) || 0, maxValues[name]);
      setEvaluation((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setEvaluation((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (isSubmitted = false) => {
    if (!externalId || !facultyId) {
      toast.error("Missing required information");
      return;
    }

    setSaving(true);

    try {
      // Get existing evaluations
      const savedEvaluations = JSON.parse(
        localStorage.getItem("externalEvaluations") || "{}"
      );

      // Create structure if it doesn't exist
      if (!savedEvaluations[externalId]) {
        savedEvaluations[externalId] = {};
      }

      // Update with new evaluation
      savedEvaluations[externalId][facultyId] = {
        ...evaluation,
        updatedAt: new Date().toISOString(),
        submittedAt: isSubmitted ? new Date().toISOString() : null,
      };

      // Save back to localStorage
      localStorage.setItem(
        "externalEvaluations",
        JSON.stringify(savedEvaluations)
      );

      toast.success(
        isSubmitted
          ? "Evaluation submitted successfully!"
          : "Progress saved successfully!"
      );

      // Return to dashboard if submitted
      if (isSubmitted) {
        navigate("/external-dashboard");
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-xl font-bold text-red-600 mb-2">
              Faculty Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The faculty member you're trying to evaluate could not be found.
            </p>
            <button
              onClick={() => navigate("/external-dashboard")}
              className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <ArrowLeft size={16} className="mr-2" /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <button
        onClick={() => navigate("/external-dashboard")}
        className="mb-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      {/* Faculty Info */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Evaluate Faculty</h1>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mr-4 text-indigo-700">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {faculty.name}
              </h2>
              <p className="text-indigo-600">{faculty.department}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-600">
              Please evaluate this faculty member on the following parameters.
              Your assessment will be used as part of their overall performance
              appraisal.
            </p>
          </div>

          {/* Evaluation Form */}
          <form className="space-y-8">
            {/* Knowledge */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-amber-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Knowledge (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member's subject knowledge, research
                background, and academic credentials.
              </p>
              <div className="flex items-center">
                <input
                  type="number"
                  name="knowledge"
                  value={evaluation.knowledge}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  placeholder="0-20"
                  className="w-24 p-2 border rounded-md mr-2"
                />
                <span className="text-gray-500 text-sm">/ 20</span>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-blue-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Skills (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member's teaching skills, communication,
                methodology, and pedagogical approach.
              </p>
              <div className="flex items-center">
                <input
                  type="number"
                  name="skills"
                  value={evaluation.skills}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  placeholder="0-20"
                  className="w-24 p-2 border rounded-md mr-2"
                />
                <span className="text-gray-500 text-sm">/ 20</span>
              </div>
            </div>

            {/* Attributes */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-red-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Attributes (Max 10 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member's professional behavior, punctuality,
                and interpersonal skills.
              </p>
              <div className="flex items-center">
                <input
                  type="number"
                  name="attributes"
                  value={evaluation.attributes}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  placeholder="0-10"
                  className="w-24 p-2 border rounded-md mr-2"
                />
                <span className="text-gray-500 text-sm">/ 10</span>
              </div>
            </div>

            {/* Outcomes and Initiatives */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-yellow-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Outcomes and Initiatives (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member's research output, innovative teaching
                methods, and initiatives taken.
              </p>
              <div className="flex items-center">
                <input
                  type="number"
                  name="outcomesInitiatives"
                  value={evaluation.outcomesInitiatives}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  placeholder="0-20"
                  className="w-24 p-2 border rounded-md mr-2"
                />
                <span className="text-gray-500 text-sm">/ 20</span>
              </div>
            </div>

            {/* Self Branching */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-blue-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Self Branching (Max 10 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member's professional development, continuous
                learning, and self-improvement efforts.
              </p>
              <div className="flex items-center">
                <input
                  type="number"
                  name="selfBranching"
                  value={evaluation.selfBranching}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  placeholder="0-10"
                  className="w-24 p-2 border rounded-md mr-2"
                />
                <span className="text-gray-500 text-sm">/ 10</span>
              </div>
            </div>

            {/* Team Performance */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-red-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Team Performance (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member's ability to work within a team,
                collaborate with colleagues, and contribute to team goals.
              </p>
              <div className="flex items-center">
                <input
                  type="number"
                  name="teamPerformance"
                  value={evaluation.teamPerformance}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  placeholder="0-20"
                  className="w-24 p-2 border rounded-md mr-2"
                />
                <span className="text-gray-500 text-sm">/ 20</span>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-amber-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Additional Comments
              </h3>
              <textarea
                name="comments"
                value={evaluation.comments}
                onChange={handleInputChange}
                placeholder="Please provide any additional feedback or comments about this faculty member's performance."
                className="w-full p-3 border rounded-md h-32"
              ></textarea>
            </div>

            {/* Total Score */}
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                Total Score
              </h3>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-indigo-700">
                  {(parseInt(evaluation.knowledge) || 0) +
                    (parseInt(evaluation.skills) || 0) +
                    (parseInt(evaluation.attributes) || 0) +
                    (parseInt(evaluation.outcomesInitiatives) || 0) +
                    (parseInt(evaluation.selfBranching) || 0) +
                    (parseInt(evaluation.teamPerformance) || 0)}
                </span>
                <span className="text-lg ml-2 text-indigo-500">/ 100</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                <Save size={16} className="mr-2" /> Save Progress
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                <Check size={16} className="mr-2" /> Submit Evaluation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvaluateFacultyPage;
