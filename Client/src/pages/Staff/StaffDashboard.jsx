import React, { useState } from "react";
import "./StaffDashboard.css";

const API = "http://localhost:5000/staff";

export default function StaffDashboard() {
  const token = localStorage.getItem("token");

  // assign bed + nurse
  const [assignData, setAssignData] = useState({
    patient_mobile: "",
    bed_id: "",
    nurse_id: "",
  });
  const [assignMsg, setAssignMsg] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // discharge
  const [dischargeId, setDischargeId] = useState("");
  const [dischargeMsg, setDischargeMsg] = useState("");
  const [dischargeLoading, setDischargeLoading] = useState(false);

  const onAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!token) {
      setAssignMsg("Please login as staff to perform this action.");
      return;
    }
    setAssignLoading(true);
    setAssignMsg("");

    fetch(`${API}/assign-bed-nurse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_mobile: assignData.patient_mobile,
        bed_id: Number(assignData.bed_id),
        nurse_id: Number(assignData.nurse_id),
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAssignMsg(data.error);
        } else {
          setAssignMsg(data.message || "Bed and nurse assigned successfully");
          setAssignData({ patient_mobile: "", bed_id: "", nurse_id: "" });
        }
      })
      .catch(() => setAssignMsg("Error assigning bed and nurse"))
      .finally(() => setAssignLoading(false));
  };

  const handleDischarge = (e) => {
    e.preventDefault();
    if (!token) {
      setDischargeMsg("Please login as staff to perform this action.");
      return;
    }
    setDischargeLoading(true);
    setDischargeMsg("");

    fetch(`${API}/discharge-patient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ admission_id: Number(dischargeId) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setDischargeMsg(data.error);
        } else {
          setDischargeMsg(data.message || "Patient discharged and bed marked for cleaning");
          setDischargeId("");
        }
      })
      .catch(() => setDischargeMsg("Error discharging patient"))
      .finally(() => setDischargeLoading(false));
  };

  if (!token) {
    return (
      <div className="staff-page">
        <h2>Staff Dashboard</h2>
        <p>Please login as staff to access this page.</p>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <h2>Staff Dashboard</h2>
      <p className="staff-subtitle">
        Assign beds and nurses to admitted patients and discharge patients when treatment is complete.
      </p>

      {/* Assign bed + nurse */}
      <div className="staff-card">
        <h3>Assign Bed &amp; Nurse</h3>
        {assignMsg && <div className="staff-message">{assignMsg}</div>}
        <form className="staff-form" onSubmit={handleAssign}>
          <label>
            Patient Mobile
            <input
              type="text"
              name="patient_mobile"
              value={assignData.patient_mobile}
              onChange={onAssignChange}
              placeholder="Patient contact number"
              required
            />
          </label>
          <label>
            Bed ID
            <input
              type="number"
              name="bed_id"
              value={assignData.bed_id}
              onChange={onAssignChange}
              placeholder="Available bed ID"
              required
            />
          </label>
          <label>
            Nurse ID
            <input
              type="number"
              name="nurse_id"
              value={assignData.nurse_id}
              onChange={onAssignChange}
              placeholder="Nurse ID"
              required
            />
          </label>
          <button type="submit" disabled={assignLoading}>
            {assignLoading ? "Assigning..." : "Assign Bed & Nurse"}
          </button>
        </form>
        <p className="staff-hint">
          System will verify patient admission, bed availability and nurse capacity (max 5 active patients).
        </p>
      </div>

      {/* Discharge patient */}
      <div className="staff-card">
        <h3>Discharge Patient</h3>
        {dischargeMsg && <div className="staff-message">{dischargeMsg}</div>}
        <form className="staff-form" onSubmit={handleDischarge}>
          <label>
            Admission ID
            <input
              type="number"
              value={dischargeId}
              onChange={e => setDischargeId(e.target.value)}
              placeholder="Admission record ID"
              required
            />
          </label>
          <button type="submit" disabled={dischargeLoading}>
            {dischargeLoading ? "Discharging..." : "Discharge & Mark Bed Cleaning"}
          </button>
        </form>
      </div>
    </div>
  );
}
