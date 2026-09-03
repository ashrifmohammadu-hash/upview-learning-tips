import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import AuthorLogin from './pages/AuthorLogin';
import ReviewerLogin from './pages/ReviewerLogin';
import AuthorRegister from './pages/AuthorRegister';
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
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh' }}>
        <header className="app-header">
          <h1 className="header-title">
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Upview Learning Tips</Link>
          </h1>
          {role && (
            <div className="header-auth">
              <span style={{ marginRight: '15px' }}>Logged in as: <strong>{role}</strong></span>
              <button onClick={handleLogout} style={{ backgroundColor: '#d9534f' }}>Logout</button>
            </div>
          )}
        </header>

        <main style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Landing role={role} />} />
            
            <Route path="/author/login" element={
              role === 'author' ? <Navigate to="/author/dashboard" /> : 
              role === 'reviewer' ? <Navigate to="/reviewer/dashboard" /> : 
              <AuthorLogin onLoginSuccess={setRole} />
            } />
            
            <Route path="/author/register" element={
              role === 'author' ? <Navigate to="/author/dashboard" /> : 
              role === 'reviewer' ? <Navigate to="/reviewer/dashboard" /> : 
              <AuthorRegister />
            } />
            
            <Route path="/reviewer/login" element={
              role === 'author' ? <Navigate to="/author/dashboard" /> : 
              role === 'reviewer' ? <Navigate to="/reviewer/dashboard" /> : 
              <ReviewerLogin onLoginSuccess={setRole} />
            } />
            
            <Route path="/author/dashboard" element={
              role === 'author' ? <AuthorDashboard /> : <Navigate to="/author/login" />
            } />
            
            <Route path="/reviewer/dashboard" element={
              role === 'reviewer' ? <ReviewerDashboard /> : <Navigate to="/reviewer/login" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
