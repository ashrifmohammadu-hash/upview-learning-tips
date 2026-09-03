import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import AuthorDashboard from './pages/AuthorDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (token && storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setRole(null);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header className="app-header">
        <h1 className="header-title">Upview Learning Tips</h1>
        {role && (
          <div className="header-auth">
            <span style={{ marginRight: '15px' }}>Logged in as: <strong>{role}</strong></span>
            <button onClick={handleLogout} style={{ backgroundColor: '#d9534f' }}>Logout</button>
          </div>
        )}
      </header>

      <main style={{ marginTop: '20px' }}>
        {!role && <Login onLoginSuccess={setRole} />}
        {role === 'author' && <AuthorDashboard />}
        {role === 'reviewer' && <ReviewerDashboard />}
      </main>
    </div>
  );
}

export default App;
