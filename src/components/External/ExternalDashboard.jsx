import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
} from "lucide-react";

const ExternalDashboard = () => {
  const [assignedFaculty, setAssignedFaculty] = useState([]);
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [currentExternalId, setCurrentExternalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExternalSelector, setShowExternalSelector] = useState(false);

  // Mock external faculty list - in a real app, this would come from API
  const [externalFacultyList, setExternalFacultyList] = useState([
    {
      id: "ext1",
      name: "Dr. Rajiv Kapoor",
      department: "Computer Science",
      institution: "Delhi University",
    },
    {
      id: "ext2",
      name: "Prof. Meera Sharma",
      department: "Information Technology",
      institution: "IIT Bombay",
    },
    {
      id: "ext3",
      name: "Dr. Anand Kumar",
      department: "Electronics",
      institution: "NIT Trichy",
    },
  ]);

  useEffect(() => {
    // Load mock internal faculty data
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

    // Set default external faculty
    if (externalFacultyList.length > 0 && !currentExternalId) {
      setCurrentExternalId(externalFacultyList[0].id);
    }

    // // Setup mock faculty assignments
    // const mockAssignments = {
    //   ext1: ["1", "2", "3"],
    //   ext2: ["4", "5"],
    //   ext3: ["2", "6"],
    // };
    // localStorage.setItem("facultyAssignments", JSON.stringify(mockAssignments));

    // Load saved evaluations or initialize empty
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
        const assignedFacultyWithDetails = internalFacultyList.filter(
          (faculty) => currentAssignments.includes(faculty.id)
        );

        setAssignedFaculty(assignedFacultyWithDetails);
      } catch (error) {
        console.error("Error loading assigned faculty:", error);
      }
    }
  };

  const getEvaluationStatus = (facultyId) => {
    const facultyEval = evaluations[currentExternalId]?.[facultyId];
    if (!facultyEval) return "Not Started";
    if (facultyEval.submittedAt) return "Submitted";
    return "In Progress";
  };

  const getCurrentExternalFaculty = () => {
    return (
      externalFacultyList.find((faculty) => faculty.id === currentExternalId) ||
      {}
    );
  };

  const handleExternalChange = (extId) => {
    setCurrentExternalId(extId);
    setShowExternalSelector(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* External Faculty Selector */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
          <div className="relative">

            {showExternalSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                <div className="p-2 border-b text-xs font-medium text-gray-500">
                  Select External Faculty
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {externalFacultyList.map(external => (
                    <button
                      key={external.id}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${external.id === currentExternalId ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}
                      onClick={() => handleExternalChange(external.id)}
                    >
                      <div className="font-medium">{external.name}</div>
                      <div className="text-xs text-gray-500">{external.institution}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
      </div>
      
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">
            External Faculty Dashboard
          </h1>
          <p className="text-indigo-100 text-sm">
            {getCurrentExternalFaculty().name
              ? `Welcome, ${getCurrentExternalFaculty().name}`
              : "Faculty Evaluation Portal"}
          </p>
          {getCurrentExternalFaculty().institution && (
            <p className="text-indigo-200 text-xs mt-1">
              {getCurrentExternalFaculty().institution} • {getCurrentExternalFaculty().department}
            </p>
          )}
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
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Your Assigned Faculty Members
                </h2>
                <p className="text-gray-600 text-sm">
                  Please evaluate each faculty member on the required parameters
                </p>
              </div>

              {/* Faculty List */}
              <div className="grid gap-4">
                {assignedFaculty.map((faculty) => {
                  const status = getEvaluationStatus(faculty.id);
                  return (
                    <div 
                      key={faculty.id} 
                      id={`faculty-${faculty.id}`}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className={`p-4 flex justify-between items-center ${
                        status === "Submitted" ? "bg-green-50 border-green-200" :
                        status === "In Progress" ? "bg-yellow-50 border-yellow-200" :
                        "bg-white border-gray-200"
                      }`}
                      >
                        <div className="flex items-center">
                          <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 text-indigo-700">
                            <User size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{faculty.name}</h3>
                            <p className="text-sm text-gray-600">{faculty.department}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {status === "Submitted" ? (
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

                          <a 
                            href={`/evaluate-faculty/${faculty.id}`} 
                            className="ml-4 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                          >
                            <FileText size={16} className="mr-1" /> {status === "Submitted" ? "View" : "Evaluate"} 
                            <ArrowRight size={16} className="ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalDashboard;
