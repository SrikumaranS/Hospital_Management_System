import React from 'react';

export default function Button({ children, onClick, secondary }) {
  const className = 'btn' + (secondary ? ' secondary' : '');
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
