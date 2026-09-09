import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ClientSubNav from '../components/ClientSubNav';
import { Sparkles, Calendar, MapPin, Users, Phone, Clock, FileText, CheckCircle } from '../components/Icons';

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [weddings, setWeddings] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [weddingsRes, consultationsRes, enquiriesRes, venuesRes, servicesRes] = await Promise.all([
          fetch('/api/weddings', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/consultations', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/enquiries', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/venues', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/services', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const weddingsData = await weddingsRes.json();
        const consultationsData = await consultationsRes.json();
        const enquiriesData = await enquiriesRes.json();
        const venuesData = await venuesRes.json();
        const servicesData = await servicesRes.json();

        if (weddingsData.success) setWeddings(weddingsData.weddings || []);
        if (consultationsData.success) setConsultations(consultationsData.consultations || []);
        if (enquiriesData.success) setEnquiries(enquiriesData.enquiries || []);
        if (venuesData.success) setVenues(venuesData.data || []);
        if (servicesData.success) setServices(servicesData.data || []);
      } catch (err) {
        setError('Failed to load dashboard details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const wedding = weddings.length > 0 ? weddings[0] : null;
  const assignedVenue = wedding && venues.find(v => v.id === wedding.selectedVenueId);
  const assignedServices = wedding ? services.filter(s => (wedding.selectedServices || []).includes(s.id)) : [];
  
  // Calculate countdown if wedding date exists
  useEffect(() => {
    if (!wedding || !wedding.weddingDate) return;

    const calculateTime = () => {
      const targetDate = new Date(wedding.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [wedding]);

  const upcomingConsultation = consultations.find(c => ['REQUESTED', 'SCHEDULED', 'CONFIRMED'].includes(c.status));

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
      <span style={{ backgroundColor: bg, color, padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>
        {status ? status.replace(/_/g, ' ') : 'NOT SET'}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <ClientSubNav />
        <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--color-espresso)' }}>
          <Sparkles size={32} color="var(--color-gold)" style={{ marginBottom: '15px' }} />
          <h2 style={{ fontFamily: 'Playfair Display, serif' }}>Curating Your Concierge Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <ClientSubNav />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
        
        {/* Welcome Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderTop: '4px solid var(--color-gold)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Client Portal
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.5rem', margin: 0 }}>
                Welcome back, {user?.firstName || 'Valued Client'} {user?.lastName || ''}
              </h1>
              <p style={{ color: '#6B7280', margin: '8px 0 0 0', fontSize: '1rem' }}>
                Manage your wedding details, review consultations, and explore bespoke services.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => navigate('/contact')} 
                style={{ backgroundColor: 'var(--color-burgundy)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Contact Concierge
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '16px', borderRadius: '8px', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        {/* Primary Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          
          {/* Card 1: Wedding Overview & Countdown */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--color-espresso)', margin: 0 }}>
                Wedding Overview
              </h2>
              {wedding && renderStatusBadge(wedding.status)}
            </div>

            {wedding ? (
              <>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-burgundy)', margin: '0 0 10px 0', fontWeight: '600' }}>
                  {wedding.weddingName}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Event Type: <strong>{wedding.eventType || 'Wedding'}</strong> | Guest Count: <strong>{wedding.guestCount || 'TBD'}</strong>
                </p>

                {/* Countdown Block */}
                {wedding.weddingDate ? (
                  <div style={{ backgroundColor: 'var(--color-ivory)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #E5E7EB', marginBottom: '25px' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--color-gold)', fontWeight: '700', marginBottom: '12px' }}>
                      Countdown to Your Day
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.days}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Days</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.hours}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Hours</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.minutes}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Mins</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.seconds}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'uppercase' }}>Secs</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '15px', backgroundColor: '#F9FAFB', borderRadius: '8px', color: '#6B7280', fontSize: '0.9rem', marginBottom: '25px' }}>
                    Wedding date is yet to be finalized with your planner.
                  </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                  <Link to="/dashboard/wedding" style={{ textDecoration: 'none', color: 'var(--color-burgundy)', fontWeight: '600', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    View Full Wedding Details &rarr;
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#6B7280' }}>
                <p>No active wedding profile assigned to your account yet.</p>
                <p style={{ fontSize: '0.85rem' }}>Our team will convert your enquiry into a wedding workspace shortly.</p>
              </div>
            )}
          </div>

          {/* Card 2: Dedicated Planner & Concierge */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--color-espresso)', margin: '0 0 20px 0' }}>
              Your Planning Team
            </h2>

            <div style={{ backgroundColor: 'var(--color-ivory)', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gold)', fontWeight: '700', marginBottom: '6px' }}>
                Assigned Lead Planner
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-burgundy)' }}>
                {wedding?.assignedPlannerId ? 'Senior Event Curator' : 'Assignment Pending'}
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '6px 0 0 0' }}>
                {wedding?.assignedPlannerId ? 'Your dedicated planner is managing venue options and vendor negotiations.' : 'Our curation team is preparing your dedicated planner matching.'}
              </p>
            </div>

            {/* Selected Venue Summary */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontWeight: '700', marginBottom: '8px' }}>
                Selected Venue
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '1rem', fontWeight: '500' }}>
                <MapPin size={18} color="var(--color-gold)" />
                {assignedVenue ? `${assignedVenue.name} (${assignedVenue.location})` : (wedding?.venueReference || 'Not Selected Yet')}
              </div>
            </div>

            {/* Selected Services Summary */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontWeight: '700', marginBottom: '8px' }}>
                Curated Services ({assignedServices.length})
              </div>
              {assignedServices.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {assignedServices.map(s => (
                    <span key={s.id} style={{ padding: '4px 12px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No services attached to your itinerary yet.</div>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '15px' }}>
              <Link to="/client/venues" style={{ textDecoration: 'none', color: 'var(--color-gold)', fontWeight: '600', fontSize: '0.85rem' }}>
                Browse Venues &rarr;
              </Link>
              <Link to="/client/services" style={{ textDecoration: 'none', color: 'var(--color-gold)', fontWeight: '600', fontSize: '0.85rem' }}>
                Browse Services &rarr;
              </Link>
            </div>
          </div>

          {/* Card 3: Consultations & Enquiries Status */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--color-espresso)', margin: '0 0 20px 0' }}>
              Recent Requests & Activity
            </h2>

            {/* Upcoming Consultation highlight */}
            <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '12px', borderLeft: '4px solid var(--color-burgundy)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', fontWeight: '700', marginBottom: '6px' }}>
                Upcoming Consultation
              </div>
              {upcomingConsultation ? (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-espresso)', fontSize: '1rem' }}>
                    {upcomingConsultation.meetingType || 'Video Call'}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px' }}>
                    Date: {upcomingConsultation.date || upcomingConsultation.requestedDate || 'Pending confirmation'} {upcomingConsultation.time ? `at ${upcomingConsultation.time}` : ''}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    {renderStatusBadge(upcomingConsultation.status)}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                  No upcoming consultations scheduled. You can request one anytime.
                </div>
              )}
            </div>

            {/* Enquiries Count */}
            <div style={{ padding: '16px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--color-espresso)', fontSize: '0.95rem' }}>Submitted Enquiries</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Total recorded: {enquiries.length}</div>
              </div>
              <Link to="/dashboard/enquiries" className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                View All
              </Link>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Link to="/dashboard/enquiries" style={{ textDecoration: 'none', color: 'var(--color-burgundy)', fontWeight: '600', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Manage My Enquiries & Consultations &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
