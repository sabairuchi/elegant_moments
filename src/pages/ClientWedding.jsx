import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ClientWedding() {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyWeddings = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/weddings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setWeddings(data.weddings || []);
        } else {
          setError(data.message || 'Failed to load your wedding.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyWeddings();
  }, [token]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading your wedding details...</div>;
  if (error) return <div style={{ padding: '60px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

  if (weddings.length === 0) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.5rem', marginBottom: '20px' }}>
          Welcome to Elegant Moments
        </h1>
        <p style={{ color: '#6B7280', fontSize: '1.1rem', lineHeight: '1.6' }}>
          You don't have any active weddings assigned to your account yet. If you recently converted from an enquiry, your dedicated planner will set up your profile shortly.
        </p>
      </div>
    );
  }

  // Assuming a client typically has one active wedding. We'll display the first one.
  const wedding = weddings[0];

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
      <span style={{ backgroundColor: bg, color, padding: '8px 16px', borderRadius: '24px', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.05em', display: 'inline-block' }}>
        STATUS: {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3.5rem', margin: '0 0 15px 0' }}>
          {wedding.weddingName}
        </h1>
        {renderStatusBadge(wedding.status)}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', padding: '50px', borderTop: '4px solid var(--color-gold)' }}>
        
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '2rem', marginTop: 0, marginBottom: '30px', borderBottom: '1px solid #F3F4F6', paddingBottom: '15px' }}>
          Event Details
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Event Date</label>
            <div style={{ fontSize: '1.2rem', color: '#374151', fontWeight: '500' }}>
              {wedding.weddingDate ? new Date(wedding.weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be determined'}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Venue</label>
            <div style={{ fontSize: '1.2rem', color: '#374151', fontWeight: '500' }}>
              {wedding.venueReference || 'To be determined'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Event Type</label>
            <div style={{ fontSize: '1.1rem', color: '#374151' }}>
              {wedding.eventType}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Estimated Guest Count</label>
            <div style={{ fontSize: '1.1rem', color: '#374151' }}>
              {wedding.guestCount || 'Not specified'}
            </div>
          </div>
        </div>

        {wedding.notes && (
          <div style={{ marginBottom: '40px', backgroundColor: '#F9FAFB', padding: '25px', borderRadius: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700', letterSpacing: '1px' }}>Your Vision & Notes</label>
            <div style={{ fontSize: '1rem', color: '#4B5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {wedding.notes}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: 'var(--color-ivory)', padding: '30px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700', letterSpacing: '1px' }}>Your Dedicated Planner</label>
            <div style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', fontWeight: '600' }}>
              {wedding.assignedPlannerId ? 'Assigned' : 'Assignment Pending'}
            </div>
            {!wedding.assignedPlannerId && (
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#6B7280' }}>Our curation team is matching you with the perfect planner.</p>
            )}
          </div>
          {wedding.assignedPlannerId && (
            <button className="btn btn-primary" onClick={() => navigate('/contact')} style={{ padding: '10px 24px' }}>
              Contact Planner
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
