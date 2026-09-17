import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import ImportStudents from "../pages/ImportStudents";
import Leads from "../pages/Leads";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
// future integration
// import Analytics from '../pages/Analytics';
// import Applications from '../pages/Applications';
// import Universities from '../pages/Universities';
// import Placeholder from '../pages/Placeholder';
// import StudentList from '../pages/StudentList';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute> <Students /> </ProtectedRoute>} />
      <Route path="/importstudents" element={<ProtectedRoute> <ImportStudents /> </ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* // future integration */}
      {/* <Route path="/applications" element={<Applications />} /> */}
      {/* <Route path="/universities" element={<Universities />} /> */}
      {/* <Route path="/leads" element={<Leads />} /> */}
      {/* 
      <Route path="/finance" element={<Placeholder title="Finance & Revenue" />} />
      <Route path="/reports" element={<Analytics />} />
      <Route path="/settings" element={<Placeholder title="Settings" />} />
      <Route path="/learning" element={<Placeholder title="Learning Resources" />} />
      <Route path="/search-program" element={<Placeholder title="Search Program" />} />
      <Route path="/prm" element={<Placeholder title="Partner Relationship Management" />} />
      <Route path="/allied" element={<Placeholder title="Allied Services" />} />
      <Route path="/test-prep" element={<Placeholder title="Test Preparation" />} /> */}
    </Routes>
  );
}
