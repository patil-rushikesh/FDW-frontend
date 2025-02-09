import React from "react";
import { Link } from "react-router-dom";
import { Bell, Settings, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
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
          <h1 className=" ml-5 text-lg lg:text-xl font-semibold text-gray-800 truncate">
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
            <img
              src="https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 hidden lg:inline">
              Dr. John Doe
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
