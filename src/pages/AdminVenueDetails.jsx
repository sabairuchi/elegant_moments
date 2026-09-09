import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Trash2, MapPin, Users, DollarSign, Image } from '../components/Icons';

export default function AdminVenueDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [amenityInput, setAmenityInput] = useState('');

  const statuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

  useEffect(() => {
    const fetchVenue = async () => {
      if (id === 'new') {
        setVenue({
          name: '',
          location: '',
          capacity: 0,
          pricing: 0,
          imageUrl: '',
          amenities: [],
          description: '',
          status: 'ACTIVE'
        });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/venues/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setVenue(data.data);
        } else {
          setError(data.message || 'Failed to load venue');
        }
      } catch (err) {
        setError('Error fetching venue details');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchVenue();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenue(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !venue.amenities.includes(amenityInput.trim())) {
      setVenue(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (am) => {
    setVenue(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== am)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = id === 'new' ? '/api/venues' : `/api/venues/${id}`;
      const method = id === 'new' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(venue)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Venue ${id === 'new' ? 'created' : 'updated'} successfully`);
        if (id === 'new' && data.data && data.data.id) {
          navigate(`/admin/venues/${data.data.id}`, { replace: true });
        } else {
          setVenue(data.data);
        }
      } else {
        setError(data.message || 'Failed to update venue');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this venue? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/venues/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        navigate('/admin/venues');
      } else {
        setError(data.message || 'Failed to delete venue');
      }
    } catch (err) {
      setError('An error occurred while deleting.');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading venue details...</div>;
  if (!venue) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error || 'Venue not found'}</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <Link to="/admin/venues" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '25px', fontSize: '0.9rem', fontWeight: '500' }}>
        <ArrowLeft size={16} /> Back to Venues
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', margin: '0 0 10px 0' }}>
            {id === 'new' ? 'Create Venue' : 'Edit Venue'}
          </h1>
          {id !== 'new' && <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>ID: {venue.id}</p>}
        </div>
        {id !== 'new' && (
          <button 
            onClick={handleDelete}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#FDF2F2', color: '#C53030', border: '1px solid #FEB2B2', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            <Trash2 size={16} /> Delete Venue
          </button>
        )}
      </div>

      {error && <div style={{ padding: '15px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '25px', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ padding: '15px', backgroundColor: '#F0FDF4', borderLeft: '4px solid #2F855A', color: '#2F855A', marginBottom: '25px', borderRadius: '4px' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(88,28,37,0.08)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '25px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Venue Name</label>
            <input 
              type="text" 
              name="name" 
              value={venue.name} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Status</label>
            <select 
              name="status" 
              value={venue.status} 
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '25px', marginBottom: '25px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              <MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Location
            </label>
            <input 
              type="text" 
              name="location" 
              value={venue.location} 
              onChange={handleChange}
              placeholder="City, State"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              <Users size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Capacity
            </label>
            <input 
              type="number" 
              name="capacity" 
              value={venue.capacity} 
              onChange={handleChange}
              min="0"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              <DollarSign size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Starting Price
            </label>
            <input 
              type="number" 
              name="pricing" 
              value={venue.pricing} 
              onChange={handleChange}
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
            <Image size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Image URL
          </label>
          <input 
            type="url" 
            name="imageUrl" 
            value={venue.imageUrl} 
            onChange={handleChange} 
            placeholder="https://example.com/venue.jpg"
            style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
          />
          {venue.imageUrl && (
            <div style={{ marginTop: '15px', height: '200px', width: '350px', borderRadius: '8px', backgroundImage: `url(${venue.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #eee' }} />
          )}
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Amenities</label>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
            {venue.amenities.map(am => (
              <div key={am} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--color-espresso)', border: '1px solid var(--color-gold)', borderRadius: '20px', fontSize: '0.85rem' }}>
                {am}
                <button type="button" onClick={() => handleRemoveAmenity(am)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#999', display: 'flex', alignItems: 'center' }}>
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyPress={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
              placeholder="e.g. Valet Parking, Ocean View..."
              style={{ flex: 1, padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
            />
            <button type="button" onClick={handleAddAmenity} className="btn btn-outline" style={{ padding: '0 20px' }}>Add</button>
          </div>
        </div>

        <div style={{ marginBottom: '35px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Description</label>
          <textarea 
            name="description" 
            value={venue.description} 
            onChange={handleChange} 
            rows={5}
            style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', resize: 'vertical' }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #eee', paddingTop: '25px' }}>
          <Link to="/admin/venues" className="btn btn-outline" style={{ padding: '12px 24px' }}>
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
