import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ImportStudents from "./pages/ImportStudents";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";

import ProtectedRoute from "./routes/ProtectedRoute";
import AuthLoading from "./components/ui/AuthLoading";
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

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 1024
  );

  const [collapsed, setCollapsed] = useState(isMobile);

  const wasMobile = useRef(isMobile);

  useEffect(() => {
    const handleResize = () => {
      const nowMobile = window.innerWidth < 1024;
      setIsMobile(nowMobile);

      if (wasMobile.current !== nowMobile) {
        wasMobile.current = nowMobile;
        setCollapsed(nowMobile);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ||
    (location.pathname.startsWith("/students/") ? "Student Details" : "Dashboard");

  const contentMargin = isMobile
    ? "ml-0"
    : collapsed
      ? "ml-[78px]"
      : "ml-[220px]";

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      <div
        className={`flex flex-col min-h-screen min-w-0 transition-all duration-300 ${contentMargin}`}
      >
        <Navbar
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hadSession = useRef(null);
  if (loading) return <AuthLoading />;

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