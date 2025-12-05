import React, { useState } from "react";
import "./NurseDashboard.css";

const API = "http://localhost:5000/nurse";

export default function NurseDashboard() {
  const token = localStorage.getItem("token");
  const [bedId, setBedId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setMessage("Please login as a nurse to perform this action.");
      return;
    }
    if (!bedId) {
      setMessage("Enter bed ID.");
      return;
    }
    setLoading(true);
    setMessage("");

    fetch(`${API}/mark-bed-available`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bed_id: Number(bedId) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message || "Bed marked as available");
          setBedId("");
        }
      })
      .catch(() => setMessage("Error updating bed status"))
      .finally(() => setLoading(false));
  };

  if (!token) {
    return (
      <div className="nurse-page">
        <h2>Nurse Dashboard</h2>
        <p>Please login as a nurse to access this page.</p>
      </div>
    );
  }

  return (
    <div className="nurse-page">
      <h2>Nurse Dashboard</h2>
      <p className="nurse-subtitle">
        Mark cleaned beds as available so they can be assigned to new patients.
      </p>

      {message && <div className="nurse-message">{message}</div>}

      <div className="nurse-card">
        <h3>Mark Bed Available</h3>
        <form className="nurse-form" onSubmit={handleSubmit}>
          <label>
            Bed ID
            <input
              type="number"
              value={bedId}
              onChange={e => setBedId(e.target.value)}
              placeholder="Enter bed ID in cleaning status"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Mark as Available"}
          </button>
        </form>
        <p className="nurse-hint">
          Only beds currently in <b>cleaning</b> status can be updated.
        </p>
      </div>
    </div>
  );
}
