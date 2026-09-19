import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, Search, Calendar, MapPin, Tag, Edit, ShieldCheck, CheckCircle2 } from '../components/Icons';

export default function BookingManagement() {
  const { user, token, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit status modal
  const [editingBooking, setEditingBooking] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const STATUSES = ['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/bookings', { headers });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || 'Failed to load bookings.');
      }
    } catch (err) {
      setError('Error loading bookings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token]);

  const handleOpenEdit = (booking) => {
    setEditingBooking(booking);
    setEditStatus(booking.status || 'CONFIRMED');
    setEditNotes(booking.contractNotes || '');
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          contractNotes: editNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Updated Booking ${editingBooking.bookingNumber} status to ${editStatus}.`);
        setEditingBooking(null);
        fetchBookings();
      } else {
        setError(data.message || 'Failed to update booking.');
      }
    } catch (err) {
      setError('Error updating booking.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'CONFIRMED': return { bg: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' };
      case 'IN_PROGRESS': return { bg: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' };
      case 'COMPLETED': return { bg: '#F3E5F5', color: '#7B1FA2', border: '1px solid #CE93D8' };
      case 'CANCELLED': return { bg: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' };
      default: return { bg: '#FFF8E1', color: '#B78103', border: '1px solid #FFE082' }; // PENDING
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = !search || 
      (b.bookingNumber && b.bookingNumber.toLowerCase().includes(search.toLowerCase())) ||
      (b.weddingTitle && b.weddingTitle.toLowerCase().includes(search.toLowerCase())) ||
      (b.clientName && b.clientName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isVendor = user?.role === 'vendor';
  const isClient = user?.role === 'client';

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '88vh', padding: '50px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '30px 40px',
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
            <span style={{
              backgroundColor: '#065F46',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Confirmed Booking System
            </span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', marginTop: '10px', marginBottom: '4px' }}>
              Booking Management
            </h1>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
              Monitor confirmed wedding service bookings, deposit statuses, and contract fulfillment.
            </p>
          </div>
        </div>

        {/* Feedback Notices */}
        {error && (
          <div style={{ padding: '15px 20px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '25px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '15px 20px', backgroundColor: '#EDF7ED', borderLeft: '4px solid #2E7D32', color: '#1E4620', marginBottom: '25px', borderRadius: '4px' }}>
            {successMsg}
          </div>
        )}

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search by booking #, client, or wedding..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
            />
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#aaa' }}>
              <Search size={16} />
            </div>
          </div>
          <div style={{ flex: '0 0 200px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', backgroundColor: '#fff' }}
            >
              {STATUSES.map(st => <option key={st} value={st}>{st === 'All' ? 'All Booking Statuses' : st}</option>)}
            </select>
          </div>
        </div>

        {/* Booking Roster */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ background: '#fff', padding: '50px', textAlign: 'center', borderRadius: '10px', border: '1px solid #eee' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', margin: '0 0 10px 0' }}>No Active Bookings</h3>
            <p style={{ color: '#666', margin: 0 }}>Approved proposals automatically generate confirmed booking contracts here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {filteredBookings.map((b) => {
              const badge = getStatusBadge(b.status);

              return (
                <div key={b.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(88,28,37,0.1)', padding: '25px 30px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.4rem', fontWeight: '700' }}>
                          {b.bookingNumber}
                        </span>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {b.status}
                        </span>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
                        Wedding: <strong>{b.weddingTitle}</strong> • Client: <strong>{isVendor ? `${b.clientName.split(' ')[0]} (Client)` : b.clientName}</strong>
                      </p>
                    </div>

                    {!isVendor && !isClient && (
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit size={14} /> Update Booking
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Event Schedule</span>
                      <div style={{ fontSize: '0.95rem', color: '#333', fontWeight: '600' }}>
                        {b.weddingDate ? new Date(b.weddingDate).toLocaleDateString() : 'TBD'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Total Booking Value</span>
                      <div style={{ fontSize: '0.95rem', color: 'var(--color-burgundy)', fontWeight: '700' }}>
                        ${Number(b.totalAmount).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Deposit Amount</span>
                      <div style={{ fontSize: '0.95rem', color: '#2E7D32', fontWeight: '600' }}>
                        ${Number(b.depositAmount).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {b.contractNotes && (
                    <div style={{ backgroundColor: '#FAF7F2', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid var(--color-gold)', fontSize: '0.88rem', color: '#555' }}>
                      <strong>Contract Inclusions:</strong> {b.contractNotes}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingBooking && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '550px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.4rem', marginTop: 0, marginBottom: '20px' }}>
                Update Booking Status — {editingBooking.bookingNumber}
              </h3>

              <form onSubmit={handleSaveBooking}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                    Booking Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                  >
                    {STATUSES.filter(s => s !== 'All').map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                    Contract Fulfillment Notes
                  </label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setEditingBooking(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
