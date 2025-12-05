import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import LoginPortal from "./pages/LoginPortal/LoginPortal";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import NurseDashboard from "./pages/Nurse/NurseDashboard";
import StaffDashboard from "./pages/Staff/StaffDashboard";

function AppShell() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    if (t) setToken(t);
    if (r) setRole(r);
  }, []);

  return (
    <>
      <Navbar
        isLoggedIn={!!token}
        role={role}
        onLogout={() => {
          setToken("");
          setRole("");
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <LoginPortal
              onLoginSuccess={(tok) => {
                setToken(tok);
                localStorage.setItem("token", tok);
                localStorage.setItem("role", user.role);
                localStorage.setItem("userName", user.name);
              }}
            />
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/nurse" element={<NurseDashboard />} />
        <Route path="/staff" element={<StaffDashboard />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
