import React from 'react';

export default function AppointmentList({ items }) {
  if (!items || items.length === 0) return <p>No appointments</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Doctor</th>
          <th>Department</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((a) => (
          <tr key={a.appointment_id || a.id}>
            <td>{a.appointment_time || a.time}</td>
            <td>{a.doctor_name || a.doctor}</td>
            <td>{a.department || a.dept?.name}</td>
            <td>{a.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
