import React from "react";
import { NavLink } from "react-router-dom";
import { UserPlus, Users, UserCheck, X, Building, LogOut } from "lucide-react";

const AdminSidebar = ({ isOpen, onClose }) => {
  const navLinks = [
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
      name: "Verification Team",
      path: "/admin/verification-team",
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      name: "Assign Faculty to Verification Team",
      path: "/admin/assign-faculty-to-verification-team",
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      name: "Assign Dean To Department",
      path: "/admin/assign-dean-to-department",
      icon: <Building className="w-6 h-6" />,
    },
  ];

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('adminToken'); // Remove admin token
    window.location.href = '/login'; // Redirect to login page
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
            <h2 className="text-2xl font-bold tracking-tight">
              Admin Panel
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-full lg:hidden transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-4 rounded-lg mb-3 transition-all
                  hover:scale-[1.02] transform
                  ${
                    isActive
                      ? "bg-indigo-700 text-white shadow-lg"
                      : "text-indigo-100 hover:bg-indigo-700/70"
                  }`
                }
              >
                {link.icon}
                <span className="text-base font-medium">{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Logout button at bottom of sidebar */}
        <div className="p-6 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center text-sm font-medium"
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