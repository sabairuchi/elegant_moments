import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, Tag, Calendar, MapPin, Globe, Instagram, Star, ShieldCheck } from '../components/Icons';

export default function VendorDashboard() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [weddingRequests, setWeddingRequests] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'services' | 'profile'

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [profRes, srvRes, wedRes, venRes] = await Promise.all([
        fetch('/api/users/vendor-profile', { headers }),
        fetch('/api/services', { headers }),
        fetch('/api/weddings', { headers }),
        fetch('/api/venues', { headers })
      ]);

      const [profData, srvData, wedData, venData] = await Promise.all([
        profRes.json(),
        srvRes.json(),
        wedRes.json(),
        venRes.json()
      ]);

      if (profData.success) setProfile(profData.profile);
      if (srvData.success) setServices(srvData.services || []);
      if (wedData.success) setWeddingRequests(wedData.weddings || []);
      if (venData.success) setVenues(venData.venues || []);
    } catch (err) {
      setError('Failed to load vendor partner data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVendorData();
  }, [token]);

  const getStatusBadge = (st) => {
    switch (st) {
      case 'CONFIRMED': return { bg: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' };
      case 'IN_PROGRESS': return { bg: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' };
      case 'COMPLETED': return { bg: '#F3E5F5', color: '#7B1FA2', border: '1px solid #CE93D8' };
      default: return { bg: '#FFF8E1', color: '#B78103', border: '1px solid #FFE082' };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '88vh', padding: '50px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Header Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '35px 40px',
          marginBottom: '35px',
          boxShadow: '0 15px 35px rgba(44,24,16,0.06)',
          border: '1px solid rgba(88,28,37,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                backgroundColor: '#065F46',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={14} /> Partner Vendor Portal
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', fontWeight: '600' }}>
                ★ {profile?.rating || '4.95'} Rating
              </span>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', margin: '0 0 6px 0' }}>
              {profile?.companyName || `${user?.firstName} ${user?.lastName}`}
            </h1>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
              Category: <strong>{profile?.category || 'Luxury Services'}</strong> • Status: <strong style={{ color: '#065F46' }}>{profile?.verifiedStatus || 'Verified'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Profile
            </Link>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
          <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '10px', borderLeft: '4px solid #065F46', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Service Bookings</span>
            <h3 style={{ fontSize: '2rem', color: '#065F46', margin: '8px 0 0 0', fontFamily: 'Playfair Display, serif' }}>{weddingRequests.length}</h3>
          </div>
          <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '10px', borderLeft: '4px solid var(--color-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Catalog Services</span>
            <h3 style={{ fontSize: '2rem', color: 'var(--color-gold-dark)', margin: '8px 0 0 0', fontFamily: 'Playfair Display, serif' }}>{services.length}</h3>
          </div>
          <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '10px', borderLeft: '4px solid var(--color-burgundy)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Partner Category</span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', margin: '8px 0 0 0', fontWeight: '600' }}>{profile?.category || 'Photography'}</h3>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee' }}>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'requests' ? 'var(--color-burgundy)' : '#666',
              borderBottom: activeTab === 'requests' ? '3px solid var(--color-burgundy)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Wedding Requests & Assignments ({weddingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'services' ? 'var(--color-burgundy)' : '#666',
              borderBottom: activeTab === 'services' ? '3px solid var(--color-burgundy)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Services Offered ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: activeTab === 'profile' ? 'var(--color-burgundy)' : '#666',
              borderBottom: activeTab === 'profile' ? '3px solid var(--color-burgundy)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Business Profile Details
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div style={{ padding: '15px 20px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '25px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading vendor partner portal...</div>
        ) : (
          <>
            {/* TAB 1: Wedding Requests & Assignments */}
            {activeTab === 'requests' && (
              <div>
                {weddingRequests.length === 0 ? (
                  <div style={{ background: '#fff', padding: '50px', textAlign: 'center', borderRadius: '10px', border: '1px solid #eee' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', margin: '0 0 10px 0' }}>No Active Service Requests</h3>
                    <p style={{ color: '#666', margin: 0 }}>There are currently no assigned wedding service requests for your vendor account.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
                    {weddingRequests.map((w) => {
                      const badge = getStatusBadge(w.assignmentStatus || w.status);
                      const venueObj = venues.find(v => v.id === w.selectedVenueId);
                      const requestedServiceObjs = services.filter(s => (w.selectedServices || []).includes(s.id));

                      return (
                        <div key={w.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(88,28,37,0.1)', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.6rem', margin: 0 }}>
                                  {w.weddingName}
                                </h2>
                                <span style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  {w.assignmentStatus || 'CONFIRMED'}
                                </span>
                              </div>
                              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                Client: <strong>{w.clientName || 'Private Client'}</strong> • Event Status: <strong>{w.status}</strong>
                              </p>
                            </div>

                            <div style={{ backgroundColor: '#EDF7ED', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#1E4620', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={16} /> Service Assignment Confirmed
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Event Date</span>
                              <div style={{ fontSize: '0.95rem', color: '#333', fontWeight: '600' }}>
                                {w.weddingDate ? new Date(w.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date Pending'}
                              </div>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Event Location & Venue</span>
                              <div style={{ fontSize: '0.95rem', color: 'var(--color-burgundy)', fontWeight: '600' }}>
                                {venueObj ? `${venueObj.name} (${venueObj.location})` : (w.venueReference || 'Venue Pending')}
                              </div>
                            </div>

                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Guest Capacity</span>
                              <div style={{ fontSize: '0.95rem', color: '#333' }}>
                                {w.guestCount ? `${w.guestCount} Guests` : 'Capacity Pending'}
                              </div>
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Services Included for This Event</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {requestedServiceObjs.length > 0 ? (
                                requestedServiceObjs.map(s => (
                                  <span key={s.id} style={{ backgroundColor: '#FAF7F2', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--color-espresso)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {s.name} (${Number(s.startingPrice).toLocaleString()})
                                  </span>
                                ))
                              ) : (
                                <span style={{ backgroundColor: '#FAF7F2', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--color-espresso)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
                                  Partner Vendor Services Allocation
                                </span>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Services Offered */}
            {activeTab === 'services' && (
              <div style={{ background: '#fff', borderRadius: '10px', padding: '30px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', margin: 0 }}>
                    Vendor Service Catalog
                  </h3>
                  <Link to="/client/services" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    View Public Catalog
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {services.map((s) => (
                    <div key={s.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', backgroundColor: '#FAF7F2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-gold-dark)', letterSpacing: '1px' }}>
                          {s.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                          {s.status}
                        </span>
                      </div>
                      <h4 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
                        {s.name}
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.5, margin: '0 0 15px 0' }}>
                        {s.description || 'Luxury tailored vendor service package.'}
                      </p>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-espresso)' }}>
                        Starting at ${Number(s.startingPrice).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Business Profile Details */}
            {activeTab === 'profile' && (
              <div style={{ background: '#fff', borderRadius: '10px', padding: '35px', border: '1px solid rgba(0,0,0,0.06)', maxWidth: '800px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', marginBottom: '20px' }}>
                  Business Profile & Credentials
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Company Name</span>
                    <strong style={{ fontSize: '1rem', color: '#333' }}>{profile?.companyName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Category</span>
                    <strong style={{ fontSize: '1rem', color: '#333' }}>{profile?.category}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Verification Status</span>
                    <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                      {profile?.verifiedStatus}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Partner Rating</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-gold-dark)' }}>★ {profile?.rating} / 5.00</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Website</span>
                    <a href={profile?.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-burgundy)', fontWeight: '600', textDecoration: 'none' }}>
                      {profile?.website}
                    </a>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Instagram</span>
                    <strong style={{ fontSize: '1rem', color: '#333' }}>{profile?.instagram}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FAF7F2', padding: '20px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-espresso)', fontSize: '0.95rem' }}>🔒 Client Data Privacy Notice</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#666', lineHeight: 1.6 }}>
                    As a verified Elegant Moments partner vendor, you are granted access to essential event dates, venues, guest capacity, and service requirements. Client personal contact details and private notes remain protected in compliance with platform privacy policies.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
