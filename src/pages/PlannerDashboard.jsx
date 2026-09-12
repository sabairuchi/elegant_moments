import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, Search, Calendar, MapPin, Tag, Edit, Save, X } from '../components/Icons';

export default function PlannerDashboard() {
  const { user, token, logout } = useAuth();
  const [weddings, setWeddings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Modal State
  const [editingWedding, setEditingWedding] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editVenueId, setEditVenueId] = useState('');
  const [editServices, setEditServices] = useState([]);
  const [saving, setSaving] = useState(false);

  const STATUSES = ['All', 'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  const fetchPlannerData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);

      const [wedRes, venRes, srvRes] = await Promise.all([
        fetch(`/api/weddings?${queryParams.toString()}`, { headers }),
        fetch('/api/venues', { headers }),
        fetch('/api/services', { headers })
      ]);

      const [wedData, venData, srvData] = await Promise.all([
        wedRes.json(),
        venRes.json(),
        srvRes.json()
      ]);

      if (wedData.success) setWeddings(wedData.weddings || []);
      if (venData.success) setVenues(venData.venues || []);
      if (srvData.success) setServices(srvData.services || []);
    } catch (err) {
      setError('Failed to load assigned planner data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlannerData();
  }, [token, search, statusFilter]);

  const handleOpenEdit = (wedding) => {
    setEditingWedding(wedding);
    setEditStatus(wedding.status || 'PLANNING');
    setEditNotes(wedding.notes || '');
    setEditVenueId(wedding.selectedVenueId || '');
    setEditServices(wedding.selectedServices || []);
  };

  const handleToggleService = (serviceId) => {
    if (editServices.includes(serviceId)) {
      setEditServices(editServices.filter(id => id !== serviceId));
    } else {
      setEditServices([...editServices, serviceId]);
    }
  };

  const handleSaveWedding = async (e) => {
    e.preventDefault();
    if (!editingWedding) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/weddings/${editingWedding.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          notes: editNotes,
          selectedVenueId: editVenueId || null,
          selectedServices: editServices
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Updated ${editingWedding.weddingName} successfully.`);
        setEditingWedding(null);
        fetchPlannerData();
      } else {
        setError(data.message || 'Failed to update wedding details.');
      }
    } catch (err) {
      setError('Error updating wedding details.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'PLANNING': return { bg: '#FFF8E1', color: '#B78103', border: '1px solid #FFE082' };
      case 'CONFIRMED': return { bg: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' };
      case 'IN_PROGRESS': return { bg: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' };
      case 'COMPLETED': return { bg: '#F3E5F5', color: '#7B1FA2', border: '1px solid #CE93D8' };
      case 'CANCELLED': return { bg: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' };
      default: return { bg: '#F5F5F5', color: '#424242', border: '1px solid #E0E0E0' };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '88vh', padding: '50px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Bar */}
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
              backgroundColor: '#1E3A8A',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Certified Planner Portal
            </span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', marginTop: '10px', marginBottom: '4px' }}>
              Welcome, {user?.firstName} {user?.lastName}
            </h1>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
              Oversee your client wedding rosters, venue allocations, service selections, and progress milestones.
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

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
          <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '10px', borderLeft: '4px solid var(--color-burgundy)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Assigned Weddings</span>
            <h3 style={{ fontSize: '2rem', color: 'var(--color-burgundy)', margin: '8px 0 0 0', fontFamily: 'Playfair Display, serif' }}>{weddings.length}</h3>
          </div>
          <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '10px', borderLeft: '4px solid var(--color-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Planning</span>
            <h3 style={{ fontSize: '2rem', color: 'var(--color-gold-dark)', margin: '8px 0 0 0', fontFamily: 'Playfair Display, serif' }}>
              {weddings.filter(w => ['PLANNING', 'CONFIRMED', 'IN_PROGRESS'].includes(w.status)).length}
            </h3>
          </div>
          <div style={{ background: '#fff', padding: '20px 25px', borderRadius: '10px', borderLeft: '4px solid #2E7D32', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Confirmed Venues</span>
            <h3 style={{ fontSize: '2rem', color: '#2E7D32', margin: '8px 0 0 0', fontFamily: 'Playfair Display, serif' }}>
              {weddings.filter(w => w.selectedVenueId).length}
            </h3>
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
              placeholder="Search assigned client or wedding name..." 
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
              {STATUSES.map(st => <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>)}
            </select>
          </div>
        </div>

        {/* Weddings Roster */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading planner dashboard...</div>
        ) : weddings.length === 0 ? (
          <div style={{ background: '#fff', padding: '50px', textAlign: 'center', borderRadius: '10px', border: '1px solid #eee' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', margin: '0 0 10px 0' }}>No Weddings Assigned Yet</h3>
            <p style={{ color: '#666', margin: 0 }}>You currently have no client weddings assigned to your planner account matching the filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
            {weddings.map((w) => {
              const badge = getStatusBadge(w.status);
              const venueObj = venues.find(v => v.id === w.selectedVenueId);
              const selectedServiceObjs = services.filter(s => (w.selectedServices || []).includes(s.id));

              return (
                <div key={w.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(88,28,37,0.1)', padding: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.6rem', margin: 0 }}>
                          {w.weddingName}
                        </h2>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {w.status}
                        </span>
                      </div>
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                        Client: <strong>{w.clientName}</strong> ({w.clientId})
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(w)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Edit size={14} /> Update Planning
                    </button>
                  </div>

                  {/* Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Date & Schedule</span>
                      <div style={{ fontSize: '0.95rem', color: '#333', fontWeight: '600' }}>
                        {w.weddingDate ? new Date(w.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Guest Count & Budget</span>
                      <div style={{ fontSize: '0.95rem', color: '#333' }}>
                        {w.guestCount ? `${w.guestCount} Guests` : 'Guests TBD'} • {w.budget ? `$${Number(w.budget).toLocaleString()}` : 'Budget TBD'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Selected Venue</span>
                      <div style={{ fontSize: '0.95rem', color: 'var(--color-burgundy)', fontWeight: '600' }}>
                        {venueObj ? `${venueObj.name} (${venueObj.location})` : (w.venueReference || 'No Venue Selected')}
                      </div>
                    </div>
                  </div>

                  {/* Selected Services Tags */}
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Allocated Vendor Services ({selectedServiceObjs.length})</span>
                    {selectedServiceObjs.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>No services allocated yet.</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedServiceObjs.map(s => (
                          <span key={s.id} style={{ backgroundColor: '#FAF7F2', border: '1px solid rgba(212,175,55,0.4)', color: 'var(--color-espresso)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                            {s.name} (${Number(s.startingPrice).toLocaleString()})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes / Milestones */}
                  {w.notes && (
                    <div style={{ backgroundColor: '#FFFBEB', padding: '12px 16px', borderRadius: '6px', borderLeft: '3px solid var(--color-gold)', fontSize: '0.88rem', color: '#555' }}>
                      <strong>Planner Notes:</strong> {w.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Planning Modal */}
        {editingWedding && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', margin: 0 }}>
                  Update Planning — {editingWedding.weddingName}
                </h3>
                <button onClick={() => setEditingWedding(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveWedding}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                    Wedding Planning Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                  >
                    {STATUSES.filter(st => st !== 'All').map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                    Assigned Luxury Venue
                  </label>
                  <select
                    value={editVenueId}
                    onChange={(e) => setEditVenueId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Select Venue --</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Allocated Vendor Services
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #eee', padding: '12px', borderRadius: '6px' }}>
                    {services.map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editServices.includes(s.id)}
                          onChange={() => handleToggleService(s.id)}
                        />
                        <span>{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                    Planner Notes & Tasks
                  </label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter planning milestones, client preferences, or operational notes..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setEditingWedding(null)} className="btn btn-secondary" style={{ padding: '9px 18px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '9px 20px' }}>
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
