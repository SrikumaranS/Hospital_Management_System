import React, { useState } from "react";

const API = "http://localhost:5000";

export default function AppointmentSection() {
  const token = localStorage.getItem("token");
  const [doctorId, setDoctorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");

  const doctorOptions = [
    { id: 1, name: "Dr. Sharma" },
    { id: 2, name: "Dr. Gupta" },
  ];
  const departmentOptions = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Orthopedics" },
  ];

  const handleBook = (e) => {
    e.preventDefault();
    if (!token) {
      setBookingMsg("Please login as patient to book an appointment.");
      return;
    }
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
      .then(res => res.json())
      .then(data => setBookingMsg(data.message || data.error || ""))
      .catch(() => setBookingMsg("Error booking appointment"));
  };

  return (
    <section id="appointment-section" className="home-section">
      <h2>Book Appointment</h2>

      {!token && (
        <p style={{ color: "#b03b00", marginBottom: "10px" }}>
          Please login as a patient from the navbar to book an appointment.
        </p>
      )}

      <form className="appointment-book-form" onSubmit={handleBook}>
        <select
          required
          value={doctorId}
          onChange={e => setDoctorId(e.target.value)}
          disabled={!token}
        >
          <option value="">Select Doctor</option>
          {doctorOptions.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>
        <select
          required
          value={departmentId}
          onChange={e => setDepartmentId(e.target.value)}
          disabled={!token}
        >
          <option value="">Select Department</option>
          {departmentOptions.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        <input
          required
          type="datetime-local"
          value={appointmentTime}
          onChange={e => setAppointmentTime(e.target.value)}
          disabled={!token}
        />
        <button type="submit" disabled={!token}>Book</button>
      </form>

      {bookingMsg && (
        <div
          className="booking-msg"
          style={{ color: bookingMsg.includes("success") ? "#318a56" : "#d32f2f" }}
        >
          {bookingMsg}
        </div>
      )}
    </section>
  );
}
