import React, { useState } from "react";
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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
];

const finalNavItems = [
  { icon: CheckSquare, label: "Final Review", path: "/review" },
];

const hodPrivilegeItems = [
  {
    icon: ClipboardCheck,
    label: "Department Faculty Forms",
    path: "/hod/faculty-forms",
  },
  { icon: Users, label: "Verification Panal", path: "/hod/department-review" },
];

const directorPrivilegeItems = [
  {
    icon: ClipboardCheck,
    label: "All Faculty Forms",
    path: "/director/faculty-forms",
  },
  {
    icon: CheckSquare,
    label: "Final Approval",
    path: "/director/final-approval",
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [isPartsOpen, setIsPartsOpen] = useState(false);
  const [isPrivilegeOpen, setIsPrivilegeOpen] = useState(false);

  // Get user role from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userRole = userData.role?.toLowerCase() || "faculty";

  const toggleParts = () => setIsPartsOpen(!isPartsOpen);
  const togglePrivilege = () => setIsPrivilegeOpen(!isPrivilegeOpen);

  const NavLink = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={() => onClose()}
        className={`
          flex items-center space-x-4 p-4 rounded-lg mb-3 transition-all
          hover:scale-[1.02] transform
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
    if (userRole !== "hod" && userRole !== "director") return null;

    const privilegeItems =
      userRole === "hod" ? hodPrivilegeItems : directorPrivilegeItems;
    const sectionTitle =
      userRole === "hod" ? "HOD Privileges" : "Director Privileges";

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
          <div className="ml-4">
            {privilegeItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
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
          w-72 overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Faculty Appraisal
              </h2>
              {userRole !== "faculty" && (
                <p className="text-sm text-indigo-200 mt-1">
                  {userRole.toUpperCase()} Dashboard
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-full lg:hidden transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <nav>
            {/* Dashboard */}
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}

            {/* Parts Dropdown */}
            <div className="mb-3">
              <button
                onClick={toggleParts}
                className="w-full flex items-center justify-between p-4 rounded-lg text-indigo-100 hover:bg-indigo-700/70"
              >
                <div className="flex items-center space-x-4">
                  <FileText size={24} strokeWidth={2} />
                  <span className="text-base font-medium">Appraisal Form</span>
                </div>
                {isPartsOpen ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>

              {isPartsOpen && (
                <div className="ml-4">
                  {partsNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Privilege Section for HOD/Director */}
            {renderPrivilegeSection()}

            {/* Final Review */}
            {finalNavItems.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}