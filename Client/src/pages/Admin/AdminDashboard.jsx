import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000/admin";

const ROLES = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "staff", label: "Staff" },
  { value: "pharmacy", label: "Pharmacy" },
];

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const [activeRole, setActiveRole] = useState("doctor");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // form state for create / edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    dept_id: "",
  });

  useEffect(() => {
    if (!token) return;
    fetchUsers(activeRole);
  }, [activeRole, token]);

  const fetchUsers = (role) => {
    setLoading(true);
    setMessage("");
    fetch(`${API}/users/${role}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => setMessage("Error loading users"))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      password: "",
      specialization: "",
      dept_id: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    setMessage("");
    const body = {
      name: form.name || undefined,
      email: form.email || undefined,
      password: form.password || undefined,
      role: activeRole,
      additionalInfo:
        activeRole === "doctor"
          ? {
              specialization: form.specialization || null,
              dept_id: form.dept_id || null,
            }
          : undefined,
    };

    const url = editingId ? `${API}/users/${editingId}` : `${API}/users`;
    const method = editingId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage(data.message || "Saved successfully");
          fetchUsers(activeRole);
          resetForm();
        }
      })
      .catch(() => setMessage("Error saving user"));
  };

  const handleEditClick = (u) => {
    setEditingId(u.id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      specialization: u.specialization || "",
      dept_id: u.dept_id || "",
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this user?")) return;
    setMessage("");
    fetch(`${API}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(data.error);
        else {
          setMessage(data.message || "User deleted");
          setUsers(prev => prev.filter(u => u.id !== id));
        }
      })
      .catch(() => setMessage("Error deleting user"));
  };

  if (!token) {
    return (
      <div className="admin-page">
        <h2>Admin Dashboard</h2>
        <p>Please login as an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <p className="admin-subtitle">
        Manage hospital users: doctors, nurses, staff, and pharmacy accounts.
      </p>

      {/* Role tabs */}
      <div className="admin-role-tabs">
        {ROLES.map(r => (
          <button
            key={r.value}
            className={
              "admin-role-tab" +
              (activeRole === r.value ? " active" : "")
            }
            onClick={() => {
              setActiveRole(r.value);
              resetForm();
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div className="admin-card">
        <h3>{editingId ? "Edit User" : "Create New User"}</h3>
        <form className="admin-form" onSubmit={handleCreateOrUpdate}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleFormChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleFormChange}
            required={!editingId}
          />
          <input
            type="password"
            name="password"
            placeholder={editingId ? "New Password (optional)" : "Password"}
            value={form.password}
            onChange={handleFormChange}
            required={!editingId}
          />

          {activeRole === "doctor" && (
            <>
              <input
                type="text"
                name="specialization"
                placeholder="Specialization"
                value={form.specialization}
                onChange={handleFormChange}
              />
              <input
                type="number"
                name="dept_id"
                placeholder="Department ID"
                value={form.dept_id}
                onChange={handleFormChange}
              />
            </>
          )}

          <div className="admin-form-actions">
            <button type="submit">
              {editingId ? "Update User" : "Create User"}
            </button>
            {editingId && (
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <div className="admin-message">{message}</div>}
      </div>

      {/* Users table */}
      <div className="admin-card">
        <h3>{ROLES.find(r => r.value === activeRole)?.label} List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users for this role.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                {activeRole === "doctor" && <th>Specialization</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  {activeRole === "doctor" && (
                    <td>{u.specialization || "-"}</td>
                  )}
                  <td>
                    <button
                      className="admin-small-btn"
                      onClick={() => handleEditClick(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-small-btn admin-danger"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
