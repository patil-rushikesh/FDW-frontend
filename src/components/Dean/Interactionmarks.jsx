import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Interactionmarks = () => {
  const navigate = useNavigate();
  const [assignedFaculty, setAssignedFaculty] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deanInfo, setDeanInfo] = useState({});

  // Get user data from localStorage, similar to Profile component
  const [deanId, setDeanId] = useState("");
  const [department, setDepartment] = useState("");

  // Initialize user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setDeanId(userData._id);
      setDepartment(userData.dept);
      setDeanInfo({
        full_name: userData.name,
        organization: userData.organization || "",
        dept: userData.dept,
        desg: userData.desg,
      });
    } else {
      // Handle case when user is not logged in
      setError("User not logged in or session expired");
      toast.error("Please log in again");
    }
  }, []);

  useEffect(() => {
    // Only fetch assignments if we have the required data
    if (deanId && department) {
      fetchAssignments();
    }

    // Load saved evaluations or initialize empty
    const savedEvaluations = localStorage.getItem("deanEvaluations");
    if (savedEvaluations) {
      try {
        setEvaluations(JSON.parse(savedEvaluations));
      } catch (error) {
        console.error("Error parsing evaluations data:", error);
      }
    }
  }, [deanId, department]);

  // Fetch dean assignments from API
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/${department}/dean-assignments/${deanId}`
      );

      if (response.data && response.data.data) {
        // The response now has a different structure with external IDs as keys
        // Convert the grouped data into a flat array with external ID information
        const flattenedFaculty = [];
        const externalIds = Object.keys(response.data.data).filter(
          (key) => key !== "reviewer_info"
        );

        externalIds.forEach((externalId) => {
          const facultyList = response.data.data[externalId] || [];
          facultyList.forEach((faculty) => {
            flattenedFaculty.push({
              ...faculty,
              externalId, // Add externalId to each faculty object for grouping
            });
          });
        });

        setAssignedFaculty(flattenedFaculty);

        // Update dean info if needed
        if (
          Object.keys(deanInfo).length === 0 &&
          response.data.data.reviewer_info
        ) {
          setDeanInfo({
            full_name: response.data.data.reviewer_info.full_name,
            organization: response.data.data.reviewer_info.organization || "",
            dept: department,
            desg: "Dean",
          });
        }
      } else {
        setError("No data found");
      }
    } catch (err) {
      setError(err.message || "Failed to load assignments");
      toast.error("Error loading assignments");
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Save evaluations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("deanEvaluations", JSON.stringify(evaluations));
  }, [evaluations]);

  const getEvaluationStatus = (facultyId) => {
    const facultyEval = evaluations[deanId]?.[facultyId];

    // Check if this faculty member is marked as reviewed in the API response
    const facultyData = assignedFaculty.find(
      (faculty) => faculty._id === facultyId
    );
    if (facultyData?.isReviewed) return "Submitted";

    // Fall back to local storage data
    if (!facultyEval) return "Not Started";
    if (facultyEval.submittedAt) return "Submitted";
    return "In Progress";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">
            Dean Interaction Assessment
          </h1>
          <p className="text-indigo-100 text-sm">
            {deanInfo.full_name
              ? `Welcome, ${deanInfo.full_name}`
              : "Faculty Evaluation Portal"}
          </p>
          {deanInfo.organization && (
            <p className="text-indigo-200 text-xs mt-1">
              {deanInfo.organization} • {deanInfo.dept} • {deanInfo.desg}
            </p>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading assignments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : assignedFaculty.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                No faculty members have been assigned to you for interaction
                assessment yet.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Faculty Assigned for Interaction Assessment
                </h2>
                <p className="text-gray-600 text-sm">
                  Please evaluate each faculty member based on your interactions
                </p>
              </div>

              {/* Faculty List grouped by External ID */}
              <div className="grid gap-6">
                {/* Group faculty by external ID */}
                {Object.entries(
                  assignedFaculty.reduce((grouped, faculty) => {
                    const externalId = faculty.externalId;
                    if (!grouped[externalId]) {
                      grouped[externalId] = [];
                    }
                    grouped[externalId].push(faculty);
                    return grouped;
                  }, {})
                ).map(([externalId, facultyList]) => (
                  <div key={externalId} className="mb-6">
                    <div className="bg-gray-100 p-3 rounded-lg mb-3">
                      <h3 className="font-medium text-gray-800">
                        External Evaluator ID: {externalId}
                      </h3>
                    </div>

                    <div className="grid gap-4">
                      {facultyList.map((faculty) => (
                        <div
                          key={faculty._id}
                          id={`faculty-${faculty._id}`}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div
                            className={`p-4 flex justify-between items-center ${
                              faculty.isReviewed
                                ? "bg-green-50 border-green-200"
                                : getEvaluationStatus(faculty._id) ===
                                    "In Progress"
                                  ? "bg-yellow-50 border-yellow-200"
                                  : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mr-4 text-indigo-700">
                                <User size={20} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {faculty.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {faculty._id}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {faculty.isReviewed ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  <CheckCircle size={16} className="mr-1" />{" "}
                                  Evaluated
                                </span>
                              ) : getEvaluationStatus(faculty._id) ===
                                "In Progress" ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                  <AlertCircle size={16} className="mr-1" /> In
                                  Progress
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                  <Info size={16} className="mr-1" /> Not
                                  Started
                                </span>
                              )}

                              {faculty.isReviewed ? (
                                <div className="ml-4 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700">
                                  <CheckCircle size={16} className="mr-1" />
                                  Score: {faculty.total_marks}/100
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    navigate(`/dean-evaluate/${faculty._id}`, {
                                      state: {
                                        faculty: { ...faculty }, // Include all faculty data
                                        externalId: faculty.externalId, // Add the externalId separately for clarity
                                      },
                                    })
                                  }
                                  className="ml-4 inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                                >
                                  <FileText size={16} className="mr-1" />
                                  Evaluate
                                  <ArrowRight size={16} className="ml-1" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interactionmarks;
