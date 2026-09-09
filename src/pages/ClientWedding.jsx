import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClientSubNav from '../components/ClientSubNav';
import { Sparkles, Edit3, Save, X, Calendar, MapPin, DollarSign, Users, Check } from '../components/Icons';

export default function ClientWedding() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [weddings, setWeddings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit mode state for allowed client info
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    weddingName: '',
    guestCount: '',
    budget: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchMyWeddings = async () => {
      setLoading(true);
      setError(null);
      try {
        const [weddingsRes, venuesRes, servicesRes] = await Promise.all([
          fetch('/api/weddings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/venues', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const data = await weddingsRes.json();
        const venuesData = await venuesRes.json();
        const servicesData = await servicesRes.json();
        
        if (data.success) {
          setWeddings(data.weddings || []);
          if (data.weddings && data.weddings.length > 0) {
            const w = data.weddings[0];
            setEditFormData({
              weddingName: w.weddingName || '',
              guestCount: w.guestCount || '',
              budget: w.budget || '',
              notes: w.notes || ''
            });
          }
        } else {
          setError(data.message || 'Failed to load your wedding.');
        }
        if (venuesData.success) setVenues(venuesData.data || []);
        if (servicesData.success) setServices(servicesData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMyWeddings();
  }, [token]);

  const wedding = weddings.length > 0 ? weddings[0] : null;
  const assignedVenue = wedding ? venues.find(v => v.id === wedding.selectedVenueId) : null;
  const assignedServices = wedding ? services.filter(s => (wedding.selectedServices || []).includes(s.id)) : [];

  const renderStatusBadge = (status) => {
    let bg = '#F3F4F6';
    let color = '#4B5563';
    switch(status) {
      case 'PLANNING': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'CONFIRMED': bg = '#DCFCE7'; color = '#166534'; break;
      case 'IN_PROGRESS': bg = '#FEF3C7'; color = '#92400E'; break;
      case 'COMPLETED': bg = '#F3E8FF'; color = '#6B21A8'; break;
      case 'CANCELLED': bg = '#FEE2E2'; color = '#991B1B'; break;
      default: bg = '#F3F4F6'; color = '#4B5563'; break;
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '8px 18px', borderRadius: '24px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em', display: 'inline-block' }}>
        STATUS: {status ? status.replace(/_/g, ' ') : 'PENDING'}
      </span>
    );
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!wedding) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/weddings/${wedding.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Your wedding information has been successfully updated.');
        setWeddings([data.wedding]);
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to update wedding details.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <ClientSubNav />

      <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading your wedding details...</div>
        ) : error ? (
          <div style={{ padding: '20px', backgroundColor: '#FDF2F2', color: '#9B2C2C', borderRadius: '8px', textAlign: 'center', marginBottom: '30px' }}>
            {error}
          </div>
        ) : !wedding ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
            <Sparkles size={40} color="var(--color-gold)" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.5rem', marginBottom: '20px' }}>
              My Wedding Profile
            </h1>
            <p style={{ color: '#6B7280', fontSize: '1.05rem', lineHeight: '1.6' }}>
              You don't have an active wedding assigned to your profile yet. If you recently submitted an enquiry, your dedicated planner will set up your profile shortly.
            </p>
          </div>
        ) : (
          <div>
            {/* Page Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Bespoke Planning
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', margin: '0 0 15px 0' }}>
                {wedding.weddingName}
              </h1>
              {renderStatusBadge(wedding.status)}
            </div>

            {successMsg && (
              <div style={{ padding: '16px', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '8px', textAlign: 'center', marginBottom: '30px', fontWeight: '500' }}>
                {successMsg}
              </div>
            )}

            {/* Main Details Card */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', padding: '50px', borderTop: '4px solid var(--color-gold)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #F3F4F6', paddingBottom: '15px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.8rem', margin: 0 }}>
                  Event Specifications
                </h2>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', color: 'var(--color-burgundy)', border: '1px solid var(--color-burgundy)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    <Edit3 size={16} /> Edit My Information
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(false)} 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    <X size={16} /> Cancel Editing
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveInfo}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#4B5563', marginBottom: '8px' }}>
                        Wedding Title / Name
                      </label>
                      <input 
                        type="text" 
                        value={editFormData.weddingName}
                        onChange={(e) => setEditFormData({ ...editFormData, weddingName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#4B5563', marginBottom: '8px' }}>
                        Estimated Guest Count
                      </label>
                      <input 
                        type="number" 
                        value={editFormData.guestCount}
                        onChange={(e) => setEditFormData({ ...editFormData, guestCount: e.target.value })}
                        placeholder="e.g. 150"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#4B5563', marginBottom: '8px' }}>
                      Estimated Budget ($)
                    </label>
                    <input 
                      type="text" 
                      value={editFormData.budget}
                      onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                      placeholder="e.g. 50000"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#4B5563', marginBottom: '8px' }}>
                      Vision & Special Requests
                    </label>
                    <textarea 
                      rows={5}
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      placeholder="Share your dream aesthetic, preferences, or guidelines for your planner..."
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                      type="submit" 
                      disabled={saving}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-burgundy)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Event Date</label>
                      <div style={{ fontSize: '1.2rem', color: '#374151', fontWeight: '500' }}>
                        {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be determined'}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Assigned Venue</label>
                      <div style={{ fontSize: '1.2rem', color: '#374151', fontWeight: '500' }}>
                        {assignedVenue ? `${assignedVenue.name} (${assignedVenue.location})` : (wedding.venueReference || 'To be selected')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Event Type</label>
                      <div style={{ fontSize: '1.1rem', color: '#374151' }}>
                        {wedding.eventType}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Guest Count</label>
                      <div style={{ fontSize: '1.1rem', color: '#374151' }}>
                        {wedding.guestCount ? `${wedding.guestCount} guests` : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Budget</label>
                      <div style={{ fontSize: '1.1rem', color: '#374151' }}>
                        {wedding.budget ? `$${Number(wedding.budget).toLocaleString()}` : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {assignedServices.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700', letterSpacing: '1px' }}>Curated Services</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                        {assignedServices.map(s => (
                          <div key={s.id} style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                            <strong style={{ color: 'var(--color-espresso)', display: 'block', fontSize: '1.05rem' }}>{s.name}</strong>
                            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{s.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {wedding.notes && (
                    <div style={{ marginBottom: '40px', backgroundColor: '#F9FAFB', padding: '25px', borderRadius: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700', letterSpacing: '1px' }}>Your Vision & Notes</label>
                      <div style={{ fontSize: '1rem', color: '#4B5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {wedding.notes}
                      </div>
                    </div>
                  )}

                  <div style={{ backgroundColor: 'var(--color-ivory)', padding: '30px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Dedicated Lead Planner</label>
                      <div style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', fontWeight: '600' }}>
                        {wedding.assignedPlannerId ? 'Assigned' : 'Assignment Pending'}
                      </div>
                      {!wedding.assignedPlannerId && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#6B7280' }}>Our curation team is matching you with the perfect planner.</p>
                      )}
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/contact')} style={{ padding: '10px 24px' }}>
                      Contact Planner
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
