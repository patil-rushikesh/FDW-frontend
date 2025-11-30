import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user) setUserData(user);
  }, []);

  return (
    <div className="flex-1 p-6 pt-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Welcome back,
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800 mt-1">
                {userData?.name || "Faculty"}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <svg
                  className="w-5 h-5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-base">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="w-28 h-28 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow">
              <img
                src={logo}
                alt="Logo"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="border-l-4 border-indigo-500 pl-4 mb-6">
            <h2 className="text-2xl font-bold text-indigo-700">
              Faculty Performance Evaluation System
            </h2>
            <p className="text-gray-600 mt-2">
              Streamline and enhance your faculty performance evaluation. Showcase
              your academic achievements and professional growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-indigo-50 text-center">
              <h3 className="text-lg font-semibold text-indigo-700 mb-1">
                Track Progress
              </h3>
              <p className="text-gray-600 text-sm">
                Monitor your academic and research activities throughout the year.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 text-center">
              <h3 className="text-lg font-semibold text-purple-700 mb-1">
                Document Achievements
              </h3>
              <p className="text-gray-600 text-sm">
                Record and showcase your professional accomplishments.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-50 text-center">
              <h3 className="text-lg font-semibold text-indigo-700 mb-1">
                Grow Together
              </h3>
              <p className="text-gray-600 text-sm">
                Contribute to the institution&apos;s academic excellence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;