import React, { useEffect, useState } from "react";
import "./DoctorDashboard.css";

const API = "http://localhost:5000/doctor";

export default function DoctorDashboard() {
  const token = localStorage.getItem("token");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // prescription form state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: "",
    notes: "",
    medicines: "",
  });

  const fetchQueue = () => {
    if (!token) return;
    setLoading(true);
    setMsg("");
    fetch(`${API}/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setQueue(Array.isArray(data) ? data : []);
      })
      .catch(() => setMsg("Error loading appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, [token]);

  const updateStatus = (appointment_id, status) => {
    if (!token) return;
    setMsg("");
    fetch(`${API}/appointments/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointment_id, status }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMsg(data.error);
        } else {
          setMsg(data.message || "Status updated");
          // refresh queue
          fetchQueue();
        }
      })
      .catch(() => setMsg("Error updating status"));
  };

  const openPrescription = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionForm({
      patient_id: appointment.patient_id || "",
      notes: "",
      medicines: "",
    });
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionForm(prev => ({ ...prev, [name]: value }));
  };

  const submitPrescription = (e) => {
    e.preventDefault();
    if (!token || !selectedAppointment) return;
    setMsg("");
    fetch(`${API}/prescriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointment_id: selectedAppointment.appointment_id,
        patient_id: prescriptionForm.patient_id,
        notes: prescriptionForm.notes,
        medicines: prescriptionForm.medicines,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMsg(data.error);
        } else {
          setMsg(data.message || "Prescription created");
          setSelectedAppointment(null);
          setPrescriptionForm({ patient_id: "", notes: "", medicines: "" });
        }
      })
      .catch(() => setMsg("Error creating prescription"));
  };

  if (!token) {
    return (
      <div className="doctor-page">
        <h2>Doctor Dashboard</h2>
        <p>Please login as a doctor to access this page.</p>
      </div>
    );
  }

  return (
    <div className="doctor-page">
      <h2>Doctor Dashboard</h2>
      <p className="doctor-subtitle">
        View today&apos;s appointments, update status, and issue prescriptions.
      </p>

      {msg && <div className="doctor-message">{msg}</div>}

      <div className="doctor-card">
        <h3>Today&apos;s Queue</h3>
        {loading ? (
          <p>Loading...</p>
        ) : queue.length === 0 ? (
          <p>No appointments in queue.</p>
        ) : (
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
                <th>Update</th>
                <th>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(app => (
                <tr key={app.appointment_id}>
                  <td>{app.token_number}</td>
                  <td>{app.patient_name}</td>
                  <td>{new Date(app.appointment_time).toLocaleString()}</td>
                  <td>{app.status}</td>
                  <td>
                    <button
                      className="doc-small-btn"
                      onClick={() => updateStatus(app.appointment_id, "pending")}
                    >
                      Pending
                    </button>
                    <button
                      className="doc-small-btn"
                      onClick={() =>
                        updateStatus(app.appointment_id, "admitted")
                      }
                    >
                      Admitted
                    </button>
                    <button
                      className="doc-small-btn doc-leave"
                      onClick={() => updateStatus(app.appointment_id, "leave")}
                    >
                      Leave
                    </button>
                  </td>
                  <td>
                    <button
                      className="doc-small-btn doc-presc"
                      onClick={() => openPrescription(app)}
                    >
                      Create
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Prescription panel */}
      {selectedAppointment && (
        <div className="doctor-card">
          <h3>
            Prescription for {selectedAppointment.patient_name} (Token{" "}
            {selectedAppointment.token_number})
          </h3>
          <form className="doctor-prescription-form" onSubmit={submitPrescription}>
            <input
              type="text"
              name="patient_id"
              placeholder="Patient ID"
              value={prescriptionForm.patient_id}
              onChange={handlePrescriptionChange}
              required
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={prescriptionForm.notes}
              onChange={handlePrescriptionChange}
              required
            />
            <textarea
              name="medicines"
              placeholder="Medicines"
              value={prescriptionForm.medicines}
              onChange={handlePrescriptionChange}
              required
            />
            <div className="doctor-prescription-actions">
              <button type="submit">Save Prescription</button>
              <button
                type="button"
                className="doc-btn-secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
