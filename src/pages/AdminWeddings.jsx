import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminWeddings() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const WEDDING_STATUSES = [
    'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  ];

  const fetchWeddings = async () => {
    setLoading(true);
    try {
      let url = '/api/weddings?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setWeddings(data.weddings || []);
      } else {
        setError(data.message || 'Failed to load weddings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, [search, statusFilter, token]);

  const renderStatusBadge = (status) => {
    let bg = '#eee';
    let color = '#333';
    switch(status) {
      case 'PLANNING': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'CONFIRMED': bg = '#DCFCE7'; color = '#166534'; break;
      case 'IN_PROGRESS': bg = '#FEF3C7'; color = '#92400E'; break;
      case 'COMPLETED': bg = '#F3E8FF'; color = '#6B21A8'; break;
      case 'CANCELLED': bg = '#FEE2E2'; color = '#991B1B'; break;
      default: bg = '#F3F4F6'; color = '#4B5563'; break;
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', margin: 0 }}>
          {user?.role === 'planner' ? 'My Assigned Weddings' : 'Weddings Management'}
        </h1>
        {['super_admin', 'admin'].includes(user?.role) && (
          <button 
            className="btn btn-gold"
            onClick={() => navigate('/admin/weddings/new')}
            style={{ fontWeight: '600' }}
          >
            + New Wedding
          </button>
        )}
      </div>
      <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
        Manage active weddings, assignments, and statuses.
      </p>

      {/* Filters Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '35px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', letterSpacing: '1px' }}>Search Weddings</label>
          <input 
            type="text" 
            placeholder="Search by client or wedding name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', transition: 'border-color 0.3s ease' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-gold)'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', letterSpacing: '1px' }}>Filter Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '12px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', transition: 'border-color 0.3s ease' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-gold)'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          >
            <option value="">All Statuses</option>
            {WEDDING_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>{error}</div>}

      {/* Weddings Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading weddings...</div>
        ) : weddings.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontSize: '1.1rem' }}>No weddings found matching your criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '2px solid var(--color-gold)' }}>
                  <th style={{ padding: '20px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Wedding</th>
                  <th style={{ padding: '20px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Date & Venue</th>
                  <th style={{ padding: '20px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Client</th>
                  <th style={{ padding: '20px', textAlign: 'center', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '20px', textAlign: 'right', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {weddings.map((w) => (
                  <tr 
                    key={w.id} 
                    style={{ borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
                  >
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-burgundy)', fontSize: '1.05rem', marginBottom: '4px' }}>{w.weddingName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Guests: {w.guestCount || 'TBD'}</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '500', color: '#374151' }}>
                        {w.weddingDate ? new Date(w.weddingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>{w.venueReference || 'Venue TBD'}</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{w.clientName}</div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      {renderStatusBadge(w.status)}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid #E5E7EB', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/weddings/${w.id}`)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
