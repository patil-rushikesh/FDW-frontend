/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { User, Save, ArrowLeft, Check, Briefcase } from "lucide-react";

const EvaluateFacultyPage = () => {
  const { facultyId } = useParams();
  const location = useLocation();
  const { faculty } = location.state;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [externalId, setExternalId] = useState(null);

  // Evaluation form data
  const [evaluation, setEvaluation] = useState({
    knowledge: "",
    skills: "",
    attributes: "",
    outcomesInitiatives: "",
    selfBranching: "",
    teamPerformance: "",
    comments: "",
  });

  useEffect(() => {
    setLoading(true);
    // Get current external faculty ID and department from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const currentExternalId = userData._id || null;

    if (!currentExternalId) {
      toast.error("User session not found. Please log in again.");
      navigate("/login", { replace: true });
      return;
    }

    setExternalId(currentExternalId);

    // Load any existing evaluation data from localStorage
    const savedEvaluations = JSON.parse(
      localStorage.getItem("externalEvaluations") || "{}"
    );
    if (savedEvaluations[currentExternalId]?.[facultyId]) {
      setEvaluation(savedEvaluations[currentExternalId][facultyId]);
    }

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId, location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric inputs don't exceed maximum values
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
        teamPerformance: 20,
      };

      // Only allow empty string or positive integers up to the maximum value
      const numValue = value === ""
        ? ""
        : Math.min(Math.max(parseInt(value) || 0, 0), maxValues[name]);

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

    // If submitting final evaluation, validate all required fields are filled
    if (isSubmitted) {
      const requiredFields = [
        "knowledge",
        "skills",
        "attributes",
        "outcomesInitiatives",
        "selfBranching",
        "teamPerformance"
      ];

      const missingFields = requiredFields.filter(field =>
        evaluation[field] === "" || evaluation[field] === null || evaluation[field] === undefined
      );

      if (missingFields.length > 0) {
        toast.error(`Please complete all evaluation criteria before submitting`);
        return;
      }
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

      // Calculate total score
      const totalScore =
        (parseInt(evaluation.knowledge) || 0) +
        (parseInt(evaluation.skills) || 0) +
        (parseInt(evaluation.attributes) || 0) +
        (parseInt(evaluation.outcomesInitiatives) || 0) +
        (parseInt(evaluation.selfBranching) || 0) +
        (parseInt(evaluation.teamPerformance) || 0);

      // Update with new evaluation
      savedEvaluations[externalId][facultyId] = {
        ...evaluation,
        totalScore,
        updatedAt: new Date().toISOString(),
        submittedAt: isSubmitted ? new Date().toISOString() : null,
      };

      // Save to localStorage (for progress tracking)
      localStorage.setItem(
        "externalEvaluations",
        JSON.stringify(savedEvaluations)
      );

      // If submitting final evaluation, send to backend API
      if (isSubmitted) {
        // Log the values before making the API call
        console.log("Submitting evaluation:", {
          externalId,
          facultyId,
          totalScore,
          comments: evaluation.comments
        });

        const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/external_interaction_marks/${faculty.faculty_info.department}/${externalId}/${facultyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total_marks: totalScore,
            comments: evaluation.comments || '',
          }),
          credentials: 'include', // Include this to send cookies if using sessions
        });

        // Add better error handling
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.error || `Server responded with status ${apiResponse.status}`);
        }

        toast.success("Evaluation submitted successfully!");
        // Force dashboard reload to update evaluated status
        window.location.href = "/external/give-marks";
      } else {
        toast.success("Progress saved successfully!");
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error(error.message || "Failed to save evaluation");
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
              onClick={() => navigate("/director/external/give-marks")}
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
      {/* CSS to hide number input spinners and prevent value changes on scroll */}
      <style>
        {`
          /* Hide spinner buttons for Chrome, Safari, Edge, Opera */
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          /* Hide spinner for Firefox */
          input[type=number] {
            -moz-appearance: textfield;
          }
          
          /* Prevent scroll-driven value changes */
          input[type=number]:focus {
            pointer-events: none;
          }
          input[type=number]:not(:focus) {
            pointer-events: auto;
          }
        `}
      </style>

      {/* Back Button */}
      <button
        onClick={() => navigate("/director/external/give-marks")}
        className="mb-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      {/* Faculty Info Card - Made sticky */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sticky top-0 z-10">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Evaluate HoD and Dean</h1>
        </div>

        <div className="p-4">
          {/* Enhanced Faculty Profile Section - Condensed for sticky header */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mr-4 text-indigo-700 shrink-0">
                <User size={28} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {faculty.faculty_info.name}
                </h2>

                <div className="flex flex-wrap gap-2 mt-1">
                  {faculty.faculty_id && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">ID: {faculty.faculty_id}</span>
                  )}
                  <span className="text-xs text-gray-700">
                    <Briefcase size={12} className="inline text-indigo-600 mr-1" />
                    {faculty.faculty_info.department || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
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
                  onClick={(e) => e.target.focus()} // Ensure focus when clicked
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
                  onClick={(e) => e.target.focus()}
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
                  onClick={(e) => e.target.focus()}
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
                  onClick={(e) => e.target.focus()}
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
                  onClick={(e) => e.target.focus()}
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
                  onClick={(e) => e.target.focus()}
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