import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { User, Save, ArrowLeft, Check, Briefcase, Mail} from "lucide-react";

const DirectorInteractionEvaluation = () => {
  const { facultyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faculty, setFaculty] = useState(null);
  const [facultyDepartment, setFacultyDepartment] = useState("");

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
    if (location.state && location.state.faculty && location.state.department) {
      setFaculty(location.state.faculty);
      setFacultyDepartment(location.state.department || "");
    } else {
      toast.error("Faculty information not available");
      navigate("/director/assign-external");
    }
    setLoading(false);
  }, [facultyId, location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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

      const numValue = value === "" 
        ? "" 
        : Math.min(Math.max(parseInt(value) || 0, 0), maxValues[name]);
        
      setEvaluation((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setEvaluation((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (isSubmitted = false) => {
    if (!facultyId) {
      toast.error("Missing required information");
      return;
    }

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
      const savedEvaluations = JSON.parse(
        localStorage.getItem("directorEvaluations") || "{}"
      );


      const totalScore = 
        (parseInt(evaluation.knowledge) || 0) +
        (parseInt(evaluation.skills) || 0) +
        (parseInt(evaluation.attributes) || 0) +
        (parseInt(evaluation.outcomesInitiatives) || 0) +
        (parseInt(evaluation.selfBranching) || 0) +
        (parseInt(evaluation.teamPerformance) || 0);

      savedEvaluations[facultyId] = {
        ...evaluation,
        totalScore,
        updatedAt: new Date().toISOString(),
        submittedAt: isSubmitted ? new Date().toISOString() : null,
      };

      localStorage.setItem(
        "directorEvaluations",
        JSON.stringify(savedEvaluations)
      );

      if (isSubmitted) {
        const apiResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/${facultyDepartment}/director_interaction_marks/${facultyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total_marks: totalScore,
            comments: evaluation.comments || '',
          }),
        });
        
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          throw new Error(errorData.error || 'Failed to submit evaluation to server');
        }
        
        toast.success("Evaluation submitted successfully!");
        window.location.reload();
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
              The faculty member you&apos;re trying to evaluate could not be found.
            </p>
            <button
              onClick={() => {
                navigate("/hod/assign-faculty-external");
                window.location.reload();
              }}
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
      
      <button
        onClick={() => {
          navigate("/director/assign-external");
          window.location.reload();
        }}
        className="mb-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">HOD Interaction Evaluation</h1>
        </div>

        <div className="p-6">
      
          <div className="bg-indigo-50 rounded-lg p-6 mb-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="bg-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mr-6 text-indigo-700 mb-4 md:mb-0">
                <User size={40} />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {faculty.name}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {faculty._id && (
                    <div className="flex items-center">
                      <span className="text-md text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {faculty._id}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Briefcase size={18} className="text-indigo-600 mr-2" />
                    <span className="text-gray-700">
                      <span className="font-medium">Department:</span> {facultyDepartment || "Not specified"}
                    </span>
                  </div>

                  {faculty.email && (
                    <div className="flex items-center">
                      <Mail size={18} className="text-indigo-600 mr-2" />
                      <span className="text-gray-700">{faculty.email}</span>
                    </div>
                  )}
                </div>
                
                
                {faculty.expertise && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-800 mb-1">Areas of Expertise:</h3>
                    <p className="text-gray-700">{faculty.expertise}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-600">
              Please evaluate this faculty member based on your interactions.
              Your assessment will be used as part of their overall performance
              appraisal.
            </p>
          </div>

      
          <form className="space-y-8">
    
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-amber-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Knowledge (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member&apos; subject knowledge, research
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

    
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-blue-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Skills (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member&apos; teaching skills, communication,
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

            
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-red-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Attributes (Max 10 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member&apos; professional behavior, punctuality,
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

            
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-yellow-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Outcomes and Initiatives (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member&apos; research output, innovative teaching
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

            
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-blue-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Self Branching (Max 10 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member&apos;s professional development, continuous
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

            
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-red-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Team Performance (Max 20 marks)
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Assess the faculty member&apos; ability to work within a team,
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

            
            <div className="bg-gray-50 p-6 rounded-lg border-l-3 border-amber-400">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Additional Comments
              </h3>
              <textarea
                name="comments"
                value={evaluation.comments}
                onChange={handleInputChange}
                placeholder="Please provide any additional feedback or comments about this faculty member&apos; performance."
                className="w-full p-3 border rounded-md h-32"
              ></textarea>
            </div>

            
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

export default DirectorInteractionEvaluation;