import React from 'react';
import { BookOpen, FileText, Building2, GraduationCap, User, CheckSquare, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: BookOpen, label: "Part A: Academic Involvment", path: "/teaching" },
  {
    icon: FileText,
    label: "Part B: Research and Developmen",
    path: "/research",
  },
  {
    icon: Building2,
    label: "Part C: Self Development",
    path: "/administrative",
  },
  {
    icon: GraduationCap,
    label: "Part D: Portfolio-Departmental & Central",
    path: "/development",
  },
  { icon: CheckSquare, label: "Final Review", path: "/review" },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-indigo-800 text-white z-40
        transform transition-transform duration-300 ease-in-out
        w-64 overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Faculty Appraisal</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-full lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}