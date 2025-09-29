import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, Menu } from "lucide-react";

export default function Navbar({ onMenuClick, showMenuButton = true }) {
  const [userData, setUserData] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user && user.dept && user._id) {
      setUserData(user);
      fetchUserStatus(user.dept, user._id);
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
        return "bg-green-100 text-green-800";
      case "Interaction_pending":
        return "bg-purple-100 text-purple-800";
      case "authority_verification_pending":
        return "bg-yellow-100 text-yellow-800";
      case "verification_pending":
        return "bg-orange-100 text-orange-800";
      case "Portfolio_Mark_pending":
        return "bg-blue-100 text-blue-800";
      case "Portfolio_Mark_Dean_pending":
        return "bg-indigo-100 text-indigo-800";
      case "SentToDirector":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Only show menu button if showMenuButton is true */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
        )}
        <h1 className="ml-80 text-lg lg:text-xl font-semibold text-gray-800 truncate">
          Faculty Performance Evaluation
        </h1>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings size={20} className="text-gray-600" />
          </button>
          <div
            className="relative"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <Link
              to="/profile"
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {userData?.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden lg:inline">
                {userData?.name || "User"}
              </span>
            </Link>

            {/* Profile dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">
                    {userData?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{userData?.mail}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {statusLoading ? (
                    <div className="h-6 w-full bg-gray-200 animate-pulse rounded-full"></div>
                  ) : userStatus ? (
                    <div
                      className={`inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColorClass(userStatus)}`}
                    >
                      {userStatus.replace(/_/g, " ")}
                    </div>
                  ) : (
                    <div className="inline-block min-w-[140px] text-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                      Unknown
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
