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

  const [planners, setPlanners] = useState([]);
  const [clients, setClients] = useState([]);
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);

  const toggleService = (serviceId) => {
    const currentServices = wedding.selectedServices || [];
    let newServices;
    if (currentServices.includes(serviceId)) {
      newServices = currentServices.filter(id => id !== serviceId);
    } else {
      newServices = [...currentServices, serviceId];
    }
    setWedding({ ...wedding, selectedServices: newServices });
  };

  const WEDDING_STATUSES = [
    'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  ];

  useEffect(() => {
    const fetchWedding = async () => {
      if (id === 'new') {
        setWedding({
          weddingName: '',
          clientName: '',
          weddingDate: '',
          status: 'PLANNING',
          guestCount: '',
          budget: '',
          notes: '',
          venueReference: '',
          selectedVenueId: '',
          selectedServices: [],
          assignedPlannerId: ''
        });
        setLoading(false);
        return;
      }

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

    const fetchPlannersAndClients = async () => {
      try {
        const [plannersRes, clientsRes] = await Promise.all([
          fetch('/api/users?role=planner&limit=100', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/users?role=client&limit=100', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const plannersData = await plannersRes.json();
        const clientsData = await clientsRes.json();
        
        if (plannersData.success) setPlanners(plannersData.data || []);
        if (clientsData.success) setClients(clientsData.data || []);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    const fetchVenuesAndServices = async () => {
      try {
        const [venuesRes, servicesRes] = await Promise.all([
          fetch('/api/venues', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const venuesData = await venuesRes.json();
        const servicesData = await servicesRes.json();
        
        if (venuesData.success) setVenues(venuesData.data || []);
        if (servicesData.success) setServices(servicesData.data || []);
      } catch (err) {
        console.error("Failed to load venues/services", err);
      }
    };

    fetchWedding();
    fetchVenuesAndServices();
    
    // Only admins/super_admins can assign planners, so only fetch if they have access
    if (['admin', 'super_admin'].includes(user?.role)) {
      fetchPlannersAndClients();
    }
  }, [id, token, user?.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let extraUpdates = {};
    
    if (name === 'clientId') {
      const selectedClient = clients.find(c => c.id === value);
      if (selectedClient) {
        extraUpdates.clientName = `${selectedClient.firstName} ${selectedClient.lastName}`;
      }
    }

    setWedding({
      ...wedding,
      [name]: value,
      ...extraUpdates
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMsg('');
    try {
      const url = id === 'new' ? '/api/weddings' : `/api/weddings/${id}`;
      const method = id === 'new' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(wedding)
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg(`Wedding ${id === 'new' ? 'created' : 'updated'} successfully.`);
        if (id === 'new' && data.wedding.id) {
          navigate(`/admin/weddings/${data.wedding.id}`, { replace: true });
        } else {
          setWedding(data.wedding);
        }
      } else {
        setUpdateMsg(data.message || 'Failed to save wedding.');
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
            {wedding.weddingName || 'New Wedding'}
          </h1>
          <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '1.1rem', margin: 0 }}>
            Client: {wedding.clientName || 'Unassigned'}
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
          
          <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6', marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
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
            
            {['super_admin', 'admin'].includes(user?.role) && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Assigned Client</label>
                <select 
                  name="clientId"
                  value={wedding.clientId || ''}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>
            )}
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
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Venue External Reference (Fallback)</label>
            <input type="text" name="venueReference" placeholder="e.g. The Grand Ritz" value={wedding.venueReference || ''} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }} />
          </div>

          <div style={{ padding: '20px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#92400E', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Assigned Venue</label>
            <select 
              name="selectedVenueId"
              value={wedding.selectedVenueId || ''}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #FCD34D', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">-- Unassigned --</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
              ))}
            </select>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#374151', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '700', letterSpacing: '1px' }}>Attached Services</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {services.map(s => {
                const isSelected = (wedding.selectedServices || []).includes(s.id);
                return (
                  <div 
                    key={s.id} 
                    onClick={() => toggleService(s.id)}
                    style={{ 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: `1px solid ${isSelected ? 'var(--color-gold)' : '#ddd'}`,
                      backgroundColor: isSelected ? '#FFFDF5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--color-gold)' }} />
                    <div style={{ fontSize: '0.9rem', color: '#333' }}>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>{s.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {services.length === 0 && <p style={{ fontSize: '0.9rem', color: '#888' }}>No services available in the system.</p>}
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
