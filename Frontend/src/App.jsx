import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";
import AppRoutes from "./routes/AppRoutes";

const pageTitles = {
  "/": "Dashboard",
  "/students": "Students",
  "/leads": "Leads Pipeline",
  "/importstudents": "Import Students",
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
};

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "EduCRM";

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: collapsed ? "64px" : "224px" }}
      >
        <Navbar
          onToggleSidebar={() => setCollapsed((c) => !c)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto pt-2 px-4 pb-4">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
