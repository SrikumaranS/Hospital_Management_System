import React, { useState, useEffect } from "react";
import "./PatientDashboard.css";

// Change API to your backend
const API = "http://localhost:5000";

export default function PatientDashboard({ token }) {
  const [doctorId, setDoctorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const lastPrescription = prescriptions.length > 0 ? prescriptions[0] : null;

  useEffect(() => {
    fetch(`${API}/patient/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(() => setAppointments([]));
    fetch(`${API}/patient/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPrescriptions(data))
      .catch(() => setPrescriptions([]));
  }, [token, bookingMsg]);

  function handleBook(e) {
    e.preventDefault();
    setBookingMsg("");
    fetch(`${API}/patient/appointment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctor_id: doctorId,
        dept_id: departmentId,
        appointment_time: appointmentTime,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBookingMsg(data.message || data.error || "");
      });
  }

  // Replace with fetch for real backend doctor/department
  const doctorOptions = [
    { id: 1, name: "Dr. Sharma" },
    { id: 2, name: "Dr. Gupta" },
  ];
  const departmentOptions = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Orthopedics" },
  ];

  return (
    <div className="patient-dashboard-container">
      <h2>Patient Dashboard</h2>
      <section>
        <h3>Book Appointment</h3>
        <form className="appointment-book-form" onSubmit={handleBook}>
          <select required value={doctorId} onChange={e => setDoctorId(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctorOptions.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
          <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
            <option value="">Select Department</option>
            {departmentOptions.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.name}</option>
            ))}
          </select>
          <input required type="datetime-local" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} />
          <button type="submit">Book</button>
        </form>
        {bookingMsg && (<div className="booking-msg" style={{color: bookingMsg.includes('success') ? "#318a56" : "#d32f2f"}}>{bookingMsg}</div>)}
      </section>

      <section>
        <h3>Your Appointments</h3>
        <table className="patient-dashboard-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Token</th>
              <th>Status</th>
              <th>Doctor</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>No appointments found.</td>
              </tr>
            ) : (
              appointments.map(app => (
                <tr key={app.id || app.appointment_id}>
                  <td>{formatDate(app.appointment_time)}</td>
                  <td>{app.token_number}</td>
                  <td>{app.status}</td>
                  <td>{app.doctor_name}</td>
                  <td>{app.department}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Prescription History</h3>
        {prescriptions.length === 0 ? <p>No prescriptions yet.</p> : (
          <ul className="prescription-list">
            {prescriptions.map(pres => (
              <li key={pres.id}>
                <b>Medicines:</b> {pres.medicines}<br />
                <b>Notes:</b> {pres.notes}<br />
                <b>Doctor:</b> {pres.doctor_name} ({pres.specialization})<br />
                <b>Date:</b> {formatDate(pres.created_at)}
              </li>
            ))}
          </ul>
        )}
        {lastPrescription && (
          <div className="last-prescription">
            <h4>Last Prescription</h4>
            <div><b>Doctor:</b> {lastPrescription.doctor_name} | <b>Dept:</b> {lastPrescription.specialization}</div>
            <div><b>Medicines:</b> {lastPrescription.medicines}</div>
            <div><b>Notes:</b> {lastPrescription.notes}</div>
            <div><b>Date:</b> {formatDate(lastPrescription.created_at)}</div>
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch { return dt; }
}
