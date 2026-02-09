import React, { useState, useEffect } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  UserPlus,
  Users,
  UserCheck,
  X,
  Building,
  LogOut,
  ChevronDown,
  ChevronRight,
  BarChart2,
} from "lucide-react";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Add state for dropdowns
  const [isManageFacultyOpen, setIsManageFacultyOpen] = useState(false);
  const [isVerificationTeamOpen, setIsVerificationTeamOpen] = useState(false);

  // Group nav links into categories for dropdowns
  const facultyLinks = [
    {
      name: "Add Faculty",
      path: "/admin/add-faculty",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      name: "Faculty List",
      path: "/admin/faculty-list",
      icon: <Users className="w-6 h-6" />,
    },
    {
      name: "Summary",
      path: "/admin/summary",
      icon: <BarChart2 className="w-6 h-6" />,
    },
  ];

  const verificationLinks = [
    {
      name: "Verification Team",
      path: "/admin/verification-team",
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      name: "Assign Faculty to Verification Team",
      path: "/admin/assign-faculty-to-verification-team",
      icon: <UserCheck className="w-6 h-6" />,
    },
  ];

  const otherLinks = [
    {
      name: "Assign Dean To Department",
      path: "/admin/assign-dean-to-department",
      icon: <Building className="w-6 h-6" />,
    },
  ];

  // Auto-open dropdown menus based on current path when component mounts
  useEffect(() => {
    const currentPath = location.pathname;

    // Check if current path is in faculty links
    if (facultyLinks.some((link) => link.path === currentPath)) {
      setIsManageFacultyOpen(true);
    }

    // Check if current path is in verification links
    if (verificationLinks.some((link) => link.path === currentPath)) {
      setIsVerificationTeamOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Toggle functions for dropdowns
  const toggleManageFaculty = () =>
    setIsManageFacultyOpen(!isManageFacultyOpen);
  const toggleVerificationTeam = () =>
    setIsVerificationTeamOpen(!isVerificationTeamOpen);

  // NavLink component for consistent styling
  const NavLink = ({ item, isDropdownItem }) => {
    const isActive = location.pathname === item.path;

    return (
      <RouterNavLink
        to={item.path}
        className={`
          flex items-center space-x-4 p-4 rounded-lg
          transition-all duration-300 ease-in-out
          hover:scale-[1.02] transform relative
          ${
            isDropdownItem
              ? `
                border-l-2 border-indigo-500 pl-6
                before:content-[""]
                before:absolute
                before:left-1/2
                before:top-1/2
                before:w-4
                before:h-[2px]
                before:bg-indigo-500
                before:transform
                before:-translate-x-1/2
                before:-translate-y-1/2
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
        {item.icon}
        <span className="text-base font-medium">{item.name}</span>
      </RouterNavLink>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-screen bg-indigo-800 text-white z-40
          transform transition-all duration-300 ease-in-out
          w-72 overflow-y-auto flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 flex-grow">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-full lg:hidden transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {/* Faculty Management Dropdown */}
            <div className="mb-3">
              <button
                onClick={toggleManageFaculty}
                className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <Users size={24} strokeWidth={2} />
                  <span className="text-base font-medium">Manage Faculty</span>
                </div>
                <div className="transition-transform duration-300 ease-in-out">
                  {isManageFacultyOpen ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
              </button>

              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isManageFacultyOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <div
                  className={`
                  relative pl-4 mt-2 flex flex-col items-center
                  before:content-[""]
                  before:absolute
                  before:left-1/2
                  before:top-0
                  before:bottom-4
                  before:w-[2px]
                  before:bg-indigo-500
                  before:transform
                  before:-translate-x-1/2
                  space-y-2
                `}
                >
                  {facultyLinks.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      isDropdownItem={true}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Team Dropdown */}
            <div className="mb-3">
              <button
                onClick={toggleVerificationTeam}
                className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <UserCheck size={24} strokeWidth={2} />
                  <span className="text-base font-medium">
                    Verification Team
                  </span>
                </div>
                <div className="transition-transform duration-300 ease-in-out">
                  {isVerificationTeamOpen ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
              </button>

              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isVerificationTeamOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
              >
                <div
                  className={`
                  relative pl-4 mt-2 flex flex-col items-center
                  before:content-[""]
                  before:absolute
                  before:left-1/2
                  before:top-0
                  before:bottom-4
                  before:w-[2px]
                  before:bg-indigo-500
                  before:transform
                  before:-translate-x-1/2
                  space-y-2
                `}
                >
                  {verificationLinks.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      isDropdownItem={true}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Other links without dropdowns */}
            {otherLinks.map((item) => (
              <NavLink key={item.path} item={item} isDropdownItem={false} />
            ))}
          </nav>
        </div>

        {/* Updated logout button styling to match Sidebar.jsx */}
        <div className="p-6 mt-auto border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-indigo-700 text-white rounded-lg hover:bg-red-600 flex items-center justify-center text-sm font-medium transition-colors duration-200"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
