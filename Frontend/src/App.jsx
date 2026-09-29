import React, { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ImportStudents from "./pages/ImportStudents";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDetails from "./pages/StudentDetails";
// future integration
// '/applications': 'Applications',
// '/universities': 'Universities',
// '/finance': 'Finance & Revenue',
// '/reports': 'Analytics & Reports',
// '/settings': 'Settings',
// '/learning': 'Learning Resources',
// '/search-program': 'Search Program',
// '/prm': 'Partner Management',
// '/allied': 'Allied Services',
// '/test-prep': 'Test Preparation',

const pageTitles = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/importstudents": "Import Students",
  "/profile": "My Profile",

};


const CRMLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pageTitle =pageTitles[location.pathname] ||
    (location.pathname.startsWith("/students/") ? "Student Details" : "Dashboard");

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Sidebar collapsed={collapsed} />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "ml-[78px]" : "ml-[220px]"
          }`}
      >
        <Navbar
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Login / register pages: if a session ALREADY existed when the page opened
// (e.g. reopening the browser on /login), go straight to the app.
// A login done on this page is not redirected here, so Login can show its
// success toast and then navigate by itself.
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hadSession = useRef(null);

  if (loading) return <div>Loading...</div>;

  if (hadSession.current === null) {
    hadSession.current = isAuthenticated;
  }

  if (hadSession.current) return <Navigate to="/dashboard" replace />;

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT REDIRECT */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}
        />

        <Route
          path="/register"
          element={<PublicOnlyRoute><Register /></PublicOnlyRoute>}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* PROTECTED CRM ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CRMLayout>
                <Dashboard />
              </CRMLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <CRMLayout>
                <Students />
              </CRMLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/importstudents"
          element={
            <ProtectedRoute>
              <CRMLayout>
                <ImportStudents />
              </CRMLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <CRMLayout>
                <Profile />
              </CRMLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id"
          element={
            <ProtectedRoute>
              <CRMLayout>
                <StudentDetails />
              </CRMLayout>
            </ProtectedRoute>
          }
        />

        {/* CATCH-ALL (unknown routes) */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;