import React from 'react';
import { Bell, Settings, Menu } from 'lucide-react';

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
          <h1 className="text-lg lg:text-xl font-semibold text-gray-800 truncate">
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
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 hidden lg:inline">Dr. John Doe</span>
          </div>
        </div>
      </div>
    </div>
  );
}