import React from 'react';

export default function PrescriptionList({ items }) {
  if (!items || items.length === 0) return <p>No prescriptions</p>;

  return (
    <ul>
      {items.map((p) => (
        <li key={p.id}>
          {p.medicines} — {p.notes} ({p.doctor_name})
        </li>
      ))}
    </ul>
  );
}
