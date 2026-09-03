import React, { useState, useEffect } from 'react';
import { getPendingTips, approveTip, rejectTip } from '../services/api';

function ReviewerDashboard() {
  const [tips, setTips] = useState([]);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const data = await getPendingTips();
      setTips(data);
    } catch (err) {
      setError('Failed to load pending tips');
    }
  };

  const handleApprove = async (id) => {
    setError('');
    try {
      await approveTip(id);
      fetchTips();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setError('');
    try {
      await rejectTip(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      fetchTips();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h2>Reviewer Inbox</h2>
      {error && <div style={{ color: 'red', marginBottom: 15 }}>{error}</div>}
      
      {tips.length === 0 && <p>No pending tips.</p>}
      
      {tips.map(tip => (
        <div key={tip.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 15 }}>
          <p style={{ fontSize: 16 }}>{tip.body}</p>
          <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 15, marginBottom: 10 }}>
            <span><strong>Author ID:</strong> {tip.author_id}</span>
            <span><strong>Status:</strong> {tip.status}</span>
            <span><strong>Score:</strong> {tip.score !== null ? tip.score : 'N/A'}</span>
            <span><strong>Flags:</strong> {tip.flags && tip.flags.length > 0 ? tip.flags.join(', ') : 'None'}</span>
            <span><strong>Date:</strong> {new Date(tip.created_at).toLocaleString()}</span>
          </div>
          
          {rejectingId === tip.id ? (
            <div style={{ marginTop: 10 }}>
              <input
                type="text"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '60%', marginRight: 10 }}
              />
              <button onClick={() => handleReject(tip.id)} style={{ marginRight: 5 }}>Confirm Reject</button>
              <button onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
            </div>
          ) : (
            <div>
              <button onClick={() => handleApprove(tip.id)} style={{ marginRight: 10, backgroundColor: '#4CAF50', color: 'white' }}>Approve</button>
              <button onClick={() => setRejectingId(tip.id)} style={{ backgroundColor: '#f44336', color: 'white' }}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ReviewerDashboard;
