import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="nav">
      <div className="brand">Hospital Management</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/doctor">Doctor</Link>
        <Link to="/nurse">Nurse</Link>
        <Link to="/staff">Staff</Link>
        <Link to="/patient">Patient</Link>
      </div>
    </nav>
  );
}
