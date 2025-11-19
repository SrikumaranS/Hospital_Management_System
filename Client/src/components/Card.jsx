import React from 'react';

export default function Card({ children, title }) {
  return (
    <section className="card">
      {title && <h3 className="section-title">{title}</h3>}
      {children}
    </section>
  );
}
