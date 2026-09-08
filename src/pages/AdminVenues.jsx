import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MapPin, Users } from '../components/Icons';

export default function AdminVenues() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const statuses = ['All', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (status !== 'All') queryParams.append('status', status);

      const res = await fetch(`/api/venues?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setVenues(data.data);
      } else {
        setError(data.message || 'Failed to load venues.');
      }
    } catch (err) {
      setError('An error occurred while fetching venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVenues();
    }
  }, [token, search, status]);

  const handleCreateVenue = () => {
    navigate('/admin/venues/new');
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'ACTIVE': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'INACTIVE': return { bg: '#FFF3E0', text: '#E65100' };
      case 'ARCHIVED': return { bg: '#EEEEEE', text: '#616161' };
      default: return { bg: '#F5F5F5', text: '#333' };
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.4rem', margin: '0 0 10px 0' }}>Venues</h1>
          <p style={{ color: '#666', margin: 0 }}>Manage exclusive venue partners for Elegant Moments.</p>
        </div>
        {user?.roles?.some(r => ['admin', 'super_admin'].includes(r)) && (
          <button 
            onClick={handleCreateVenue}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Plus size={18} /> New Venue
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#aaa' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search venues by name or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }}
          />
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', backgroundColor: '#fff' }}
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Loading venues...</div>
      ) : venues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #ccc', color: '#888' }}>
          No venues found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {venues.map(venue => {
            const statusStyle = getStatusColor(venue.status);
            return (
              <div key={venue.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid rgba(88,28,37,0.08)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', backgroundColor: '#f9f9f9', backgroundImage: `url(${venue.imageUrl || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                    {venue.status}
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    <MapPin size={16} /> {venue.location || 'Location TBD'}
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.5rem', margin: '0 0 10px 0' }}>{venue.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
                    {venue.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '0.9rem', color: '#555' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={16} color="var(--color-gold)" /> Up to {venue.capacity || 'N/A'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <div style={{ color: 'var(--color-burgundy)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Starts at ${venue.pricing?.toLocaleString()}
                    </div>
                    {user?.roles?.some(r => ['admin', 'super_admin'].includes(r)) && (
                      <Link to={`/admin/venues/${venue.id}`} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                        Manage
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
