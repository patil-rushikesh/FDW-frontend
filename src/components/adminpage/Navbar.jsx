import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData'));
    if (user) {
      setUserData(user);
    }
  }, []);

  return (
    <div className="h-16 bg-white shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-20">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full lg:hidden"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          <h1 className="ml-5 text-lg lg:text-xl font-semibold text-gray-800 truncate">
            Faculty Performance Evaluation
          </h1>
        </div>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Settings size={20} className="text-gray-600" />
          </button>
          <Link
            to="/profile"
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {userData?.name?.split(' ').map(word => word[0]).join('').toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden lg:inline">
              {userData?.name || 'User'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}