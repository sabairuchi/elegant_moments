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
        setEnquiries(data.enquiries || []);
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
      <span style={{ backgroundColor: bg, color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', marginBottom: '10px' }}>
        Enquiries Management
      </h1>
      <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '1.1rem', marginBottom: '40px' }}>
        Review and qualify incoming leads for event planning.
      </p>

      {/* Filters Section */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '35px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', letterSpacing: '1px' }}>Search Leads</label>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
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
            {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Enquiries Table */}
        <div style={{ flex: '1 1 600px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontSize: '1.1rem' }}>No enquiries found matching your criteria.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '2px solid var(--color-gold)' }}>
                    <th style={{ padding: '20px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Lead</th>
                    <th style={{ padding: '20px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Event Details</th>
                    <th style={{ padding: '20px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Date Submitted</th>
                    <th style={{ padding: '20px', textAlign: 'center', color: 'var(--color-espresso)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((eq) => {
                    const isSelected = selectedEnquiry?.id === eq.id;
                    return (
                      <tr 
                        key={eq.id} 
                        onClick={() => setSelectedEnquiry(eq)}
                        style={{ 
                          borderBottom: '1px solid #F3F4F6', 
                          cursor: 'pointer', 
                          backgroundColor: isSelected ? '#FAF7F2' : '#fff',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                        onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = '#fff'; }}
                      >
                        <td style={{ padding: '20px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-burgundy)', fontSize: '1.05rem', marginBottom: '4px' }}>{eq.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{eq.email}</div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div style={{ fontWeight: '500', color: '#374151' }}>{eq.eventType}</div>
                          <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>Guests: {eq.guestCount || 'TBD'}</div>
                        </td>
                        <td style={{ padding: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
                          {new Date(eq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center' }}>
                          {renderStatusBadge(eq.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedEnquiry && (
          <div style={{ 
            flex: '1 1 450px', 
            maxWidth: '550px', 
            backgroundColor: '#fff', 
            borderRadius: '16px', 
            boxShadow: '0 20px 50px rgba(74, 32, 38, 0.08)', 
            padding: '35px', 
            position: 'sticky', 
            top: '120px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.8rem', margin: 0 }}>
                Enquiry Details
              </h3>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9CA3AF', cursor: 'pointer', padding: '5px' }}
                title="Close Panel"
              >
                &times;
              </button>
            </div>
            
            {updateMsg && (
              <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: '8px', marginBottom: '25px', fontSize: '0.9rem', border: '1px solid #A7F3D0' }}>
                {updateMsg}
              </div>
            )}

            <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6', marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Current Status</label>
              <select 
                value={selectedEnquiry.status}
                onChange={(e) => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
                disabled={updating || selectedEnquiry.status === 'CONVERTED'}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '1rem', fontWeight: '500', color: 'var(--color-burgundy)', cursor: 'pointer', transition: 'border-color 0.3s ease' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-gold)'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              >
                {ENQUIRY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Name</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.name}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Phone</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.phone || 'N/A'}</div>
               </div>
               <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Email</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.email}</div>
               </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '25px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Event Type</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.eventType}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Event Date</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.eventDate || 'TBD'}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Guest Count</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.guestCount || 'TBD'}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>Budget</div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{selectedEnquiry.estimatedBudget || 'TBD'}</div>
               </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '600' }}>Vision / Details</div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', fontSize: '0.95rem', color: '#4B5563', border: '1px solid #F3F4F6', lineHeight: '1.6' }}>
                {selectedEnquiry.vision || 'No specific vision provided by the client.'}
              </div>
            </div>

            {selectedEnquiry.status !== 'CONVERTED' ? (
              <button 
                onClick={() => handleConvert(selectedEnquiry.id)}
                disabled={updating}
                className="btn btn-gold"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', letterSpacing: '2px', fontWeight: '600' }}
              >
                {updating ? 'Processing...' : 'Convert to Client'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: '#166534', fontWeight: 'bold', padding: '15px', backgroundColor: '#DCFCE7', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                ✓ Converted to Client
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
