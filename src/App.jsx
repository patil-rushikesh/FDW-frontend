import React, { useState, useEffect } from "react";
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
import { Menu, Verified } from "lucide-react";
import LoginPage from "./components/LoginPage";
import SplashScreen from "./components/SplashScreen";
import TeachingPerformance from "./components/forms/TempTeachingPerfomance";
// import TeachingPerformanceWithProvider from "./components/forms/TeachingPerformance";
import FacultyAdminPanel from "./components/adminpage/FacultyAdminPanel";
import SelfDevelopment from "./components/forms/SelfDevelopment";
import Research from "./components/forms/Research";
import Portfolio from "./components/forms/Portfolio";
import Dashboard from "./components/forms/Dashboard";
import SubmissionStatus from "./components/forms/SubmissionStatus";
import Review from "./components/forms/review";
import VerificationTeam from "./components/adminpage/VerificationTeam";
import AddFaculty from "./components/adminpage/AddFaculty";
import FacultyList from "./components/adminpage/FacultyList";
import FacultyFormsList from "./components/HOD/FacultyFormsList"; // Import the component

import HODverify from "./components/HOD/HODverify";
import HODcnfverify from "./components/HOD/ConfirmVerify";
import VerificationPanel from "./components/HOD/VerificationPanel";
import Verify from "./components/Verification/Verify";
import VerificationForm from "./components/Verification/VerificationForm";
import AssociateDeansList from "./components/Dean/AssociateDeansList";
import DeanEvaluationForm from "./components/Dean/DeanEvaluationForm";
// Import the new component
import AddExternalFaculty from "./components/HOD/AddExternalFaculty";
// Import the new component
import AssignFacultyToExternal from "./components/HOD/AssignFacultyToExternal";
// Import the external dashboard component
import ExternalDashboard from "./components/External/ExternalDashboard";
import Extra from "./components/forms/Extra";
import EvaluateFacultyPage from "./components/External/EvaluateFacultyPage";
import AssignFacultyToVerificationTeam from "./components/adminpage/AssignFacultyToVerificationTeam";
import AssignDeanToDepartment from "./components/adminpage/AssignDeanToDepartment";
import Interactionmarks from "./components/Dean/Interactionmarks";
import Interactionevaluation from "./components/Dean/Interactionevaluation";

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
  const { isAuthenticated, userRole } = useAuth(); // Make sure you get userRole from your auth context
  const [showSplash, setShowSplash] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3500); // Show splash screen for 3.5 seconds

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (showSplash && !isAuthenticated) {
    return <SplashScreen />;
  }

  return (
    <FormProvider>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && userRole !== "external" && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <div
          className={
            isAuthenticated && userRole !== "external" ? "lg:ml-64" : ""
          }
        >
          {isAuthenticated && (
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
          )}
          <main className={isAuthenticated ? "p-4 lg:p-6 mt-16" : ""}>
            {isAuthenticated ? (
              <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-4 lg:p-6">
                <Routes>
                  <Route path="/login" element={<Navigate to="/dashboard" />} />
                  <Route
                    path="/submission-status"
                    element={<SubmissionStatus />}
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
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
                        <Research />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/selfdevelopment"
                    element={
                      <ProtectedRoute>
                        <SelfDevelopment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <ProtectedRoute>
                        <Portfolio />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/extra"
                    element={
                      <ProtectedRoute>
                        <Extra />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/review"
                    element={
                      <ProtectedRoute>
                        <Review />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/faculty-forms-list"
                    element={
                      <ProtectedRoute>
                        <FacultyFormsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hodverify"
                    element={
                      <ProtectedRoute>
                        <HODverify />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hodcnfverify"
                    element={
                      <ProtectedRoute>
                        <HODcnfverify />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dean/associate-dean-list"
                    element={
                      <ProtectedRoute>
                        <AssociateDeansList />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/dean-evaluation/:department/:facultyId"
                    element={
                      <ProtectedRoute>
                        <DeanEvaluationForm />
                      </ProtectedRoute>
                    }
                  />
                    <Route
                      path="/dean/give-interaction-marks"
                      element={
                        <ProtectedRoute>
                          <Interactionmarks/>
                        </ProtectedRoute>
                      }
                    />

                  <Route
                    path="/dean-evaluate/:facultyId"
                    element={
                      <ProtectedRoute>
                        <Interactionevaluation/>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/paper-verification/givemarks/:department/:facultyId"
                    element={
                      <ProtectedRoute>
                        <VerificationForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/department-review"
                    element={
                      <ProtectedRoute>
                        <VerificationPanel />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/paper-verification/verify"
                    element={
                      <ProtectedRoute>
                        <Verify />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/add-external-faculty"
                    element={
                      <ProtectedRoute>
                        <AddExternalFaculty />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/assign-faculty-external"
                    element={
                      <ProtectedRoute>
                        <AssignFacultyToExternal />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/external/give-marks"
                    element={
                      <ProtectedRoute>
                        <ExternalDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/evaluate-faculty/:facultyId"
                    element={
                      <ProtectedRoute>
                        <EvaluateFacultyPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route path="/" element={<Navigate to="/profile" />} />
                </Routes>
              </div>
            ) : (
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/add-faculty" element={<AddFaculty />} />
                <Route path="/admin/faculty-list" element={<FacultyList />} />
                <Route
                  path="/admin/verification-team"
                  element={<VerificationTeam />}
                />
                <Route
                  path="/admin/assign-faculty-to-verification-team"
                  element={<AssignFacultyToVerificationTeam />}
                />
                <Route
                  path="/admin/assign-dean-to-department"
                  element={<AssignDeanToDepartment/>}
                />
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/add-faculty" />}
                />
                <Route path="" element={<FacultyFormsList />} />
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
