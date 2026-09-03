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
    <div style={{ maxWidth: 850, margin: '20px auto', padding: '0 15px' }}>
      
      {/* Submit Box (Glassmorphism / Modern Card) */}
      <div style={{ 
        marginBottom: 40, 
        padding: 25, 
        backgroundColor: '#1e1e1e',
        borderRadius: '12px',
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ marginTop: 0, color: '#ff5722', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
          {/* Pen Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          Submit a Learning Tip
        </h3>
        
        {error && <div style={{ color: '#ff6b6b', marginBottom: 15, padding: '10px', backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: '6px', fontSize: '14px', border: '1px solid rgba(255,107,107,0.2)' }}>{error}</div>}
        {message && <div style={{ color: '#4CAF50', marginBottom: 15, padding: '10px', backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: '6px', fontSize: '14px', border: '1px solid rgba(76,175,80,0.2)' }}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 280))}
            style={{ 
              width: '100%', 
              height: 100, 
              marginBottom: 10,
              padding: '15px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            placeholder="What's a great tip for learning Python?"
            onFocus={(e) => e.target.style.borderColor = '#ff5722'}
            onBlur={(e) => e.target.style.borderColor = '#444'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: body.length >= 280 ? '#ff6b6b' : '#888', fontSize: '14px', fontWeight: '500' }}>
              {body.length} / 280
            </span>
            <button type="submit" disabled={!body.trim()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Send Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Publish Tip
              </div>
            </button>
          </div>
        </form>
      </div>

      <h3 style={{ color: '#fff', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', fontSize: '22px' }}>Your Tip History</h3>
      {tips.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '40px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px dashed #444' }}>No tips submitted yet. Share your knowledge!</p>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {tips.map(tip => (
          <div key={tip.id} style={{ 
            backgroundColor: '#1e1e1e', 
            borderRadius: '12px', 
            padding: '20px', 
            border: '1px solid #333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s',
          }}>
            <p style={{ fontSize: '18px', color: '#f5f5f5', marginTop: 0, marginBottom: '20px', lineHeight: '1.6', letterSpacing: '0.2px' }}>
              "{tip.body}"
            </p>
            
            {/* Action Pills Footer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              
              {/* Status Pill */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                backgroundColor: tip.status === 'approved' ? 'rgba(76,175,80,0.1)' : tip.status === 'rejected' ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)',
                color: tip.status === 'approved' ? '#4CAF50' : tip.status === 'rejected' ? '#F44336' : '#FF9800',
                border: `1px solid ${tip.status === 'approved' ? 'rgba(76,175,80,0.3)' : tip.status === 'rejected' ? 'rgba(244,67,54,0.3)' : 'rgba(255,152,0,0.3)'}`
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {tip.status === 'approved' ? <polyline points="20 6 9 17 4 12"></polyline> : 
                   tip.status === 'rejected' ? <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></> :
                   <circle cx="12" cy="12" r="10"></circle>}
                </svg>
                {tip.status.toUpperCase()}
              </div>

              {/* Score Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#ccc' }}>
                {/* Star Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Score: <strong style={{ color: '#fff' }}>{tip.score !== null ? tip.score : 'N/A'}</strong>
              </div>

              {/* Date Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#ccc' }}>
                {/* Calendar Icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {new Date(tip.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              
              {/* Flags Pill (only if there are flags) */}
              {tip.flags && tip.flags.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255, 87, 34, 0.1)', border: '1px solid rgba(255, 87, 34, 0.3)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#ff5722', fontWeight: '600' }}>
                  {/* Flag Icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                  {tip.flags.join(', ')}
                </div>
              )}
            </div>

            {/* Rejection Note Box */}
            {tip.review_note && (
              <div style={{ marginTop: '18px', padding: '15px', backgroundColor: 'rgba(244,67,54,0.05)', borderLeft: '4px solid #F44336', borderRadius: '0 8px 8px 0', fontSize: '14px', color: '#e57373', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F44336' }}>
                  {/* Alert Icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Reviewer Note
                </strong>
                <span style={{ color: '#ccc' }}>{tip.review_note}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuthorDashboard;
