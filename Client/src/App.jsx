import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPortal from './pages/LoginPortal/LoginPortal';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';

export default function App() {
  // This token would generally be handled with context or localStorage for persistent logins
  const [token, setToken] = useState(localStorage.getItem('token') || "");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <LoginPortal onLoginSuccess={(tok) => {
            setToken(tok);
            localStorage.setItem('token', tok); // persist for refresh
          }} />
        } />
        <Route path="/patient-dashboard" element={
          <PatientDashboard token={token} />
        } />
        <Route path="*" element={
          token ? <PatientDashboard token={token} /> : <LoginPortal onLoginSuccess={tok => { setToken(tok); localStorage.setItem('token', tok);} } />
        } />
      </Routes>
    </BrowserRouter>
  );
}
