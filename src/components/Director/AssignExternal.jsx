import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  X,
  UserPlus,
  Search,
  CheckCircle,
  RefreshCw,
  Lock,
  Trash2,
  FileText,
} from "lucide-react";

const ALLOWED_ROLES = ["Professor", "Associate Professor", "Assistant Professor"];

const AssignExternal = () => {
  const [externalList, setExternalList] = useState([]);
  const [internalFacultyList, setInternalFacultyList] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [selectedInternalFaculty, setSelectedInternalFaculty] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch once on mount, not on every internalFacultyList change
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users`);
        if (!res.ok) throw new Error("Failed to fetch faculty data");
        const data = await res.json();
        const filtered = data.filter(
          (f) =>
            (f.desg === "HOD" || f.desg === "Dean") && ALLOWED_ROLES.includes(f.role)
        );
        // Fetch lock status and director marks in parallel for all faculties
        const facultyPromises = filtered.map(async (f) => {
          const [isExternalsFinal, directorMarks] = await Promise.all([
            getLockedStatus(f._id),
            f.isDirectorMarksGiven ? getDirectorMarks(f._id) : Promise.resolve(null)
          ]);
          return {
            id: f._id,
            name: f.name,
            department: f.dept,
            designation: f.desg,
            employeeId: f.empId,
            role: f.role,
            review_status: f.review_status || "pending",
            isDirectorMarksGiven: f.isDirectorMarksGiven || false,
            isExternalsFinal: isExternalsFinal || false,
            directorMarks: directorMarks
          };
        });
        const formatted = await Promise.all(facultyPromises);
        setInternalFacultyList(formatted);
      } catch (e) {
        toast.error("Failed to load faculty list");
      } finally {
        setLoading(false);
      }
    };

    const fetchExternalFaculty = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/get-externals`);
        if (!res.ok) throw new Error("Failed to fetch externals");
        const data = await res.json();
        const formatted = data.data.map((ext) => ({
          id: ext._id,
          name: ext.full_name,
          designation: ext.desg,
          organization: ext.organization,
          email: ext.mail,
        }));
        setExternalList(formatted);
      } catch (e) {
        toast.error("Failed to load external faculty list");
      } finally {
        setLoading(false);
      }
    };

    const fetchAssignments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/external-assignments`);
        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
        setAssignments(data.data || {});
      } catch (e) {
        toast.error("Failed to load assignments");
      }
    };

    // Only run once on mount
    fetchFaculties();
    fetchExternalFaculty();
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDirectorMarks = async (facultyId) => {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/director_interaction_marks/${facultyId}`);
    if (res.ok) {
      const data = await res.json();
      return data.marks.director_marks || null;
    }
    return null;
  };

  const getLockedStatus = async (facultyId) => {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/get-external-lock-status/${facultyId}`);
    if (res.ok) {
      const data = await res.json();
      console.log("Lock status data:", data.isLocked);
      return data.isLocked || false;
    }
    return false;
  };

  // Open modal and initialize pending assignments with current assigned externals for that faculty
  const openAssignModal = (internalFaculty) => {
    setSelectedInternalFaculty(internalFaculty);

    const currentAssigned = assignments[internalFaculty.id]?.assigned_externals || [];
    const assignedIds = currentAssigned.map((ext) => ext.external_id || ext.id);

    setPendingAssignments((prev) => ({
      ...prev,
      [internalFaculty.id]: assignedIds,
    }));

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInternalFaculty(null);
    setSearchQuery("");
  };

  const handleFreezeExternal = async (facultyId) => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/lock-externals/${facultyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId }),
      });

      const data = await res.json();
      window.location.reload();
      if (!res.ok) throw new Error(data.error || "Failed to lock externals");
      toast.success("Externals locked successfully");
    } catch (error) {
      toast.error(error.message || "Failed to lock externals");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExternal = (externalId) => {
    if (!selectedInternalFaculty) return;
    const facultyId = selectedInternalFaculty.id;

    const currentPending = pendingAssignments[facultyId] || [];
    if (currentPending.includes(externalId)) {
      // Remove external
      setPendingAssignments({
        ...pendingAssignments,
        [facultyId]: currentPending.filter((id) => id !== externalId),
      });
    } else {
      // Add external
      setPendingAssignments({
        ...pendingAssignments,
        [facultyId]: [...currentPending, externalId],
      });
    }
  };

  // Remove an external from a faculty assignment
  const handleRemoveExternal = async (facultyId, externalId) => {
    try {
      setLoading(true);
      const currentExternals = assignments[facultyId]?.assigned_externals || [];
      const updatedIds = currentExternals
        .filter((ext) => ext.external_id !== externalId)
        .map((ext) => ext.external_id);

      const external_assignments = {
        [facultyId]: updatedIds,
      };

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/assign-externals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_assignments }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove external reviewer");

      // Refresh assignments
      const refreshRes = await fetch(`${import.meta.env.VITE_BASE_URL}/external-assignments`);
      if (!refreshRes.ok) throw new Error("Failed to refresh assignment data");
      const refreshData = await refreshRes.json();
      setAssignments(refreshData.data || {});

      toast.success("External reviewer removed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to remove external reviewer");
    } finally {
      setLoading(false);
    }
  };

  const getAssignedExternalDetails = (internalId) => {
    return assignments[internalId]?.assigned_externals || [];
  };

  // Submit updated assignments for the selected faculty
  const submitAssignments = async () => {
    if (!selectedInternalFaculty) return;
    setLoading(true);
    try {
      const facultyId = selectedInternalFaculty.id;
      const allExternalIds = pendingAssignments[facultyId] || [];

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/assign-externals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ external_assignments: { [facultyId]: allExternalIds } }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign faculty");

      // Refresh assignments
      const refreshRes = await fetch(`${import.meta.env.VITE_BASE_URL}/external-assignments`);
      if (!refreshRes.ok) throw new Error("Failed to refresh assignment data");
      const refreshData = await refreshRes.json();
      setAssignments(refreshData.data || {});

      toast.success("Faculty assignments updated successfully");
      closeModal();
    } catch (error) {
      toast.error(error.message || "Failed to update assignments");
    } finally {
      setLoading(false);
    }
  };

  // Filter externalList in modal to exclude already assigned externals (except pending ones)
  const filteredExternalsForModal = () => {
    if (!selectedInternalFaculty) return [];
    const facultyId = selectedInternalFaculty.id;
    const assignedIds = assignments[facultyId]?.assigned_externals?.map((ext) => ext.external_id) || [];
    const pendingIds = pendingAssignments[facultyId] || assignedIds;

    // Show all externals that are either in pending or not assigned yet
    return externalList.filter(
      (ext) => pendingIds.includes(ext.id) || !assignedIds.includes(ext.id)
    );
  };

  // Filter internal faculty based on search query for modal
  const searchFilteredExternals = filteredExternalsForModal().filter(
    (ext) =>
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ext.organization || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Assign External to Faculties</h1>
          <p className="text-indigo-100 text-sm">Manage External assignments for each faculty</p>
        </div>

        <div className="p-6">
          {loading && internalFacultyList.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-500">Loading faculty List...</p>
            </div>
          ) : internalFacultyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No faculty members available. Please add internal faculty first.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {internalFacultyList.map((internal) => {
                const assignedExternal = getAssignedExternalDetails(internal.id);
                return (
                  <div
                    key={internal.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Internal Faculty Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{internal.name}</h3>
                        <p className="text-sm text-gray-600">
                          {internal.designation} • {internal.department}
                        </p>
                      </div>
                      <div className="flex gap-3">

                        {
                          internal.review_status === "completed" ?
                            (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                <CheckCircle size={14} className="mr-1" />
                                Completed
                              </span>
                            ) :
                            internal.isExternalsFinal ? (
                              console.log("internal", internal),
                              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                <CheckCircle size={14} className="mr-1" />
                                Freezed
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => openAssignModal(internal)}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 transition-colors"
                                >
                                  <UserPlus size={16} />
                                  <span>Assign External</span>
                                </button>
                                <button
                                  onClick={() => handleFreezeExternal(internal.id)}
                                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md flex items-center gap-2 transition-colors"
                                  title="Freeze externals"
                                >
                                  <Lock size={16} />
                                  <span>Freeze</span>
                                </button>
                              </>
                            )
                        }
                        {internal.isDirectorMarksGiven ? (
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                              <CheckCircle size={14} className="mr-1" />
                              Marks : {internal.directorMarks} / 100
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/director-evaluate/${internal.id}`, {
                                state: { faculty: internal, department: internal.department },
                              })
                            }
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2 transition-colors"
                            title="Evaluate faculty"
                          >
                            <FileText size={16} />
                            <span>Evaluate</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Assigned External List */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Assigned External Members
                      </h4>
                      {assignedExternal.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">
                          No external members assigned yet
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {assignedExternal.map((external) => (
                            <li
                              key={external.external_id}
                              className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex items-center">
                                <User size={16} className="text-gray-500 mr-2" />
                                <span className="text-gray-800">
                                  {external.reviewer_info.full_name}
                                </span>
                              </div>
                              {
                                internal.isExternalsFinal ? null : (
                                  <button
                                    onClick={() =>
                                      handleRemoveExternal(internal.id, external.external_id)
                                    }
                                    className="text-red-600 hover:text-red-800"
                                    title="Remove assignment"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )
                              }
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

      {/* Modal */}
      {modalOpen && selectedInternalFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="bg-indigo-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Assign External to {selectedInternalFaculty.name}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {selectedInternalFaculty.designation} at{" "}
                  {selectedInternalFaculty.department || "Not specified"}
                </p>
              </div>
              <button onClick={closeModal} className="text-white hover:text-indigo-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              <div className="mb-4 relative">
                <Search size={18} className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search external by name or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="animate-spin text-blue-600" size={24} />
                </div>
              ) : (
                <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-gray-600">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredExternalsForModal().length > 0 &&
                              filteredExternalsForModal().every((ext) =>
                                (pendingAssignments[selectedInternalFaculty.id] || []).includes(
                                  ext.id
                                )
                              )
                            }
                            onChange={() => {
                              const allSelected = filteredExternalsForModal().every((ext) =>
                                (pendingAssignments[selectedInternalFaculty.id] || []).includes(ext.id)
                              );
                              if (allSelected) {
                                setPendingAssignments({
                                  ...pendingAssignments,
                                  [selectedInternalFaculty.id]: [],
                                });
                              } else {
                                setPendingAssignments({
                                  ...pendingAssignments,
                                  [selectedInternalFaculty.id]: filteredExternalsForModal().map(
                                    (ext) => ext.id
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2">Select All</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-gray-600">Employee ID</th>
                      <th className="px-6 py-3 text-gray-600">Name</th>
                      <th className="px-6 py-3 text-gray-600">Organization</th>
                      <th className="px-6 py-3 text-gray-600">Designation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchFilteredExternals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                          No externals found
                        </td>
                      </tr>
                    ) : (
                      searchFilteredExternals.map((external) => {
                        const isAssigned = (pendingAssignments[selectedInternalFaculty.id] || []).includes(
                          external.id
                        );
                        return (
                          <tr
                            key={external.id}
                            className={`border-b ${isAssigned ? "bg-gray-50 opacity-70" : "hover:bg-gray-50"}`}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleAssignExternal(external.id)}
                                disabled={loading}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                              />
                            </td>
                            <td className="px-6 py-4">{external.id || "N/A"}</td>
                            <td className="px-6 py-4 font-medium">{external.name}</td>
                            <td className="px-6 py-4">{external.organization || "N/A"}</td>
                            <td className="px-6 py-4">{external.designation || "N/A"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

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
    </div>
  );
};

export default AssignExternal;
