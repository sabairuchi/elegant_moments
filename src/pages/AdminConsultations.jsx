import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminConsultations() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const [updating, setUpdating] = useState(false);


  const CONSULTATION_STATUSES = [
    'REQUESTED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  ];

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      let url = '/api/consultations?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setConsultations(data.consultations);
      } else {
        setError(data.message || 'Failed to load consultations');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [search, statusFilter, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');
    try {
      const { id, status, date, time, duration, meetingType, locationLink, internalNotes } = selectedConsultation;
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, date, time, duration, meetingType, locationLink, internalNotes })
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg('Consultation updated successfully');
        fetchConsultations();
      } else {
        setUpdateMsg(data.message || 'Failed to update consultation');
      }
    } catch (err) {
      setUpdateMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    setSelectedConsultation({
      ...selectedConsultation,
      [e.target.name]: e.target.value
    });
  };

  const renderStatusBadge = (status) => {
    let bg = '#eee';
    let color = '#333';
    switch (status) {
      case 'REQUESTED': bg = '#FEF3C7'; color = '#92400E'; break;
      case 'SCHEDULED': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'CONFIRMED': bg = '#DCFCE7'; color = '#166534'; break;
      case 'CANCELLED':
      case 'NO_SHOW': bg = '#FEE2E2'; color = '#991B1B'; break;
      default: bg = '#F3E8FF'; color = '#6B21A8'; break;
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.5rem', marginBottom: '20px' }}>
        Consultations
      </h1>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '250px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd' }}
        >
          <option value="">All Statuses</option>
          {CONSULTATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* Consultations Table */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading consultations...</div>
          ) : consultations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#777' }}>No consultations found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '2px solid var(--color-gold)' }}>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Client</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Date/Time</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Type</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: 'var(--color-espresso)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedConsultation?.id === c.id ? '#FAF7F2' : 'transparent' }} onClick={() => setSelectedConsultation(c)}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-burgundy)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                      {c.date ? `${c.date} ${c.time || ''}` : <span style={{ color: '#888' }}>Requested: {c.requestedDate}</span>}
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>{c.meetingType}</td>
                    <td style={{ padding: '15px' }}>{renderStatusBadge(c.status)}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedConsultation(c); }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details Panel */}
        {selectedConsultation && (
          <div style={{ width: '400px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '25px', position: 'sticky', top: '120px' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', margin: '0 0 15px 0' }}>Manage Consultation</h3>

            {updateMsg && (
              <div style={{ padding: '10px', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
                {updateMsg}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Status</label>
                <select
                  name="status"
                  value={selectedConsultation.status}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  {CONSULTATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Date</label>
                  <input type="date" name="date" value={selectedConsultation.date || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Time</label>
                  <input type="time" name="time" value={selectedConsultation.time || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Duration</label>
                  <input type="text" name="duration" placeholder="e.g. 30 mins" value={selectedConsultation.duration || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Meeting Type</label>
                  <select name="meetingType" value={selectedConsultation.meetingType || 'Video Call'} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="Video Call">Video Call</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="In Person">In Person</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Location / Link</label>
                <input type="text" name="locationLink" placeholder="Zoom link, address..." value={selectedConsultation.locationLink || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Internal Notes</label>
                <textarea name="internalNotes" rows="3" value={selectedConsultation.internalNotes || ''} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={updating} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setSelectedConsultation(null)} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
