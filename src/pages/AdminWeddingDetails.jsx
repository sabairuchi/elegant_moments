import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function AdminWeddingDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Planners typically can be assigned. In a real app we'd fetch users where role=planner
  const [planners, setPlanners] = useState([]);

  const WEDDING_STATUSES = [
    'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  ];

  useEffect(() => {
    const fetchWedding = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weddings/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWedding(data.wedding);
        } else {
          setError(data.message || 'Failed to load wedding');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlanners = async () => {
      try {
        // Fetch users where role=planner. (Assuming /api/users supports role filtering)
        const res = await fetch('/api/users?role=planner&limit=50', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPlanners(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load planners", err);
      }
    };

    fetchWedding();
    
    // Only admins/super_admins can assign planners, so only fetch if they have access
    if (['admin', 'super_admin'].includes(user?.role)) {
      fetchPlanners();
    }
  }, [id, token, user?.role]);

  const handleChange = (e) => {
    setWedding({
      ...wedding,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');
    try {
      const res = await fetch(`/api/weddings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(wedding)
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg('Wedding details updated successfully.');
        setWedding(data.wedding);
      } else {
        setUpdateMsg(data.message || 'Failed to update wedding.');
      }
    } catch (err) {
      setUpdateMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading wedding details...</div>;
  if (error) return <div style={{ padding: '60px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  if (!wedding) return <div style={{ padding: '60px', textAlign: 'center' }}>Wedding not found.</div>;

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <button 
        onClick={() => navigate('/admin/weddings')}
        style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
      >
        ← Back to Weddings
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', margin: '0 0 10px 0' }}>
            {wedding.weddingName}
          </h1>
          <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '1.1rem', margin: 0 }}>
            Client: {wedding.clientName}
          </p>
        </div>
      </div>

      {updateMsg && (
        <div style={{ padding: '15px 20px', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '8px', marginBottom: '30px', border: '1px solid #A7F3D0' }}>
          {updateMsg}
        </div>
      )}

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', padding: '40px' }}>
        <form onSubmit={handleUpdate}>
          
          <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6', marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Wedding Status</label>
            <select 
              name="status"
              value={wedding.status}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '1rem', fontWeight: '500', color: 'var(--color-burgundy)', cursor: 'pointer' }}
            >
              {WEDDING_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Wedding Name</label>
              <input type="text" name="weddingName" value={wedding.weddingName || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Event Date</label>
              <input type="date" name="weddingDate" value={wedding.weddingDate || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Guest Count</label>
              <input type="text" name="guestCount" value={wedding.guestCount || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Budget</label>
              <input type="text" name="budget" value={wedding.budget || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Venue Reference</label>
            <input type="text" name="venueReference" placeholder="e.g. The Grand Ritz" value={wedding.venueReference || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Event Notes / Vision</label>
            <textarea name="notes" rows="6" value={wedding.notes || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', resize: 'vertical' }}></textarea>
          </div>

          {['super_admin', 'admin'].includes(user?.role) && (
            <div style={{ padding: '20px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#92400E', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Assigned Planner</label>
              <select 
                name="assignedPlannerId"
                value={wedding.assignedPlannerId || ''}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #FCD34D', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="">-- Unassigned --</option>
                {planners.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
            <button 
              type="submit" 
              disabled={updating}
              className="btn btn-primary"
              style={{ padding: '12px 30px', fontSize: '1rem' }}
            >
              {updating ? 'Saving...' : 'Save Wedding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
