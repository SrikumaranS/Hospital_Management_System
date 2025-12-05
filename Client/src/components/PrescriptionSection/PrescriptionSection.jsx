import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function PrescriptionSection() {
  const token = localStorage.getItem("token");
  const [prescriptions, setPrescriptions] = useState([]);

  const lastPrescription = prescriptions.length > 0 ? prescriptions[0] : null;

  useEffect(() => {
    if (!token) {
      setPrescriptions([]);
      return;
    }
    fetch(`${API}/patient/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPrescriptions(Array.isArray(data) ? data : []))
      .catch(() => setPrescriptions([]));
  }, [token]);

  const formatDate = (dt) => {
    if (!dt) return "-";
    try {
      return new Date(dt).toLocaleString();
    } catch {
      return dt;
    }
  };

  return (
    <section id="prescription-section" className="home-section">
      <h2>Prescription History</h2>
      {!token && <p>Please login as patient to view your prescriptions.</p>}
      {token && prescriptions.length === 0 && <p>No prescriptions yet.</p>}
      {token && prescriptions.length > 0 && (
        <>
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
          {lastPrescription && (
            <div className="last-prescription">
              <h4>Last Prescription</h4>
              <div><b>Doctor:</b> {lastPrescription.doctor_name} | <b>Dept:</b> {lastPrescription.specialization}</div>
              <div><b>Medicines:</b> {lastPrescription.medicines}</div>
              <div><b>Notes:</b> {lastPrescription.notes}</div>
              <div><b>Date:</b> {formatDate(lastPrescription.created_at)}</div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
