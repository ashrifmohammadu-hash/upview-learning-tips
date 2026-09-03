import React, { useState, useEffect } from 'react';
import { submitTip, getOwnTips } from '../services/api';

function AuthorDashboard() {
  const [body, setBody] = useState('');
  const [tips, setTips] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const data = await getOwnTips();
      setTips(data);
    } catch (err) {
      setError('Failed to load tips');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await submitTip(body);
      setMessage('Tip submitted successfully!');
      setBody('');
      fetchTips();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h2>Author Dashboard</h2>
      
      <div style={{ marginBottom: 30, padding: 20, border: '1px solid #ccc' }}>
        <h3>Submit Learning Tip</h3>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        {message && <div style={{ color: 'green', marginBottom: 10 }}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 280))}
            style={{ width: '100%', height: 80, marginBottom: 5 }}
            placeholder="Write your tip here..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span>{body.length} / 280</span>
            <button type="submit" disabled={!body.trim()}>Submit</button>
          </div>
        </form>
      </div>

      <h3>Your Tips</h3>
      {tips.length === 0 && <p>No tips submitted yet.</p>}
      {tips.map(tip => (
        <div key={tip.id} style={{ border: '1px solid #eee', padding: 15, marginBottom: 10 }}>
          <p style={{ fontSize: 16 }}>{tip.body}</p>
          <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 15 }}>
            <span><strong>Status:</strong> {tip.status === 'unscored' ? 'Unscored - scoring service unavailable' : tip.status}</span>
            <span><strong>Score:</strong> {tip.score !== null ? tip.score : 'N/A'}</span>
            <span><strong>Flags:</strong> {tip.flags && tip.flags.length > 0 ? tip.flags.join(', ') : 'None'}</span>
            <span><strong>Date:</strong> {new Date(tip.created_at).toLocaleString()}</span>
          </div>
          {tip.review_note && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#d9534f' }}>
              <strong>Reviewer Note:</strong> {tip.review_note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AuthorDashboard;
