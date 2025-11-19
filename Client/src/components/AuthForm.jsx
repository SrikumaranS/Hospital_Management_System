import React, { useState } from 'react';
import Card from './Card';

export default function AuthForm({ role, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handle = (e) => {
    e.preventDefault();
    onSubmit({ email, password, role });
  };

  return (
    <Card title={`${role.charAt(0).toUpperCase() + role.slice(1)} Login`}>
      <form onSubmit={handle}>
        <input
          className="form-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="form-field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn" type="submit">Login</button>
      </form>
    </Card>
  );
}
