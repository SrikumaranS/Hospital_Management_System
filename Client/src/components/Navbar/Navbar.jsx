import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ isLoggedIn, role, onLogout }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userName");
    if (storedUser) setUserName(storedUser);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    if (onLogout) onLogout();
    setMenuOpen(false);
    navigate("/");
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="hm-navbar">
      <div className="hm-logo" onClick={() => navigate("/")}>
        Hospital<span>Care</span>
      </div>
      <div className="hm-links">
        <button className="hm-link-btn" onClick={() => scrollToId("home-section")}>
          Home
        </button>
        <button className="hm-link-btn" onClick={() => scrollToId("appointment-section")}>
          Appointment
        </button>
        <button className="hm-link-btn" onClick={() => scrollToId("prescription-section")}>
          Prescription
        </button>
        <button className="hm-link-btn" onClick={() => scrollToId("about-section")}>
          About Us
        </button>

        {/* Right side: login OR user menu */}
        {!isLoggedIn && (
          <button
            className="hm-link-btn hm-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

        {isLoggedIn && role === "patient" && (
          <div className="hm-user-menu" ref={menuRef}>
            <button
              className="hm-link-btn hm-user-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {userName || "My Account"} ▾
            </button>
            {menuOpen && (
              <div className="hm-user-dropdown">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
