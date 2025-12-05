// src/pages/LoginPortal/LoginPortal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPortal.css';

const API = "http://localhost:5000/auth"; // backend base for auth

export default function LoginPortal({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('patient');
  const [activeForm, setActiveForm] = useState('login');

  // Employee state
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empMessage, setEmpMessage] = useState("");

  // Patient state
  const [patName, setPatName] = useState("");
  const [patContact, setPatContact] = useState("");
  const [patDOB, setPatDOB] = useState("");
  const [patGender, setPatGender] = useState("male");
  const [patAddress, setPatAddress] = useState("");
  const [patEmail, setPatEmail] = useState("");
  const [patPassword, setPatPassword] = useState("");
  const [patMessage, setPatMessage] = useState("");
  const [animating, setAnimating] = useState(false);

  function switchTab(newTab) {
    if (newTab === tab) return;
    setAnimating(true);
    setTimeout(() => {
      setTab(newTab);
      if (newTab === 'employee') setActiveForm('login');
      setAnimating(false);
    }, 200);
  }

 // in LoginPortal.jsx
function handleEmployeeLogin(e) {
  e.preventDefault();
  setEmpMessage("");
  fetch(`${API}/employee/login`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: empEmail, password: empPassword }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        setEmpMessage("Login successful");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("userName", data.user.name);
        if (onLoginSuccess) onLoginSuccess(data.token, data.user);

        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          // later: route doctor/nurse/staff to their pages
          navigate("/");
        }
      } else {
        setEmpMessage(data.error || "Login failed");
      }
    })
    .catch(() => setEmpMessage("Error logging in"));
}


  function handlePatientLogin(e) {
  e.preventDefault();
  setPatMessage("");
  fetch(`${API}/patient/login`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: patEmail, password: patPassword }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        setPatMessage("Login successful");
        if (onLoginSuccess) onLoginSuccess(data.token, data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user?.role || "patient");
        if (data.user?.name) {
          localStorage.setItem("userName", data.user.name);
        }
        navigate("/");
      } else {
        setPatMessage(data.error || "Login failed");
      }
    })
    .catch(() => setPatMessage("Error logging in"));
}


  function handlePatientSignup(e) {
    e.preventDefault();
    setPatMessage("");
    fetch(`${API}/patient/register`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: patName,
        email: patEmail,
        password: patPassword,
        dob: patDOB,
        gender: patGender,
        address: patAddress,
        contact: patContact
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setPatMessage(data.message);
          setActiveForm("login");
        } else {
          setPatMessage(data.error || "Signup failed");
        }
      })
      .catch(() => setPatMessage("Error during signup"));
  }

  return (
    <div className="portal-bg">
      <div className="portal-card">
        <div className="portal-tabs">
          <button
            className={`portal-tab${tab === 'patient' ? " active" : ""}`}
            onClick={() => switchTab('patient')}
          >
            Patient
          </button>
          <button
            className={`portal-tab${tab === 'employee' ? " active" : ""}`}
            onClick={() => switchTab('employee')}
          >
            Employee
          </button>
        </div>
        <div className={`portal-forms${animating ? " animating" : ""}`}>
          <div className={`portal-form-slide${tab === "patient" ? " show" : ""}`}>
            <PatientForm
              formType={activeForm}
              setFormType={setActiveForm}
              values={{
                patName, setPatName,
                patContact, setPatContact,
                patDOB, setPatDOB,
                patGender, setPatGender,
                patAddress, setPatAddress,
                patEmail, setPatEmail,
                patPassword, setPatPassword,
                patMessage, setPatMessage,
              }}
              onLogin={handlePatientLogin}
              onSignup={handlePatientSignup}
            />
          </div>
          <div className={`portal-form-slide${tab === "employee" ? " show" : ""}`}>
            <EmployeeForm
              email={empEmail}
              setEmail={setEmpEmail}
              password={empPassword}
              setPassword={setEmpPassword}
              message={empMessage}
              onLogin={handleEmployeeLogin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeForm({ email, setEmail, password, setPassword, message, onLogin }) {
  return (
    <form className="portal-form" onSubmit={onLogin}>
      <div className="portal-title">Employee Login</div>
      <input
        className="portal-field"
        type="email"
        autoComplete="username"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        className="portal-field"
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button className="portal-btn" type="submit">Login</button>
      {message && <div className="portal-msg portal-err">{message}</div>}
    </form>
  );
}

function PatientForm({ formType, setFormType, values, onLogin, onSignup }) {
  const {
    patName, setPatName,
    patContact, setPatContact,
    patDOB, setPatDOB,
    patGender, setPatGender,
    patAddress, setPatAddress,
    patEmail, setPatEmail,
    patPassword, setPatPassword,
    patMessage, setPatMessage
  } = values;

  return (
    <form className="portal-form" onSubmit={formType === "login" ? onLogin : onSignup}>
      <div className="portal-title">
        {formType === "login" ? "Patient Login" : "Patient Signup"}
      </div>
      {formType === "signup" && (
        <>
          <input
            className="portal-field"
            type="text"
            placeholder="Name"
            value={patName}
            onChange={e => setPatName(e.target.value)}
            required
          />
          <input
            className="portal-field"
            type="text"
            placeholder="Mobile"
            value={patContact}
            onChange={e => setPatContact(e.target.value)}
            required
          />
          <input
            className="portal-field"
            type="date"
            placeholder="DOB"
            value={patDOB}
            onChange={e => setPatDOB(e.target.value)}
            required
          />
          <select
            className="portal-field"
            value={patGender}
            onChange={e => setPatGender(e.target.value)}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            className="portal-field"
            type="text"
            placeholder="Address"
            value={patAddress}
            onChange={e => setPatAddress(e.target.value)}
            required
          />
        </>
      )}
      <input
        className="portal-field"
        type="email"
        autoComplete="username"
        placeholder="Email"
        value={patEmail}
        onChange={e => setPatEmail(e.target.value)}
        required
      />
      <input
        className="portal-field"
        type="password"
        autoComplete={formType === "login" ? "current-password" : "new-password"}
        placeholder="Password"
        value={patPassword}
        onChange={e => setPatPassword(e.target.value)}
        required
      />
      <button className="portal-btn" type="submit">
        {formType === "login" ? "Login" : "Sign Up"}
      </button>

      {formType === "login" && (
        <div className="portal-toggle-signup">
          <span style={{ color: "#176F85" }}>Don't have an account?</span>
          <button
            type="button"
            className="portal-create-acc-btn"
            onClick={() => { setFormType('signup'); setPatMessage(""); }}
          >
            Sign up
          </button>
        </div>
      )}

      {patMessage && (
        <div
          className={
            "portal-msg " +
            (patMessage.includes("success") || patMessage.includes("registered")
              ? "portal-success"
              : "portal-err")
          }
        >
          {patMessage}
        </div>
      )}

      {formType === "signup" && (
        <div className="portal-toggle-signup">
          <button
            type="button"
            className="portal-create-acc-btn"
            style={{ color: "#176F85" }}
            onClick={() => { setFormType('login'); setPatMessage(""); }}
          >
            Back to Login
          </button>
        </div>
      )}
    </form>
  );
}
