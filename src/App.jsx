import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import AdminSidebar from "./components/adminpage/AdminSidebar";
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
import Review from "./components/forms/Review";
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
import AddExternal from "./components/Director/AddExternal";
// Import the new component
import AssignFacultyToExternal from "./components/HOD/AssignFacultyToExternal";
import AssignExternal from "./components/Director/AssignExternal";
// Import the external dashboard component

import CollegeExternalDashboard from "./components/CollegeExternal/CollegeExternalDashboard";
import Extra from "./components/forms/Extra";
import EvaluateFacultyPage from "./components/External/EvaluateFacultyPage";
import EvaluateAuthoritiesPage from "./components/CollegeExternal/EvaluateAuthoritiesPage";
import AssignFacultyToVerificationTeam from "./components/adminpage/AssignFacultyToVerificationTeam";
import HODForms from "./components/Director/HODForms";
import DeanForms from "./components/Director/DeanForms";
import FacultyForms from "./components/Director/FacultyForms";
import AssignDeanToDepartment from "./components/adminpage/AssignDeanToDepartment";
import Interactionmarks from "./components/Dean/Interactionmarks";
import Interactionevaluation from "./components/Dean/Interactionevaluation";
import HODInteractionEvaluation from "./components/HOD/HODInteractionEvaluation";
import DirectorInteractionEvaluation from "./components/Director/DirectorInteractionEvaluation";
import FinalMarks from "./components/HOD/FinalMarks";
import ConfirmDirectorVerify from "./components/Director/ConfirmVerifybyDirector";
import DirectorVerify from "./components/Director/DirectorVerify";
import ResetPassword from "./components/ResetPassword";
// Add this to your routes configuration
import Summary from "./components/adminpage/Summary";
import AdminDashboard from "./components/adminpage/AdminDashboard";
import ExternalDashboard from "./components/External/ExternalDashboard";

// Protected Route component
// eslint-disable-next-line react/prop-types
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
  const [showSplash, setShowSplash] = useState(!isAuthenticated);
  
  // Get user data from localStorage to check role
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userRole = userData.role;
  const isAdmin = userRole === "Admin";

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
        {isAuthenticated && (
          isAdmin ? (
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          ) : (
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          )
        )}
        <div
          className={
            !isAuthenticated ? "" : (  userRole !== "external" ? "lg:ml-72" : "lg:ml-72")
          }
        >
          {isAuthenticated && (
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
          )}
          <main className={isAuthenticated ? "p-4 lg:p-6 mt-16" : ""}>
            {isAuthenticated ? (
              <div className="w-full">
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
                    path="/hod/final-marks"
                    element={
                      <ProtectedRoute>
                        <FinalMarks />
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
                        <Interactionmarks />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dean-evaluate/:facultyId"
                    element={
                      <ProtectedRoute>
                        <Interactionevaluation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod-evaluate/:facultyId"
                    element={
                      <ProtectedRoute>
                        <HODInteractionEvaluation />
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
                  <Route
                    path="/director/hod-forms"
                    element={
                      <ProtectedRoute>
                        <HODForms />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/director/dean-forms"
                    element={
                      <ProtectedRoute>
                        <DeanForms />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/director/faculty-forms"
                    element={
                      <ProtectedRoute>
                        <FacultyForms />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ConfirmVerifybyDirector"
                    element={
                      <ProtectedRoute>
                        <ConfirmDirectorVerify />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/DirectorVerify"
                    element={
                      <ProtectedRoute>
                        <DirectorVerify />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/director/add-external"
                    element={
                      <ProtectedRoute>
                        <AddExternal />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/director/assign-external"
                    element={
                      <ProtectedRoute>
                        <AssignExternal />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/director-evaluate/:facultyId"
                    element={
                      <ProtectedRoute>
                        <DirectorInteractionEvaluation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/director/external/give-marks"
                    element={
                      <ProtectedRoute>
                        <CollegeExternalDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/evaluate-authority/:facultyId"
                    element={
                      <ProtectedRoute>
                        <EvaluateAuthoritiesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Admin Routes */}
                  <Route
                    path="/admin/add-faculty"
                    element={
                      <ProtectedRoute>
                        <AddFaculty />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/faculty-list"
                    element={
                      <ProtectedRoute>
                        <FacultyList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/summary"
                    element={
                      <ProtectedRoute>
                        <Summary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/verification-team"
                    element={
                      <ProtectedRoute>
                        <VerificationTeam />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/assign-faculty-to-verification-team"
                    element={
                      <ProtectedRoute>
                        <AssignFacultyToVerificationTeam />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/assign-dean-to-department"
                    element={
                      <ProtectedRoute>
                        <AssignDeanToDepartment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
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