import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import TeachingPerformance from "./components/forms/TeachingPerformance";
import ResearchPublications from "./components/forms/ResearchPublications";
import Profile from "./components/profile/Profile"
import { FormProvider } from "./context/FormContext";
import { Menu } from "lucide-react";
import LoginPage from "./components/LoginPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <FormProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:ml-64">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-4 lg:p-6 mt-16">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/teaching" element={<TeachingPerformance />} />
                  <Route path="/research" element={<ResearchPublications />} />
                  <Route path="/profile" element={<Profile/>} />
                  {/* Add other routes as components are created */}
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </FormProvider>
  );
}

export default App;
