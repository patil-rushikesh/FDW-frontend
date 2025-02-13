import React from "react";
import {
  BookOpen,
  FileText,
  Building2,
  GraduationCap,
  User,
  CheckSquare,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: User, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Part A: Academic Involvment", path: "/teaching" },
  {
    icon: FileText,
    label: "Part B: Research and Developmen",
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
            <h2 className="text-2xl font-bold tracking-tight">
              Faculty Appraisal
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-700 rounded-full lg:hidden transition-colors"
            >
              <X size={24} />
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
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
