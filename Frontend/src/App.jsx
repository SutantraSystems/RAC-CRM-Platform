import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ImportStudents from "./pages/ImportStudents";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";

import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
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
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

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
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
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