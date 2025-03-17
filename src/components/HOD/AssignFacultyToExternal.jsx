import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  X,
  Plus,
  UserPlus,
  UserCheck,
  Search,
  Users,
  CheckCircle,
  RefreshCw,
  Trash2,
  Crown,
  FileText,
  ArrowRight,
} from "lucide-react";

const ALLOWED_ROLES = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
];

const AssignFacultyToExternal = () => {
  const [externalFacultyList, setExternalFacultyList] = useState([]);
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedExternal, setSelectedExternal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deanModalOpen, setDeanModalOpen] = useState(false); // New state for dean modal
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDept, setUserDept] = useState("");
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [deanAssignments, setDeanAssignments] = useState({}); // New state for dean assignments
  const [deanEligibleFaculty, setDeanEligibleFaculty] = useState([]); // New state for dean-eligible faculty
  const [deanExternalMappings, setDeanExternalMappings] = useState([]);
  const [showMappingsSection, setShowMappingsSection] = useState(true);
  const navigate = useNavigate();

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load existing assignments
    const savedAssignments = localStorage.getItem("facultyAssignments");
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error("Error parsing assignments data:", error);
      }
    }
  }, []);

  // Get user data and department
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log("User data from localStorage:", userData); // Debug log
    if (userData) {
      setUserDept(userData.dept);
      console.log("Set user department:", userData.dept); // Debug log
    }
  }, []);

  // Fetch faculty list using the same API as VerificationPanel
  useEffect(() => {
    const fetchFaculties = async () => {
      if (!userDept) {
        console.log("No user department found");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/users");
        if (!response.ok) throw new Error("Failed to fetch faculty data");

        const data = await response.json();
        console.log("Fetched data:", data); // Debug log

        // Filter faculties by department and allowed roles
        const departmentFaculties = data.filter(
          (faculty) =>
            faculty.dept === userDept &&
            faculty.role !== "HOD" &&
            ALLOWED_ROLES.includes(faculty.role)
        );
        console.log("Filtered faculties:", departmentFaculties); // Debug log

        // Transform the data to match your component's structure
        const formattedFaculties = departmentFaculties.map((faculty) => ({
          id: faculty._id,
          name: faculty.name,
          department: faculty.dept,
          employeeId: faculty.empId, // Update this line to match your API field name
          role: faculty.role,
        }));
        console.log("Formatted faculties:", formattedFaculties); // Debug log

        setInternalFacultyList(formattedFaculties);
      } catch (err) {
        console.error("Error loading faculty data:", err);
        toast.error("Failed to load faculty list");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, [userDept]);

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("facultyAssignments", JSON.stringify(assignments));
  }, [assignments]);

  // First, remove the localStorage related code for external faculty and add this useEffect
  useEffect(() => {
    const fetchExternalFaculty = async () => {
      if (!userDept) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/${userDept}/get-externals`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch external faculty list");
        }

        const data = await response.json();
        console.log("Fetched external faculty:", data);

        // Transform the data to match component structure
        const formattedExternals = data.data.map((external) => ({
          id: external._id,
          name: external.full_name,
          designation: external.designation,
          organization: external.organization,
          email: external.email,
        }));

        setExternalFacultyList(formattedExternals);
      } catch (error) {
        console.error("Error fetching external faculty:", error);
        toast.error("Failed to load external faculty list");
      } finally {
        setLoading(false);
      }
    };

    fetchExternalFaculty();
  }, [userDept]);

  // Add useEffect to fetch existing assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!userDept) return;

      try {
        const response = await fetch(
          `http://localhost:5000/${userDept}/external-assignments`
        );
        if (!response.ok) throw new Error("Failed to fetch assignments");

        const data = await response.json();
        setAssignments(data.data || {});
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast.error("Failed to load assignments");
      }
    };

    fetchAssignments();
  }, [userDept]);

  // Add useEffect to fetch existing dean assignments
  useEffect(() => {
    const fetchDeanAssignments = async () => {
      if (!userDept) return;

      try {
        const response = await fetch(
          `http://localhost:5000/${userDept}/external-dean-assignments`
        );
        if (!response.ok) throw new Error("Failed to fetch dean assignments");

        const data = await response.json();
        setDeanAssignments(data.data || {});
      } catch (error) {
        console.error("Error fetching dean assignments:", error);
        // Don't show error toast as the endpoint might not exist yet
      }
    };

    fetchDeanAssignments();
  }, [userDept]);

  // Replace the useEffect to fetch dean-eligible faculty with this new implementation
  useEffect(() => {
    const fetchDeanEligibleFaculty = async () => {
      if (!userDept) return; // Exit early if department isn't available yet
      
      try {
        const response = await fetch(`http://localhost:5000/${userDept}/interaction-deans`);
        if (!response.ok) throw new Error("Failed to fetch department interaction deans");
        
        const result = await response.json();
        
        // Format the dean data to match our component structure
        const formattedDeans = result.deans?.map(dean => ({
          id: dean._id,
          name: dean.name,
          department: dean.department || userDept,
          designation: dean.designation || "Dean",
          role: dean.role || "Dean"
        })) || [];
        
        setDeanEligibleFaculty(formattedDeans);
      } catch (error) {
        console.error("Error fetching department interaction deans:", error);
        toast.error("Failed to load deans list");
      }
    };

    fetchDeanEligibleFaculty();
  }, [userDept]); // Depend on userDept so it refetches when department is available

  // Fetch Dean-External mappings
  const fetchDeanExternalMappings = async () => {
    if (!userDept) return;
    
    try {
      const response = await fetch(`http://localhost:5000/${userDept}/dean-external-mappings`);
      if (!response.ok) throw new Error("Failed to fetch dean-external mappings");
      
      const data = await response.json();
      setDeanExternalMappings(data.data || []);
    } catch (error) {
      console.error("Error fetching dean-external mappings:", error);
      // Don't show error toast as the endpoint might be new
    }
  };
  
  useEffect(() => {
    fetchDeanExternalMappings();
  }, [userDept]);

  // Update the dean-external mappings in local state when fetched
  useEffect(() => {
    if (deanExternalMappings.length > 0 && externalFacultyList.length > 0) {
      // Create or update deanAssignments based on mappings
      const updatedAssignments = { ...deanAssignments };
      
      deanExternalMappings.forEach(mapping => {
        // Find the external reviewer in our list
        const external = externalFacultyList.find(
          ext => ext.id === mapping.external.id
        );
        
        if (external) {
          // Add or update the dean assignment
          updatedAssignments[external.id] = {
            dean_id: mapping.dean.id,
            // Add any other needed properties
          };
        }
      });
      
      // Update the state if there are changes
      if (Object.keys(updatedAssignments).length !== Object.keys(deanAssignments).length) {
        setDeanAssignments(updatedAssignments);
      }
    }
  }, [deanExternalMappings, externalFacultyList]);

  // Add this useEffect after fetching both externals and assignments
  useEffect(() => {
    // This will filter out assignments for externals that no longer exist in the externalFacultyList
    if (externalFacultyList.length > 0 && Object.keys(assignments).length > 0) {
      const validExternalIds = externalFacultyList.map(external => external.id);
      const filteredAssignments = {};
      
      Object.keys(assignments).forEach(externalId => {
        // Only keep assignments for externals that exist in our list
        if (validExternalIds.includes(externalId)) {
          filteredAssignments[externalId] = assignments[externalId];
        }
      });
      
      // Only update if there's a difference to avoid an infinite loop
      if (Object.keys(filteredAssignments).length !== Object.keys(assignments).length) {
        setAssignments(filteredAssignments);
      }
    }
  }, [externalFacultyList, assignments]);

  const openAssignModal = (externalFaculty) => {
    setSelectedExternal(externalFaculty);
    // Initialize pending assignments with current assignments for this external
    setPendingAssignments({
      [externalFaculty.id]: assignments[externalFaculty.id]?.assigned_faculty?.map(faculty => faculty._id) || []
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedExternal(null);
    setSearchQuery("");
  };

  const openDeanModal = (externalFaculty) => {
    setSelectedExternal(externalFaculty);
    setDeanModalOpen(true);
  };

  const closeDeanModal = () => {
    setDeanModalOpen(false);
    setSelectedExternal(null);
    setSearchQuery("");
  };

  // Update the handleAssignFaculty function
  const handleAssignFaculty = (internalFacultyId) => {
    if (!selectedExternal) return;
    const externalId = selectedExternal.id;
    
    // Get current pending assignments for this external
    const currentPendingAssignments = pendingAssignments[externalId] || [];
    
    // If already in pending assignments, remove it
    if (currentPendingAssignments.includes(internalFacultyId)) {
      setPendingAssignments({
        ...pendingAssignments,
        [externalId]: currentPendingAssignments.filter(id => id !== internalFacultyId)
      });
    } else {
      // Otherwise add it
      setPendingAssignments({
        ...pendingAssignments,
        [externalId]: [...currentPendingAssignments, internalFacultyId]
      });
    }
  };

  // Update the handleRemoveFaculty function
  const handleRemoveFaculty = async (externalId, internalFacultyId) => {
    try {
      setLoading(true);
  
      // Get current assignments excluding the faculty to remove
      const currentAssignments =
        assignments[externalId]?.assigned_faculty || [];
      const updatedFacultyIds = currentAssignments
        .filter((faculty) => faculty._id !== internalFacultyId)
        .map((faculty) => faculty._id);
  
      // Prepare the assignments data structure
      const external_assignments = {
        [externalId]: updatedFacultyIds,
      };
  
      // Make API call
      const response = await fetch(
        `http://localhost:5000/${userDept}/assign-externals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ external_assignments }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove faculty");
      }
  
      // Fetch the latest assignment data to update the UI completely
      const refreshResponse = await fetch(
        `http://localhost:5000/${userDept}/external-assignments`
      );
      
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh assignment data");
      }
      
      const refreshData = await refreshResponse.json();
      
      // Update local state with the complete refreshed data
      setAssignments(refreshData.data || {});
      
      toast.success("Faculty removed successfully");
    } catch (error) {
      console.error("Error removing faculty:", error);
      toast.error(error.message || "Failed to remove faculty");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter internal faculty based on search query
  const filteredInternalFaculty = internalFacultyList.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update the getAssignedFacultyDetails function
  const getAssignedFacultyDetails = (externalId) => {
    return assignments[externalId]?.assigned_faculty || [];
  };

  // Update the isFacultyAssignedToAnyExternal function
  const isFacultyAssignedToAnyExternal = (facultyId) => {
    return Object.values(assignments).some((assignment) =>
      assignment?.assigned_faculty?.some((faculty) => faculty._id === facultyId)
    );
  };

  const submitAssignments = async () => {
    if (!selectedExternal) return;
    
    setLoading(true);
    try {
      // Make API call with the pending assignments
      const response = await fetch(
        `http://localhost:5000/${userDept}/assign-externals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ external_assignments: pendingAssignments }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to assign faculty");
      }
      
      // Fetch the latest assignment data to update the UI completely
      const refreshResponse = await fetch(
        `http://localhost:5000/${userDept}/external-assignments`
      );
      
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh assignment data");
      }
      
      const refreshData = await refreshResponse.json();
      
      // Update local state with the complete refreshed data
      setAssignments(refreshData.data || {});
      
      toast.success("Faculty assignments updated successfully");
      closeModal();
    } catch (error) {
      console.error("Error assigning faculty:", error);
      toast.error(error.message || "Failed to update assignments");
    } finally {
      setLoading(false);
    }
  };

  // Get dean details for an external
  const getAssignedDeanDetails = (externalId) => {
    console.log('Checking dean for external ID:', externalId);
    
    // First check in the dean-external mappings (API data)
    const mappingFound = deanExternalMappings.find(
      mapping => mapping.external.id === externalId
    );
    
    if (mappingFound) {
      console.log('Found dean in mappings:', mappingFound.dean);
      // Create a consistent object structure that matches what the UI expects
      return {
        id: mappingFound.dean.id,
        name: mappingFound.dean.name,
        department: mappingFound.dean.department,
        role: 'Dean', // Assuming all mapped deans have this role
        mail: mappingFound.dean.mail
      };
    }
    
    // If not found in mappings, check in local state assignments
    console.log('Dean assignments:', deanAssignments);
    const assignment = deanAssignments[externalId];
    
    if (!assignment || !assignment.dean_id) {
      console.log('No dean assignment found for this external');
      return null;
    }
    
    const deanId = assignment.dean_id;
    console.log('Found dean ID in local state:', deanId);
    
    // First check in the dean-eligible faculty list
    const dean = deanEligibleFaculty.find(
      faculty => faculty.id === deanId || faculty.id.toString() === deanId.toString()
    );
    
    console.log('Dean from eligible faculty:', dean);
    
    // If not found, check the internal faculty list as fallback
    if (!dean) {
      const internalDean = internalFacultyList.find(
        faculty => faculty.id === deanId || faculty.id.toString() === deanId.toString()
      );
      console.log('Dean from internal faculty:', internalDean);
      return internalDean || null;
    }
    
    return dean;
  };
  // Update the handleAssignDean function
  const handleAssignDean = async (externalId, deanId) => {
    try {
      
      // Make the API call to assign a dean to an external reviewer
      const response = await fetch(
        `http://localhost:5000/${userDept}/dean-external-assignment/${externalId}/${deanId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to assign dean");
      }
      else{
        window.location.reload();
      }
      
      // Find the dean's name in the eligible faculty list
      const assignedDean = deanEligibleFaculty.find(dean => dean.id === deanId);
      const deanName = assignedDean ? assignedDean.name : "Selected dean";
      const externalName = selectedExternal.name;
      
      // Refresh dean assignments to get the latest data
      const refreshResponse = await fetch(
        `http://localhost:5000/${userDept}/external-dean-assignments`
      );
      
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh dean assignments");
      }
      
      const refreshData = await refreshResponse.json();
      
      // Update local state with the complete refreshed data
      setDeanAssignments(refreshData.data || {});
      
      // After successful dean assignment, also refresh the dean-external mappings
      await fetchDeanExternalMappings();
      
      // Close the modal
      closeDeanModal();
      

      
    } catch (error) {
      console.error("Error assigning dean:", error);
      toast.error(error.message || "Failed to assign dean");
      setLoading(false);
    }
  };

  // Remove dean assignment
  const handleRemoveDean = async (externalId) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:5000/${userDept}/remove-dean-from-external`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ external_id: externalId }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to remove dean");
      }
      
      // Update state by removing dean assignment
      const updatedDeanAssignments = { ...deanAssignments };
      delete updatedDeanAssignments[externalId];
      setDeanAssignments(updatedDeanAssignments);
      
      // Also refresh the dean-external mappings
      await fetchDeanExternalMappings();
      
      toast.success("Dean removed successfully");
    } catch (error) {
      console.error("Error removing dean:", error);
      toast.error(error.message || "Failed to remove dean");
    } finally {
      setLoading(false);
    }
  };
  // Filter professors and associate professors (dean-eligible faculty)
  const getDeanEligibleFaculty = () => {
    return deanEligibleFaculty;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">
            Assign Faculty to External Reviewers
          </h1>
          <p className="text-indigo-100 text-sm">
            Manage faculty assignments and assign a dean to each external reviewer
          </p>
        </div>

        <div className="p-6">
          {loading && externalFacultyList.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-500">Loading external faculty...</p>
            </div>
          ) : externalFacultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                No external faculty members available. Please add external
                faculty first.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {externalFacultyList.map((external) => {
                const assignedFaculty = getAssignedFacultyDetails(external.id);
                const assignedDean = getAssignedDeanDetails(external.id);

                return (
                  <div
                    key={external.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* External Faculty Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {external.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {external.designation} • {external.organization || "Not specified"}
                        </p>
                        {/* Display dean details beneath external info */}
                        {assignedDean ? (
                          <div className="mt-2 flex items-center">
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Crown size={12} />
                              Dean: {assignedDean.name}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 italic">No dean assigned</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openDeanModal(external)}
                          className={`px-4 py-2 ${
                            assignedDean 
                              ? "bg-amber-500 hover:bg-amber-600" 
                              : "bg-amber-600 hover:bg-amber-700"
                          } text-white rounded-md flex items-center gap-2 transition-colors`}
                        >
                          <Crown size={16} />
                          <span>{assignedDean ? "Change Dean" : "Assign Dean"}</span>
                        </button>
                        <button
                          onClick={() => openAssignModal(external)}
                          disabled={assignedDean}
                          className={`px-4 py-2 ${
                            assignedDean 
                              ? "bg-gray-400 cursor-not-allowed" 
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white rounded-md flex items-center gap-2 transition-colors`}
                          title={assignedDean ? "Please assign a dean first" : "Assign faculty"}
                        >
                          <UserPlus size={16} />
                          <span>Assign Faculty</span>
                        </button>
                      </div>
                    </div>

                    {/* Dean Assignment Section */}
                    {assignedDean && (
                      <div className="p-4 bg-amber-50 border-b border-amber-100">
                        <h4 className="text-sm font-medium text-amber-800 mb-3 flex items-center">
                          <Crown size={16} className="mr-2 text-amber-600" />
                          Assigned Dean
                        </h4>
                        <div className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-amber-200">
                          <div className="flex items-center">
                            <User size={16} className="text-amber-600 mr-2" />
                            <span className="text-gray-800 font-medium">
                              {assignedDean.name}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({assignedDean.role})
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveDean(external.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove dean assignment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Assigned Faculty List */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Assigned Faculty Members
                      </h4>
                      {assignedFaculty && assignedFaculty.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">
                          No faculty members assigned yet
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {assignedFaculty && assignedFaculty.map((faculty) => {
                            // Check if a dean is assigned to this external
                            const hasDeanAssigned = !!getAssignedDeanDetails(external.id);
                            
                            return (
                              <li
                                key={faculty._id}
                                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                              >
                                <div className="flex items-center">
                                  <User
                                    size={16}
                                    className="text-gray-500 mr-2"
                                  />
                                  <span className="text-gray-800">
                                    {faculty.name}
                                  </span>
                                </div>
                                {hasDeanAssigned ? (
                                  // Check if isHodMarksGiven exists and is true
                                  faculty.isHodMarksGiven ? (
                                    <div className="flex items-center">
                                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                        <CheckCircle size={14} className="mr-1" />
                                        Marks: {faculty.hod_total_marks}
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        navigate(`/hod-evaluate/${faculty._id}`, { 
                                          state: { 
                                            faculty: faculty,
                                            external: {
                                              id: external.id,
                                              name: external.name,
                                              organization: external.organization
                                            }
                                          } 
                                        });
                                      }}
                                      className="text-white hover:text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 shadow-sm transition-colors duration-200"
                                      title="Evaluate faculty"
                                    >
                                      <FileText size={14} className="mr-1" />
                                      Evaluate
                                      <ArrowRight size={14} className="ml-1" />
                                    </button>
                                  )
                                ) : (
                                  // Show delete button when no dean is assigned
                                  <button
                                    onClick={() =>
                                      handleRemoveFaculty(external.id, faculty._id)
                                    }
                                    className="text-red-600 hover:text-red-800"
                                    title="Remove assignment"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dean Assignment Modal */}
      {deanModalOpen && selectedExternal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-amber-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Assign Dean to {selectedExternal.name}
                </h2>
                <p className="text-amber-100 text-sm">
                  Select a Professor or Associate Professor to serve as dean
                </p>
              </div>
              <button
                onClick={closeDeanModal}
                className="text-white hover:text-amber-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dean Selection List */}
            <div className="flex-grow overflow-y-auto p-6">
  {loading ? (
    <div className="flex justify-center items-center py-8">
      <RefreshCw className="animate-spin text-amber-600" size={24} />
    </div>
  ) : (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search eligible faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-gray-600">ID</th>
              <th className="px-6 py-3 text-gray-600">Name</th>
              <th className="px-6 py-3 text-gray-600">Designation</th>
              <th className="px-6 py-3 text-gray-600">Department</th>
              <th className="px-6 py-3 text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {getDeanEligibleFaculty()
              .filter(faculty => 
                faculty.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(faculty => {
                const isAssigned = deanAssignments[selectedExternal?.id]?.dean_id === faculty.id;
                
                return (
                  <tr key={faculty.id} className={`border-b hover:bg-gray-50 ${isAssigned ? "bg-amber-50" : ""}`}>
                    <td className="px-6 py-4 font-medium">{faculty.id}</td>
                    <td className="px-6 py-4 font-medium">{faculty.name}</td>
                    <td className="px-6 py-4">{faculty.designation}</td>
                    <td className="px-6 py-4">{faculty.department}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleAssignDean(selectedExternal.id, faculty.id)}
                        className={`px-3 py-1 ${
                          isAssigned 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-amber-600 hover:bg-amber-700"
                        } text-white rounded transition-colors`}
                        disabled={loading}
                      >
                        {isAssigned ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle size={14} />
                            Assigned
                          </span>
                        ) : (
                          "Assign as Dean"
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        
        {getDeanEligibleFaculty().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No eligible faculty members available.</p>
            <p className="text-sm mt-2">Only faculty with Dean designation can be assigned.</p>
          </div>
        )}
      </div>
    </>
  )}
</div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
            <div className="p-4 border-t flex justify-end gap-2">
  <button
    onClick={closeDeanModal}
    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
  >
    Cancel
  </button>
  <button
    onClick={() => window.location.reload()}
    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
  >
    OK
  </button>
</div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Assignment Modal */}
      {modalOpen && selectedExternal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Assign Faculty to {selectedExternal.name}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {selectedExternal.designation} at{" "}
                  {selectedExternal.organization || "Not specified"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-indigo-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Faculty Selection Table */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-4">
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute top-2.5 left-3 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search faculty by name or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Selected Faculties Section */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Pending Assignments
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pendingAssignments[selectedExternal.id]?.length > 0 ? (
                      internalFacultyList
                        .filter(faculty => 
                          pendingAssignments[selectedExternal.id].includes(faculty.id)
                        )
                        .map((faculty) => (
                          <span
                            key={faculty.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {faculty.name}
                            <X 
                              size={14} 
                              className="ml-1 cursor-pointer" 
                              onClick={() => handleAssignFaculty(faculty.id)} 
                            />
                          </span>
                        ))
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        No faculties selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Selected Faculties Section */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Allocated Faculties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignments[selectedExternal.id]?.assigned_faculty
                      ?.length > 0 ? (
                      assignments[selectedExternal.id].assigned_faculty.map(
                        (faculty) => (
                          <span
                            key={faculty._id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {faculty.name}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-gray-500 text-sm italic">
                        No faculties allocated yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Faculty Table */}
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw
                      className="animate-spin text-blue-600"
                      size={24}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-gray-600">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={
                                  filteredInternalFaculty.length > 0 &&
                                  filteredInternalFaculty.every(faculty => 
                                    pendingAssignments[selectedExternal.id]?.includes(faculty.id) ||
                                    isFacultyAssignedToAnyExternal(faculty.id)
                                  )
                                }
                                onChange={() => {
                                  // Get all available faculty (not already assigned to other externals)
                                  const availableFaculty = filteredInternalFaculty.filter(
                                    faculty => !isFacultyAssignedToAnyExternal(faculty.id)
                                  );
                                  
                                  // Check if all available faculty are already selected
                                  const allSelected = availableFaculty.every(faculty => 
                                    pendingAssignments[selectedExternal.id]?.includes(faculty.id)
                                  );
                                  
                                  // If all are selected, deselect all; otherwise, select all available
                                  if (allSelected) {
                                    // Deselect all by removing all faculty IDs from pending assignments
                                    setPendingAssignments({
                                      ...pendingAssignments,
                                      [selectedExternal.id]: []
                                    });
                                  } else {
                                    // Select all available faculty by adding their IDs to pending assignments
                                    setPendingAssignments({
                                      ...pendingAssignments,
                                      [selectedExternal.id]: [
                                        ...availableFaculty.map(faculty => faculty.id)
                                      ]
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2">Select All</span>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-gray-600">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-gray-600">Name</th>
                          <th className="px-6 py-3 text-gray-600">
                            Department
                          </th>
                          <th className="px-6 py-3 text-gray-600">Role</th>
                          <th className="px-6 py-3 text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInternalFaculty.map((faculty) => {
                          // Check if faculty is assigned to current external
                          const isAssigned = assignments[
                            selectedExternal.id
                          ]?.assigned_faculty?.some(
                            (assignedFaculty) =>
                              assignedFaculty._id === faculty.id
                          );

                          // Check if faculty is assigned to any other external
                          const isAssignedToOther =
                            !isAssigned &&
                            isFacultyAssignedToAnyExternal(faculty.id);

                          return (
                            <tr
                              key={faculty.id}
                              className={`border-b ${
                                isAssigned || isAssignedToOther
                                  ? "bg-gray-50 opacity-60"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-6 py-4">
{/* Update the checkbox checked state and onChange handler */}
<input
  type="checkbox"
  checked={pendingAssignments[selectedExternal.id]?.includes(faculty.id)}
  onChange={() => handleAssignFaculty(faculty.id)}
  disabled={loading || isAssignedToOther}
  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
/>
                              </td>
                              <td className="px-6 py-4">
                                {faculty.employeeId ||
                                  faculty.empId ||
                                  faculty.id ||
                                  "N/A"}
                              </td>
                              <td className="px-6 py-4 font-medium">
                                {faculty.name}
                              </td>
                              <td className="px-6 py-4">
                                {faculty.department}
                              </td>
                              <td className="px-6 py-4">{faculty.role}</td>
                              <td className="px-6 py-4">
                                {isAssigned ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Assigned
                                  </span>
                                ) : isAssignedToOther ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Assigned to Other
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAssignments}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                <span>Save Assignments</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dean-External Mappings Section */}
      {deanExternalMappings.length > 0 && showMappingsSection && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-amber-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                Dean-External Reviewer Mappings
              </h2>
              <p className="text-amber-100 text-sm">
                Overview of all dean assignments to external reviewers
              </p>
            </div>
            <button
              onClick={() => setShowMappingsSection(!showMappingsSection)}
              className="text-white hover:text-amber-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dean
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      External Reviewer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deanExternalMappings.map((mapping, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <Crown className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{mapping.dean.name}</div>
                            <div className="text-sm text-gray-500">{mapping.dean.mail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mapping.dean.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{mapping.external.name}</div>
                            <div className="text-sm text-gray-500">{mapping.external.mail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mapping.external.organization}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignFacultyToExternal;
