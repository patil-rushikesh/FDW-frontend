import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";
import ResearchPublications from "./components/forms/ResearchPublications";
import Profile from "./components/profile/Profile";
import { FormProvider } from "./context/FormContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Menu } from "lucide-react";
import LoginPage from "./components/LoginPage";
import SplashScreen from "./components/SplashScreen";
import TeachingPerformance from "./components/forms/TempTeachingPerfomance";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <FormProvider>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <div className={isAuthenticated ? "lg:ml-64" : ""}>
          {isAuthenticated && (
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
          )}
          <main className={isAuthenticated ? "p-4 lg:p-6 mt-16" : ""}>
            {isAuthenticated ? (
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <Routes>
                  <Route path="/login" element={<Navigate to="/profile" />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/teaching"
                    element={
                      <ProtectedRoute>
                          <TeachingPerformance />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/research"
                    element={
                      <ProtectedRoute>
                        <ResearchPublications />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/profile" />} />
                </Routes>
              </div>
            ) : (
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<Navigate to="/login" />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </FormProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
