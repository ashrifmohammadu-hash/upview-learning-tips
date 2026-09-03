import React, { useState } from 'react';
import { login } from '../services/api';
import { Link } from 'react-router-dom';

function AuthorLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.access_token);
      
      const payload = JSON.parse(atob(data.access_token.split('.')[1]));
      localStorage.setItem('role', payload.role);
      
      onLoginSuccess(payload.role);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '50px auto', padding: '30px', backgroundColor: '#1e1e1e', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)', textAlign: 'center', border: '1px solid #333' }}>
      <img src="/logo.png" alt="Logo" style={{ width: '80px', marginBottom: '20px', borderRadius: '8px' }} />
      <h2 style={{ marginTop: 0, marginBottom: '25px', color: '#fff', fontWeight: '500' }}>Author & Reviewer Login</h2>
      
      {error && <div style={{ color: '#ff6b6b', marginBottom: 15, fontSize: '14px', backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="author@example.com" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: '#fff', boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 25 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '14px' }}>Password</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px', paddingRight: '60px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#2a2a2a', color: '#fff', boxSizing: 'border-box', outline: 'none' }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '5px', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold' }}>{showPassword ? "HIDE" : "SHOW"}</button>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#ff5722', color: 'white', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '16px' }}>Login</button>
        </div>
      </form>
      <div style={{marginTop: '20px', fontSize: '14px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <div>Don't have an account? <Link to="/author/register" style={{color: '#ff5722', textDecoration: 'none'}}>Register as Author</Link></div>
        <div>Are you a Reviewer? <Link to="/reviewer/login" style={{color: '#ff5722', textDecoration: 'none'}}>Go to Reviewer Login</Link></div>
      </div>
    </div>
  );
}

export default AuthorLogin;
