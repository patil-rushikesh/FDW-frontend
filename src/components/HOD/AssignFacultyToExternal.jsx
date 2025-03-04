import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { User, X, Plus, UserPlus, UserCheck, Search } from "lucide-react";

const AssignFacultyToExternal = () => {
  const [externalFacultyList, setExternalFacultyList] = useState([]);
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedExternal, setSelectedExternal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load external faculty
    const savedExternalFaculty = localStorage.getItem("externalFaculty");
    if (savedExternalFaculty) {
      try {
        setExternalFacultyList(JSON.parse(savedExternalFaculty));
      } catch (error) {
        console.error("Error parsing external faculty data:", error);
      }
    }

    // Load internal faculty (mock data for now)
    // In a real application, this would come from an API or another localStorage key
    const mockInternalFaculty = [
      { id: "1", name: "Dr. Amit Sharma", department: "Computer Science" },
      { id: "2", name: "Dr. Priya Patel", department: "Electronics" },
      { id: "3", name: "Prof. Rajesh Kumar", department: "Mechanical" },
      { id: "4", name: "Dr. Sunita Verma", department: "Information Technology" },
      { id: "5", name: "Prof. Dinesh Gupta", department: "Electrical" },
      { id: "6", name: "Dr. Kavita Singh", department: "Civil" },
    ];
    setInternalFacultyList(mockInternalFaculty);

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

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("facultyAssignments", JSON.stringify(assignments));
  }, [assignments]);

  const openAssignModal = (externalFaculty) => {
    setSelectedExternal(externalFaculty);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedExternal(null);
    setSearchQuery("");
  };

  const handleAssignFaculty = (internalFacultyId) => {
    if (!selectedExternal) return;

    const externalId = selectedExternal.id;
    
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setAssignments((prev) => {
        // Initialize if not exists
        const currentAssignments = prev[externalId] || [];
        
        // Check if already assigned
        if (currentAssignments.includes(internalFacultyId)) {
          toast.error("This faculty is already assigned");
          setLoading(false);
          return prev;
        }
        
        // Add to assignments
        const newAssignments = {
          ...prev,
          [externalId]: [...currentAssignments, internalFacultyId]
        };
        
        toast.success("Faculty assigned successfully");
        setLoading(false);
        return newAssignments;
      });
    }, 500);
  };

  const handleRemoveFaculty = (externalId, internalFacultyId) => {
    setAssignments((prev) => {
      const currentAssignments = prev[externalId] || [];
      return {
        ...prev,
        [externalId]: currentAssignments.filter(id => id !== internalFacultyId)
      };
    });
    toast.success("Faculty removed from assignment");
  };

  // Filter internal faculty based on search query
  const filteredInternalFaculty = internalFacultyList.filter(faculty => 
    faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faculty.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the assigned faculty details for an external faculty
  const getAssignedFacultyDetails = (externalId) => {
    const assignedIds = assignments[externalId] || [];
    return internalFacultyList.filter(faculty => assignedIds.includes(faculty.id));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Assign Faculty to External Reviewers</h1>
          <p className="text-indigo-100 text-sm">
            Manage which faculty members are assigned to each external reviewer
          </p>
        </div>

        <div className="p-6">
          {externalFacultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No external faculty members available. Please add external faculty first.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {externalFacultyList.map((external) => {
                const assignedFaculty = getAssignedFacultyDetails(external.id);
                
                return (
                  <div key={external.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* External Faculty Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{external.name}</h3>
                        <p className="text-sm text-gray-600">
                          {external.designation} • {external.organization || "Not specified"}
                        </p>
                      </div>
                      <button
                        onClick={() => openAssignModal(external)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                      >
                        <UserPlus size={16} />
                        <span>Assign Faculty</span>
                      </button>
                    </div>

                    {/* Assigned Faculty List */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Faculty Members</h4>
                      {assignedFaculty.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">No faculty members assigned yet</p>
                      ) : (
                        <ul className="space-y-2">
                          {assignedFaculty.map((faculty) => (
                            <li 
                              key={faculty.id} 
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center">
                                <User size={16} className="text-gray-500 mr-2" />
                                <span className="text-gray-800">{faculty.name}</span>
                                <span className="text-gray-500 text-sm ml-2">({faculty.department})</span>
                              </div>
                              <button
                                onClick={() => handleRemoveFaculty(external.id, faculty.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove assignment"
                              >
                                <X size={16} />
                              </button>
                            </li>
                          ))}
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

      {/* Assignment Modal */}
      {modalOpen && selectedExternal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Assign Faculty to {selectedExternal.name}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {selectedExternal.designation} at {selectedExternal.organization || "Not specified"}
                </p>
              </div>
              <button 
                onClick={closeModal} 
                className="text-white hover:text-indigo-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search faculty by name or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Faculty List */}
            <div className="flex-grow overflow-y-auto p-4">
              {filteredInternalFaculty.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No faculty members found matching your search
                </p>
              ) : (
                <ul className="space-y-2">
                  {filteredInternalFaculty.map((faculty) => {
                    const isAssigned = (assignments[selectedExternal.id] || []).includes(faculty.id);
                    
                    return (
                      <li 
                        key={faculty.id} 
                        className={`flex justify-between items-center p-3 rounded-md ${
                          isAssigned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{faculty.name}</div>
                          <div className="text-sm text-gray-600">{faculty.department}</div>
                        </div>
                        <button
                          onClick={() => !isAssigned && handleAssignFaculty(faculty.id)}
                          disabled={isAssigned || loading}
                          className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${
                            isAssigned 
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isAssigned ? (
                            <>
                              <UserCheck size={16} />
                              <span>Assigned</span>
                            </>
                          ) : (
                            <>
                              <Plus size={16} />
                              <span>Assign</span>
                            </>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignFacultyToExternal;