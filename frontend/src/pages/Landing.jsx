import React from 'react';
import { Link, Navigate } from 'react-router-dom';

function Landing({ role }) {
  if (role === 'author') return <Navigate to="/author/dashboard" />;
  if (role === 'reviewer') return <Navigate to="/reviewer/dashboard" />;

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <img src="/logo.png" alt="Logo" style={{ width: '100px', marginBottom: '30px' }} />
      <h1 style={{ color: '#fff', marginBottom: '40px' }}>Upview Learning Tips</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Link to="/author/login" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', padding: '15px', fontSize: '18px' }}>I am an Author</button>
        </Link>
        <Link to="/reviewer/login" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', padding: '15px', fontSize: '18px', backgroundColor: '#333' }}>I am a Reviewer</button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
