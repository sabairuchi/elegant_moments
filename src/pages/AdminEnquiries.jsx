import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminEnquiries() {
  const { token } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const ENQUIRY_STATUSES = [
    'NEW', 'CONTACTED', 'CONSULTATION_SCHEDULED',
    'CONSULTATION_COMPLETED', 'QUALIFIED', 'CONVERTED',
    'CLOSED', 'LOST'
  ];

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let url = '/api/enquiries?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      } else {
        setError(data.message || 'Failed to load enquiries');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, statusFilter, token]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    setUpdateMsg('');
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg('Status updated successfully');
        fetchEnquiries();
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(data.enquiry);
        }
      } else {
        setUpdateMsg(data.message || 'Failed to update status');
      }
    } catch (err) {
      setUpdateMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleConvert = async (id) => {
    if (!window.confirm('Are you sure you want to convert this enquiry into a Client?')) return;
    setUpdating(true);
    setUpdateMsg('');
    try {
      const res = await fetch(`/api/enquiries/${id}/convert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg(`Converted successfully! Dev Note: Temp Password is ${data.generatedPasswordDevOnly || 'already set'}`);
        fetchEnquiries();
        setSelectedEnquiry(null);
      } else {
        setUpdateMsg(data.message || 'Failed to convert');
      }
    } catch (err) {
      setUpdateMsg(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusBadge = (status) => {
    let bg = '#eee';
    let color = '#333';
    switch(status) {
      case 'NEW': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'CONTACTED': bg = '#FEF3C7'; color = '#92400E'; break;
      case 'CONVERTED': bg = '#DCFCE7'; color = '#166534'; break;
      case 'LOST':
      case 'CLOSED': bg = '#FEE2E2'; color = '#991B1B'; break;
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
        Enquiries Management
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
          {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* Enquiries Table */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#777' }}>No enquiries found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '2px solid var(--color-gold)' }}>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Event Type</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Date Submitted</th>
                  <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'center', color: 'var(--color-espresso)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((eq) => (
                  <tr key={eq.id} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: selectedEnquiry?.id === eq.id ? '#FAF7F2' : 'transparent' }} onClick={() => setSelectedEnquiry(eq)}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-burgundy)' }}>{eq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{eq.email}</div>
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>{eq.eventType}</td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>{new Date(eq.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '15px' }}>{renderStatusBadge(eq.status)}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); setSelectedEnquiry(eq); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Details Panel */}
        {selectedEnquiry && (
          <div style={{ width: '400px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '25px', position: 'sticky', top: '120px' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', margin: '0 0 15px 0' }}>Enquiry Details</h3>
            
            {updateMsg && (
              <div style={{ padding: '10px', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
                {updateMsg}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
              <select 
                value={selectedEnquiry.status}
                onChange={(e) => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
                disabled={updating || selectedEnquiry.status === 'CONVERTED'}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Name</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.name}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.phone || 'N/A'}</div>
               </div>
               <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.email}</div>
               </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Event Type</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.eventType}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Event Date</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.eventDate || 'TBD'}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Guest Count</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.guestCount || 'TBD'}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Budget</div>
                  <div style={{ fontWeight: '500' }}>{selectedEnquiry.estimatedBudget || 'TBD'}</div>
               </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Vision / Details</div>
              <div style={{ backgroundColor: '#FAF7F2', padding: '15px', borderRadius: '6px', fontSize: '0.9rem', color: '#444' }}>
                {selectedEnquiry.vision || 'No specific vision provided.'}
              </div>
            </div>

            {selectedEnquiry.status !== 'CONVERTED' ? (
              <button 
                onClick={() => handleConvert(selectedEnquiry.id)}
                disabled={updating}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                {updating ? 'Processing...' : 'Convert to Client'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: '#166534', fontWeight: 'bold', padding: '10px', backgroundColor: '#DCFCE7', borderRadius: '6px' }}>
                Converted to Client
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
