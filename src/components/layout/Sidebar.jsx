import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Building2,
  GraduationCap,
  User,
  CheckSquare,
  X,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Users,
  Award,
  LogOut, // Added LogOut icon import
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook

const mainNavItems = [{ icon: User, label: "Dashboard", path: "/dashboard" }];

const partsNavItems = [
  { icon: BookOpen, label: "Part A: Academic Involvment", path: "/teaching" },
  {
    icon: FileText,
    label: "Part B: Research and Development",
    path: "/research",
  },
  {
    icon: Building2,
    label: "Part C: Self Development",
    path: "/selfdevelopment",
  },
  {
    icon: GraduationCap,
    label: "Part D: Portfolio-Departmental & Central",
    path: "/portfolio",
  },
  {
    icon: Award,
    label: "Part E: Extra-ordinary Contribution",
    path: "/extra",
  },
];

const finalNavItems = [
  { icon: CheckSquare, label: "Final Review", path: "/review" },
];

const hodPrivilegeItems = [
  {
    icon: ClipboardCheck,
    label: "Department Faculty Forms",
    path: "/hod/faculty-forms-list", // Changed path here
  },
  {
    icon: Award,
    label: "Final Marks",
    path: "/hod/final-marks",
  },
];

const directorPrivilegeItems = [
  {
    icon: Users,
    label: "HOD Forms",
    path: "/director/hod-forms",
  },
  {
    icon: Award,
    label: "Dean Forms",
    path: "/director/dean-forms",
  },
  {
    icon: ClipboardCheck,
    label: "Faculty Forms",
    path: "/director/faculty-forms",
  },
];
const directorInteractionItems = [
  {
    icon: Users,
    label: "Add External",
    path: "/director/add-external",
  },
  {
    icon: Users,
    label: "Assign External",
    path: "/director/assign-external",
  },
];
// Add this after hodPrivilegeItems
const hodInteractionItems = [
  {
    icon: Users,
    label: "Add External Faculty",
    path: "/hod/add-external-faculty",
  },
  {
    icon: Users,
    label: "Assign Faculty to External",
    path: "/hod/assign-faculty-external",
  },
];

// Add this after directorPrivilegeItems
const deanPrivilegeItems = [
  {
    icon: ClipboardCheck,
    label: "Associate Dean List",
    path: "/dean/associate-dean-list",
  },
];

// Add conditional rendering for the Dean interaction marks item
const getDeanPrivilegeItems = (isAddedForInteraction) => {
  const items = [...deanPrivilegeItems];

  if (isAddedForInteraction) {
    items.push({
      icon: Award,
      label: "Give Interaction Marks",
      path: "/dean/give-interaction-marks",
    });
  }

  return items;
};

const paperVerificationItems = [
  { icon: ClipboardCheck, label: "Verify", path: "/paper-verification/verify" },
];

// Updated external faculty items function to handle different paths based on ID
const getExternalFacultyItems = (userId) => {
  const dashboardItem = { icon: User, label: "Dashboard", path: "/dashboard" };

  // Check if the user ID starts with "EXTPCCO"
  const giveMarksPath =
    userId && userId.startsWith("EXTPCCO")
      ? "/director/external/give-marks"
      : "/external/give-marks";

  const giveMarksItem = {
    icon: Award,
    label: "Give Marks",
    path: giveMarksPath,
  };

  return [dashboardItem, giveMarksItem];
};

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate hook
  const { logout } = useAuth(); // Add useAuth hook
  const [isPartsOpen, setIsPartsOpen] = useState(false);
  const [isPrivilegeOpen, setIsPrivilegeOpen] = useState(false);
  const [isPaperVerificationOpen, setIsPaperVerificationOpen] = useState(false);
  const [isHodInteractionOpen, setIsHodInteractionOpen] = useState(false); // Separate state for HOD
  const [isDirectorInteractionOpen, setIsDirectorInteractionOpen] =
    useState(false); // Separate state for Director
  const [userStatus, setUserStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Get user role from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userRole = userData.desg?.toLowerCase() || "faculty";
  const isInVerificationPanel = userData.isInVerificationPanel || false;
  const isExternal = userData.isExternal || false;
  const isAddedForInteraction = userData.isAddedForInteraction || false;
  const userId = userData._id || userData.id || ""; // Get the user ID

  useEffect(() => {
    if (userData && userData.dept && userData._id) {
      fetchUserStatus(userData.dept, userData._id);
    }
  }, []);

  const fetchUserStatus = async (department, userId) => {
    // Validate inputs before making API call
    if (!department || !userId) {
      console.warn("Missing department or userId for status fetch");
      setStatusLoading(false);
      return;
    }

    setStatusLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/${department}/${userId}/get-status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUserStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "done":
        return "bg-green-500 text-white";
      case "Interaction_pending":
        return "bg-purple-500 text-white";
      case "authority_verification_pending":
        return "bg-yellow-500 text-white";
      case "verification_pending":
        return "bg-orange-500 text-white";
      case "Portfolio_Mark_pending":
        return "bg-blue-500 text-white";
      case "Portfolio_Mark_Dean_pending":
        return "bg-indigo-500 text-white";
      case "SentToDirector":
        return "bg-teal-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const toggleParts = () => setIsPartsOpen(!isPartsOpen);
  const togglePrivilege = () => setIsPrivilegeOpen(!isPrivilegeOpen);
  const togglePaperVerification = () =>
    setIsPaperVerificationOpen(!isPaperVerificationOpen);
  const toggleHodInteraction = () =>
    setIsHodInteractionOpen(!isHodInteractionOpen);
  const toggleDirectorInteraction = () =>
    setIsDirectorInteractionOpen(!isDirectorInteractionOpen);

  // Add handleLogout function
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 1. Update the NavLink component with improved line styling
  const NavLink = ({ item, isActive, isDropdownItem }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={() => onClose()}
        className={`
          flex items-center space-x-4 p-4 rounded-lg transition-all
          hover:scale-[1.02] transform relative
          ${
            isDropdownItem
              ? `
                ml-4 border-l-2 border-indigo-500 pl-6
                before:content-[""]
                before:absolute
                before:left-[-1.5rem]
                before:top-1/2
                before:w-4
                before:h-[2px]
                before:bg-indigo-500
              `
              : ""
          }
          ${
            isActive
              ? "bg-indigo-700 text-white shadow-lg"
              : "text-indigo-100 hover:bg-indigo-700/70"
          }
        `}
      >
        <Icon size={24} strokeWidth={2} className="flex-shrink-0" />
        <span className="text-base font-medium">{item.label}</span>
      </Link>
    );
  };

  const renderPrivilegeSection = () => {
    if (userRole !== "hod" && userRole !== "director" && userRole !== "dean")
      return null;

    let privilegeItems;
    let sectionTitle;

    switch (userRole) {
      case "hod":
        privilegeItems = hodPrivilegeItems;
        sectionTitle = "HOD Privileges";
        break;
      case "director":
        privilegeItems = directorPrivilegeItems;
        sectionTitle = "Director Privileges";
        break;
      case "dean":
        // Use the function to get the dean items based on isAddedForInteraction
        privilegeItems = getDeanPrivilegeItems(
          userData.isAddedForInteraction || false
        );
        sectionTitle = "Dean Privileges";
        break;
      default:
        return null;
    }

    return (
      <div className="mb-3">
        <button
          onClick={togglePrivilege}
          className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70"
        >
          <div className="flex items-center space-x-4">
            <Users size={24} strokeWidth={2} />
            <span className="text-base font-medium">{sectionTitle}</span>
          </div>
          {isPrivilegeOpen ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        {isPrivilegeOpen && (
          <div
            className={`
            relative pl-4 mt-2
            before:content-[""]
            before:absolute
            before:left-0
            before:top-0
            before:bottom-4
            before:w-[2px]
            before:bg-indigo-500
            space-y-2
            transition-all
            duration-200
          `}
          >
            {privilegeItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                isDropdownItem={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPaperVerificationSection = () => {
    if (!isInVerificationPanel) return null;

    return (
      <div className="mb-3">
        <button
          onClick={togglePaperVerification}
          className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70"
        >
          <div className="flex items-center space-x-4">
            <ClipboardCheck size={24} strokeWidth={2} />
            <span className="text-base font-medium">Paper Verification</span>
          </div>
          {isPaperVerificationOpen ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        {isPaperVerificationOpen && (
          <div
            className={`
            relative pl-4 mt-2
            before:content-[""]
            before:absolute
            before:left-0
            before:top-0
            before:bottom-4
            before:w-[2px]
            before:bg-indigo-500
            space-y-2
            transition-all
            duration-200
          `}
          >
            {paperVerificationItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                isDropdownItem={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInteractionSection = () => {
    if (userRole !== "hod") return null;

    return (
      <div className="mb-3">
        <button
          onClick={toggleHodInteraction}
          className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70"
        >
          <div className="flex items-center space-x-4">
            <Users size={24} strokeWidth={2} />
            <span className="text-base font-medium">Interaction</span>
          </div>
          {isHodInteractionOpen ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        {isHodInteractionOpen && (
          <div
            className={`
              relative pl-4 mt-2
              before:content-[""]
              before:absolute
              before:left-0
              before:top-0
              before:bottom-4
              before:w-[2px]
              before:bg-indigo-500
              space-y-2
              transition-all
              duration-200
            `}
          >
            {hodInteractionItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                isDropdownItem={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDirectorInteractionSection = () => {
    if (userRole !== "director") return null;

    return (
      <div className="mb-3">
        <button
          onClick={toggleDirectorInteraction}
          className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70"
        >
          <div className="flex items-center space-x-4">
            <Users size={24} strokeWidth={2} />
            <span className="text-base font-medium">Interaction</span>
          </div>
          {isDirectorInteractionOpen ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        {isDirectorInteractionOpen && (
          <div
            className={`
              relative pl-4 mt-2
              before:content-[""]
              before:absolute
              before:left-0
              before:top-0
              before:bottom-4
              before:w-[2px]
              before:bg-indigo-500
              space-y-2
              transition-all
              duration-200
            `}
          >
            {directorInteractionItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
                isDropdownItem={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-screen bg-indigo-800 text-white z-40
          transform transition-transform duration-300 ease-in-out
          w-72 overflow-y-auto flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 flex-grow">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Faculty Appraisal
              </h2>
              {userRole !== "faculty" && (
                <p className="text-sm text-indigo-200 mt-1">
                  {isExternal ? "EXTERNAL FACULTY" : userRole.toUpperCase()}{" "}
                  Dashboard
                </p>
              )}

              {/* Status indicator */}
              {statusLoading ? (
                <div className="h-5 w-24 bg-indigo-700 animate-pulse rounded-full mt-2"></div>
              ) : userStatus ? (
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColorClass(userStatus)}`}
                >
                  <span className="w-2 h-2 bg-current rounded-full mr-1.5"></span>
                  {userStatus
                    .split("_")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </div>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-full lg:hidden transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Rest of the sidebar content */}
          <nav className="space-y-2">
            {/* For External Faculty: Show only Dashboard and Give Marks options */}
            {isExternal ? (
              getExternalFacultyItems(userId).map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))
            ) : (
              <>
                {/* Dashboard */}
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                  />
                ))}

                {/* Parts Dropdown - Hide for director */}
                {userRole !== "director" && (
                  <div className="mb-3">
                    <button
                      onClick={toggleParts}
                      className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70"
                    >
                      <div className="flex items-center space-x-4">
                        <FileText size={24} strokeWidth={2} />
                        <span className="text-base font-medium">
                          Appraisal Form
                        </span>
                      </div>
                      {isPartsOpen ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>

                    {isPartsOpen && (
                      <div
                        className={`
                        relative pl-4 mt-2
                        before:content-[""]
                        before:absolute
                        before:left-0
                        before:top-0
                        before:bottom-4
                        before:w-[2px]
                        before:bg-indigo-500
                        space-y-2
                        transition-all
                        duration-200
                      `}
                      >
                        {partsNavItems.map((item) => (
                          <NavLink
                            key={item.path}
                            item={item}
                            isActive={location.pathname === item.path}
                            isDropdownItem={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Privilege Section for HOD/Director */}
                {renderPrivilegeSection()}

                {/* Interaction Section for HOD */}
                {renderInteractionSection()}

                {/* Director Interaction Section */}
                {renderDirectorInteractionSection()}

                {/* Paper Verification Section */}
                {renderPaperVerificationSection()}

                {/* Final Review - Hide for director */}
                {userRole !== "director" &&
                  finalNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                    />
                  ))}
              </>
            )}
          </nav>
        </div>

        {/* Modify the logout button styling to better match the theme */}
        <div className="p-6 mt-auto border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-indigo-700 text-white rounded-lg hover:bg-red-600 flex items-center justify-center text-sm font-medium transition-colors"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
