import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { User, Save, CheckCircle, AlertCircle, Info } from "lucide-react";

const ExternalDashboard = () => {
  const [assignedFaculty, setAssignedFaculty] = useState([]);
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [currentExternalId, setCurrentExternalId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Mock external faculty login - in a real app, this would come from authentication
  // For testing, we'll use a dropdown to select which external faculty to view as
  const [externalFacultyList, setExternalFacultyList] = useState([]);
  
  useEffect(() => {
    // Load external faculty list
    const savedExternalFaculty = localStorage.getItem("externalFaculty");
    if (savedExternalFaculty) {
      try {
        const parsedExternalFaculty = JSON.parse(savedExternalFaculty);
        setExternalFacultyList(parsedExternalFaculty);
        
        // Set first external faculty as current by default
        if (parsedExternalFaculty.length > 0 && !currentExternalId) {
          setCurrentExternalId(parsedExternalFaculty[0].id);
        }
      } catch (error) {
        console.error("Error parsing external faculty data:", error);
      }
    }

    // Load internal faculty (mock data for now)
    const mockInternalFaculty = [
      { id: "1", name: "Dr. Amit Sharma", department: "Computer Science" },
      { id: "2", name: "Dr. Priya Patel", department: "Electronics" },
      { id: "3", name: "Prof. Rajesh Kumar", department: "Mechanical" },
      { id: "4", name: "Dr. Sunita Verma", department: "Information Technology" },
      { id: "5", name: "Prof. Dinesh Gupta", department: "Electrical" },
      { id: "6", name: "Dr. Kavita Singh", department: "Civil" },
    ];
    setInternalFacultyList(mockInternalFaculty);

    // Load saved evaluations
    const savedEvaluations = localStorage.getItem("externalEvaluations");
    if (savedEvaluations) {
      try {
        setEvaluations(JSON.parse(savedEvaluations));
      } catch (error) {
        console.error("Error parsing evaluations data:", error);
      }
    }
  }, []);

  // Load assignments whenever currentExternalId changes
  useEffect(() => {
    if (currentExternalId) {
      loadAssignedFaculty();
    }
  }, [currentExternalId]);

  // Save evaluations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("externalEvaluations", JSON.stringify(evaluations));
  }, [evaluations]);

  const loadAssignedFaculty = () => {
    const savedAssignments = localStorage.getItem("facultyAssignments");
    if (savedAssignments && currentExternalId) {
      try {
        const parsedAssignments = JSON.parse(savedAssignments);
        const currentAssignments = parsedAssignments[currentExternalId] || [];
        
        // Get full details of assigned internal faculty
        const assignedFacultyWithDetails = internalFacultyList
          .filter(faculty => currentAssignments.includes(faculty.id));
          
        setAssignedFaculty(assignedFacultyWithDetails);
      } catch (error) {
        console.error("Error loading assigned faculty:", error);
      }
    }
  };

  const handleRatingChange = (facultyId, parameter, value) => {
    setEvaluations(prev => {
      const facultyEvaluations = prev[currentExternalId]?.[facultyId] || {};
      
      return {
        ...prev,
        [currentExternalId]: {
          ...(prev[currentExternalId] || {}),
          [facultyId]: {
            ...facultyEvaluations,
            [parameter]: parseInt(value)
          }
        }
      };
    });
  };

  const handleSubmitEvaluation = async (facultyId) => {
    setLoading(true);
    
    try {
      // Validate that all parameters have been rated
      const facultyEval = evaluations[currentExternalId]?.[facultyId] || {};
      const parameters = ['subjectKnowledge', 'presentationSkills', 'researchQuality', 'innovation', 'overallPerformance'];
      
      const missingParams = parameters.filter(param => !facultyEval[param]);
      if (missingParams.length > 0) {
        toast.error(`Please rate all parameters before submitting`);
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mark evaluation as submitted
      setEvaluations(prev => ({
        ...prev,
        [currentExternalId]: {
          ...(prev[currentExternalId] || {}),
          [facultyId]: {
            ...facultyEval,
            submittedAt: new Date().toISOString()
          }
        }
      }));
      
      toast.success("Evaluation submitted successfully");
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation");
    } finally {
      setLoading(false);
    }
  };

  const getEvaluationStatus = (facultyId) => {
    const facultyEval = evaluations[currentExternalId]?.[facultyId];
    if (!facultyEval) return "Not Started";
    if (facultyEval.submittedAt) return "Submitted";
    return "In Progress";
  };

  const getCurrentExternalFaculty = () => {
    return externalFacultyList.find(faculty => faculty.id === currentExternalId) || {};
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* External Faculty Selection (for testing purposes) */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-yellow-800">Test Mode</h3>
            <p className="text-sm text-yellow-700 mb-3">
              In a production environment, external faculty would directly login to their account. 
              For testing purposes, select an external faculty from the dropdown below:
            </p>
            <select 
              value={currentExternalId || ''}
              onChange={(e) => setCurrentExternalId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select External Faculty</option>
              {externalFacultyList.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.organization || 'No Organization'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">External Faculty Dashboard</h1>
          <p className="text-indigo-100 text-sm">
            {getCurrentExternalFaculty().name ? `Welcome, ${getCurrentExternalFaculty().name}` : 'Faculty Evaluation Portal'}
          </p>
        </div>

        <div className="p-6">
          {!currentExternalId ? (
            <div className="text-center py-8 text-gray-500">
              <p>Please select an external faculty to view their dashboard</p>
            </div>
          ) : assignedFaculty.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No faculty members have been assigned to you yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Your Assigned Faculty Members</h2>
                <p className="text-gray-600 text-sm">
                  Please evaluate each faculty member on the given parameters (scale 1-5, where 5 is excellent)
                </p>
              </div>
              
              {assignedFaculty.map((faculty) => {
                const status = getEvaluationStatus(faculty.id);
                const facultyEval = evaluations[currentExternalId]?.[faculty.id] || {};
                const isSubmitted = status === "Submitted";
                
                return (
                  <div 
                    key={faculty.id}
                    className={`border rounded-lg overflow-hidden ${
                      isSubmitted ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Faculty Header */}
                    <div className={`px-6 py-4 flex justify-between items-center ${
                      isSubmitted ? 'bg-green-100' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        <User size={24} className={`mr-3 ${isSubmitted ? 'text-green-600' : 'text-gray-500'}`} />
                        <div>
                          <h3 className="text-lg font-semibold">{faculty.name}</h3>
                          <p className="text-sm text-gray-600">{faculty.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isSubmitted ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle size={16} className="mr-1" /> Evaluated
                          </span>
                        ) : status === "In Progress" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle size={16} className="mr-1" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            <Info size={16} className="mr-1" /> Not Started
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Evaluation Form */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subject Knowledge */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Knowledge
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="flex flex-col items-center">
                                <input
                                  type="radio"
                                  name={`${faculty.id}-subjectKnowledge`}
                                  value={rating}
                                  checked={facultyEval.subjectKnowledge === rating}
                                  onChange={() => handleRatingChange(faculty.id, 'subjectKnowledge', rating)}
                                  disabled={isSubmitted}
                                  className="sr-only"
                                />
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${
                                    facultyEval.subjectKnowledge === rating 
                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                                  } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  {rating}
                                </div>
                                <span className="text-xs mt-1">{rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Presentation Skills */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Presentation Skills
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="flex flex-col items-center">
                                <input
                                  type="radio"
                                  name={`${faculty.id}-presentationSkills`}
                                  value={rating}
                                  checked={facultyEval.presentationSkills === rating}
                                  onChange={() => handleRatingChange(faculty.id, 'presentationSkills', rating)}
                                  disabled={isSubmitted}
                                  className="sr-only"
                                />
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${
                                    facultyEval.presentationSkills === rating 
                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                                  } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  {rating}
                                </div>
                                <span className="text-xs mt-1">{rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Research Quality */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Research Quality
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="flex flex-col items-center">
                                <input
                                  type="radio"
                                  name={`${faculty.id}-researchQuality`}
                                  value={rating}
                                  checked={facultyEval.researchQuality === rating}
                                  onChange={() => handleRatingChange(faculty.id, 'researchQuality', rating)}
                                  disabled={isSubmitted}
                                  className="sr-only"
                                />
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${
                                    facultyEval.researchQuality === rating 
                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                                  } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  {rating}
                                </div>
                                <span className="text-xs mt-1">{rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Innovation & Creativity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Innovation & Creativity
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="flex flex-col items-center">
                                <input
                                  type="radio"
                                  name={`${faculty.id}-innovation`}
                                  value={rating}
                                  checked={facultyEval.innovation === rating}
                                  onChange={() => handleRatingChange(faculty.id, 'innovation', rating)}
                                  disabled={isSubmitted}
                                  className="sr-only"
                                />
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${
                                    facultyEval.innovation === rating 
                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                                  } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  {rating}
                                </div>
                                <span className="text-xs mt-1">{rating === 1 ? 'Poor' : rating === 5 ? 'Excellent' : ''}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Overall Performance */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Overall Performance
                          </label>
                          <div className="flex items-center space-x-2 justify-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="flex flex-col items-center">
                                <input
                                  type="radio"
                                  name={`${faculty.id}-overallPerformance`}
                                  value={rating}
                                  checked={facultyEval.overallPerformance === rating}
                                  onChange={() => handleRatingChange(faculty.id, 'overallPerformance', rating)}
                                  disabled={isSubmitted}
                                  className="sr-only"
                                />
                                <div 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-2 ${
                                    facultyEval.overallPerformance === rating 
                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                                  } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  {rating}
                                </div>
                                <span className="text-xs mt-1">
                                  {rating === 1 ? 'Poor' : 
                                   rating === 2 ? 'Fair' : 
                                   rating === 3 ? 'Good' : 
                                   rating === 4 ? 'Very Good' : 'Excellent'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div className="md:col-span-2 mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Comments (Optional)
                          </label>
                          <textarea
                            value={facultyEval.comments || ''}
                            onChange={(e) => handleRatingChange(faculty.id, 'comments', e.target.value)}
                            disabled={isSubmitted}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                              isSubmitted ? 'bg-gray-50 cursor-not-allowed' : ''
                            }`}
                            rows="3"
                            placeholder="Enter any additional comments or feedback..."
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      {!isSubmitted && (
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => handleSubmitEvaluation(faculty.id)}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                          >
                            {loading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="mr-2" />
                                Submit Evaluation
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Submitted Info */}
                      {isSubmitted && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-center">
                          <CheckCircle size={16} className="mr-2" />
                          <span>
                            Evaluation submitted on {new Date(facultyEval.submittedAt).toLocaleDateString()} at {new Date(facultyEval.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalDashboard;