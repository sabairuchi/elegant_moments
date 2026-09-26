import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import ClientSubNav from '../components/ClientSubNav';
import { Sparkles, Calendar, MapPin, Users, Phone, Clock, FileText, CheckCircle, Bell, MessageSquare, ListCheck } from '../components/Icons';
import BookConsultationModal from '../components/BookConsultationModal';

export default function ClientDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, checklist, guests, ai, notifications

  const [weddings, setWeddings] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedConsultationForPay, setSelectedConsultationForPay] = useState(null);

  // M3.2 Notifications state
  const [notifications, setNotifications] = useState([]);

  // M3.3 AI state
  const [aiRecs, setAiRecs] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBudget, setAiBudget] = useState('30000');
  const [aiGuests, setAiGuests] = useState('120');

  // M3.5 Checklist state
  const [checklist, setChecklist] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  // M3.5 Guest state
  const [guests, setGuests] = useState([]);
  const [guestStats, setGuestStats] = useState({ totalRecords: 0, attendingCount: 0 });
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestCount, setNewGuestCount] = useState('1');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const responses = await Promise.all([
        fetch('/api/weddings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/consultations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/enquiries', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/venues', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/proposals', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (responses.some((r) => r.status === 401)) {
        logout();
        return;
      }

      const [weddingsRes, consultationsRes, enquiriesRes, venuesRes, servicesRes, bookingsRes, proposalsRes, notifRes] = responses;

      const weddingsData = await weddingsRes.json();
      const consultationsData = await consultationsRes.json();
      const enquiriesData = await enquiriesRes.json();
      const venuesData = await venuesRes.json();
      const servicesData = await servicesRes.json();
      const bookingsData = await bookingsRes.json();
      const proposalsData = await proposalsRes.json();
      const notifData = await notifRes.json();

      if (weddingsData.success) setWeddings(weddingsData.weddings || []);
      if (consultationsData.success) setConsultations(consultationsData.consultations || []);
      if (enquiriesData.success) setEnquiries(enquiriesData.enquiries || []);
      if (venuesData.success) setVenues(venuesData.data || []);
      if (servicesData.success) setServices(servicesData.data || []);
      if (bookingsData.success) setBookings(bookingsData.bookings || []);
      if (proposalsData.success) setProposals(proposalsData.proposals || []);
      if (notifData.success) setNotifications(notifData.notifications || []);

      const w = weddingsData.weddings && weddingsData.weddings.length > 0 ? weddingsData.weddings[0] : null;
      if (w) {
        fetchChecklistAndGuests(w.id);
      }
    } catch (err) {
      setError('Failed to load dashboard details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklistAndGuests = async (weddingId) => {
    try {
      const [chkRes, gstRes] = await Promise.all([
        fetch(`/api/weddings/${weddingId}/checklist`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/weddings/${weddingId}/guests`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const chkData = await chkRes.json();
      const gstData = await gstRes.json();

      if (chkData.success) setChecklist(chkData.items || []);
      if (gstData.success) {
        setGuests(gstData.guests || []);
        if (gstData.stats) setGuestStats(gstData.stats);
      }
    } catch (err) {
      console.warn('Could not load checklist or guests:', err.message);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const wedding = weddings.length > 0 ? weddings[0] : null;
  const assignedVenue = wedding && venues.find((v) => v.id === wedding.selectedVenueId);
  const assignedServices = wedding ? services.filter((s) => (wedding.selectedServices || []).includes(s.id)) : [];

  // Countdown timer
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

  const upcomingConsultation = consultations.find((c) => ['REQUESTED', 'SCHEDULED', 'CONFIRMED'].includes(c.status));

  // Handlers for Checklist & Guests
  const handleAddChecklistTask = async (e) => {
    e.preventDefault();
    if (!wedding || !newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ task: newTaskTitle, priority: newTaskPriority }),
      });
      const data = await res.json();
      if (data.success) {
        setChecklist((prev) => [data.item, ...prev]);
        setNewTaskTitle('');
      }
    } catch (err) {
      alert('Failed to add task.');
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    if (!wedding) return;
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/checklist/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setChecklist((prev) => prev.map((item) => (item.id === taskId ? data.item : item)));
      }
    } catch (err) {
      alert('Failed to update task.');
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!wedding || !newGuestName.trim()) return;
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newGuestName, email: newGuestEmail, guestCount: Number(newGuestCount) || 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setGuests((prev) => [data.guest, ...prev]);
        setNewGuestName('');
        setNewGuestEmail('');
        setNewGuestCount('1');
      }
    } catch (err) {
      alert('Failed to add guest.');
    }
  };

  const handleFetchAiRecommendations = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          weddingType: wedding?.eventType || 'Luxury Wedding',
          budget: Number(aiBudget),
          guestCount: Number(aiGuests),
          theme: wedding?.weddingName || 'Classic Elegance',
        }),
      });
      const data = await res.json();
      setAiRecs(data);
    } catch (err) {
      alert('Failed to fetch AI recommendations.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    let bg = '#F3F4F6';
    let color = '#4B5563';
    switch (status) {
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
        {/* Welcome Banner */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderTop: '4px solid var(--color-gold)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Client Concierge Portal
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.4rem', margin: 0 }}>
                Welcome back, {user?.firstName || 'Valued Client'} {user?.lastName || ''}
              </h1>
              <p style={{ color: '#6B7280', margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                Manage your wedding timeline, guest list, notifications, and AI recommendations in one luxury portal.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setSelectedConsultationForPay(null);
                  setIsBookModalOpen(true);
                }}
                style={{ backgroundColor: 'var(--color-gold-dark)', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Book Consultation ($150)
              </button>
              <button
                onClick={() => navigate('/contact')}
                style={{ backgroundColor: 'var(--color-burgundy)', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Contact Concierge
              </button>
            </div>
          </div>

          {/* Master Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderBottom: '2px solid #F3F4F6', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: 'OVERVIEW', icon: Sparkles },
              { id: 'checklist', label: `CHECKLIST (${checklist.length})`, icon: ListCheck },
              { id: 'guests', label: `GUESTS (${guests.length})`, icon: Users },
              { id: 'ai', label: 'AI CONCIERGE', icon: Sparkles },
              { id: 'notifications', label: `NOTIFICATIONS (${notifications.length})`, icon: Bell },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  background: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--color-burgundy)' : '3px solid transparent',
                  color: activeTab === tab.id ? 'var(--color-burgundy)' : '#6B7280',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  fontSize: '0.82rem',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <tab.icon size={16} color={activeTab === tab.id ? 'var(--color-burgundy)' : '#9CA3AF'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '16px', borderRadius: '8px', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Wedding Overview */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--color-espresso)', margin: 0 }}>
                  Wedding Overview
                </h2>
                {wedding && renderStatusBadge(wedding.status)}
              </div>
              {wedding ? (
                <>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', margin: '0 0 10px 0' }}>{wedding.weddingName}</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Event Type: <strong>{wedding.eventType || 'Wedding'}</strong> | Guest Count: <strong>{wedding.guestCount || 'TBD'}</strong></p>
                  {wedding.weddingDate && (
                    <div style={{ backgroundColor: 'var(--color-ivory)', borderRadius: '12px', padding: '16px', textAlign: 'center', border: '1px solid #E5E7EB', margin: '20px 0' }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gold)', fontWeight: '700', marginBottom: '8px' }}>
                        Countdown to Your Celebration
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        <div><div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.days}</div><div style={{ fontSize: '0.65rem', color: '#6B7280' }}>DAYS</div></div>
                        <div><div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.hours}</div><div style={{ fontSize: '0.65rem', color: '#6B7280' }}>HOURS</div></div>
                        <div><div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.minutes}</div><div style={{ fontSize: '0.65rem', color: '#6B7280' }}>MINS</div></div>
                        <div><div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{timeLeft.seconds}</div><div style={{ fontSize: '0.65rem', color: '#6B7280' }}>SECS</div></div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: '#6B7280' }}>No active wedding profile associated with your account yet.</p>
              )}
            </div>

            {/* Recent Activity & Consultations */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--color-espresso)', margin: '0 0 20px 0' }}>
                Consultations & Enquiries
              </h2>
              {upcomingConsultation ? (
                <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '10px', borderLeft: '4px solid var(--color-burgundy)' }}>
                  <div style={{ fontWeight: '600', color: 'var(--color-espresso)' }}>{upcomingConsultation.meetingType || 'Video Call'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>Date: {upcomingConsultation.date || upcomingConsultation.requestedDate} {upcomingConsultation.time}</div>
                </div>
              ) : (
                <p style={{ color: '#6B7280' }}>No upcoming consultations scheduled.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WEDDING CHECKLIST */}
        {activeTab === 'checklist' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--color-espresso)', margin: '0 0 20px 0' }}>
              Wedding Checklist & Tasks
            </h2>
            <form onSubmit={handleAddChecklistTask} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add custom task (e.g. Choose bridal bouquet flowers)..."
                style={{ flex: 1, minWidth: '240px', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem' }}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{ padding: '12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.9rem' }}
              >
                <option value="HIGH">HIGH PRIORITY</option>
                <option value="MEDIUM">MEDIUM PRIORITY</option>
                <option value="LOW">LOW PRIORITY</option>
              </select>
              <button type="submit" style={{ backgroundColor: 'var(--color-burgundy)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                + Add Task
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleTaskStatus(item.id, item.status)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: item.status === 'COMPLETED' ? '#F3F4F6' : '#FAF6F0',
                    borderLeft: `4px solid ${item.priority === 'HIGH' ? '#EF4444' : item.priority === 'MEDIUM' ? '#F59E0B' : '#10B981'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" checked={item.status === 'COMPLETED'} readOnly style={{ width: '18px', height: '18px' }} />
                    <span style={{ textDecoration: item.status === 'COMPLETED' ? 'line-through' : 'none', color: item.status === 'COMPLETED' ? '#9CA3AF' : '#2A1810', fontWeight: '500' }}>
                      {item.task}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#E5E7EB', color: '#374151' }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GUEST LIST */}
        {activeTab === 'guests' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--color-espresso)', margin: '0 0 10px 0' }}>
              Guest Management & RSVPs
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px' }}>
              Attending Guests: <strong>{guestStats.attendingCount}</strong> | Total Guests Listed: <strong>{guests.length}</strong>
            </p>

            <form onSubmit={handleAddGuest} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Guest Full Name..."
                style={{ flex: 1, minWidth: '200px', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
              />
              <input
                type="email"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                placeholder="Guest Email..."
                style={{ flex: 1, minWidth: '200px', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
              />
              <button type="submit" style={{ backgroundColor: 'var(--color-burgundy)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                + Add Guest
              </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF6F0', textAlign: 'left', borderBottom: '2px solid #E5D5C5' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>RSVP Status</th>
                  <th style={{ padding: '12px' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{g.name}</td>
                    <td style={{ padding: '12px', color: '#6B7280' }}>{g.email || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: g.rsvpStatus === 'ATTENDING' ? '#DCFCE7' : '#FEF3C7', color: g.rsvpStatus === 'ATTENDING' ? '#166534' : '#92400E' }}>
                        {g.rsvpStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>+{g.guestCount || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: AI RECOMMENDATIONS */}
        {activeTab === 'ai' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--color-espresso)', margin: '0 0 10px 0' }}>
              AI Wedding Service & Venue Curation
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px' }}>
              Intelligent recommendation engine tailored to your wedding vision, budget, and guest requirements.
            </p>

            <form onSubmit={handleFetchAiRecommendations} style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Budget ($)</label>
                <input
                  type="number"
                  value={aiBudget}
                  onChange={(e) => setAiBudget(e.target.value)}
                  style={{ padding: '10px', border: '1px solid #D1D5DB', borderRadius: '4px', width: '150px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>Guest Count</label>
                <input
                  type="number"
                  value={aiGuests}
                  onChange={(e) => setAiGuests(e.target.value)}
                  style={{ padding: '10px', border: '1px solid #D1D5DB', borderRadius: '4px', width: '150px' }}
                />
              </div>
              <button
                type="submit"
                disabled={aiLoading}
                style={{ marginTop: '22px', backgroundColor: 'var(--color-gold-dark)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {aiLoading ? 'Curating AI Suggestions...' : 'Generate Recommendations'}
              </button>
            </form>

            {aiRecs && (
              <div style={{ backgroundColor: '#FAF6F0', borderRadius: '12px', padding: '24px', border: '1px solid #D4AF37' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-gold-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {aiRecs.disclaimer}
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-burgundy)', marginBottom: '20px' }}>{aiRecs.summary}</p>

                <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.2rem' }}>Recommended Services</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  {aiRecs.recommendedServices?.map((s) => (
                    <div key={s.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #E5D5C5' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Category: {s.category} | From ${s.startingPrice?.toLocaleString()}</div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '8px' }}>{s.matchReason}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.2rem' }}>Recommended Venues</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {aiRecs.recommendedVenues?.map((v) => (
                    <div key={v.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #E5D5C5' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{v.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Location: {v.location} | Capacity: {v.capacity}</div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '8px' }}>{v.matchReason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--color-espresso)', margin: '0 0 20px 0' }}>
              Notification & Communication History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} style={{ backgroundColor: '#FAF6F0', borderRadius: '10px', padding: '18px', borderLeft: '4px solid var(--color-gold)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-burgundy)' }}>{n.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{new Date(n.sentAt || n.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#374151' }} dangerouslySetInnerHTML={{ __html: n.message }} />
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                      Channel: <strong>{n.channel}</strong> | Ref: <strong>{n.reference || 'N/A'}</strong> | Status: <strong>{n.status}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#6B7280' }}>No notification logs found.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <BookConsultationModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        initialConsultation={selectedConsultationForPay}
        onConsultationBooked={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}
