import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClientSubNav from '../components/ClientSubNav';
import { MapPin, Users, Sparkles } from '../components/Icons';
import VenueModal from '../components/VenueModal';

export default function ClientVenues({ onOpenEnquiry }) {
  const { token } = useAuth();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        // Only fetch ACTIVE venues for clients
        const res = await fetch('/api/venues?status=ACTIVE', {
          headers: { 'Authorization': `Bearer ${token}` }
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
    if (token) fetchVenues();
  }, [token]);

  const handleInquire = (e, venue) => {
    e.stopPropagation();
    if (onOpenEnquiry) {
      onOpenEnquiry();
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <ClientSubNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
            The Perfect Setting
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', margin: '0 0 15px 0' }}>
            Our Exclusive Venues
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Discover breathtaking spaces that set the stage for your unforgettable moments.
          </p>
        </div>

        {error && (
          <div style={{ padding: '20px', backgroundColor: '#FDF2F2', color: '#9B2C2C', borderRadius: '8px', textAlign: 'center', marginBottom: '40px' }}>
            {error}
          </div>
        )}

        {/* Venues Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Discovering venues...</div>
        ) : venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', color: '#888', border: '1px solid #eaeaea' }}>
            No venues are currently available. Please check back later.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '50px' }}>
            {venues.map(venue => (
              <div 
                key={venue.id} 
                onClick={() => setSelectedVenue(venue)}
                style={{ backgroundColor: '#fff', borderRadius: '0', overflow: 'hidden', boxShadow: '0 20px 40px rgba(44,24,16,0.06)', display: 'flex', flexDirection: 'column', border: '1px solid #f5f5f5', cursor: 'pointer' }}
              >
                <div style={{ height: '300px', backgroundColor: '#f9f9f9', backgroundImage: `url(${venue.imageUrl || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                
                <div style={{ padding: '35px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                    <MapPin size={16} /> {venue.location}
                  </div>
                  
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '2rem', margin: '0 0 15px 0' }}>
                    {venue.name}
                  </h3>
                  
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.7', flex: 1, marginBottom: '25px' }}>
                    {venue.description || 'A stunning venue perfect for luxury celebrations.'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', color: '#555', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} color="var(--color-gold)" /> Capacity: {venue.capacity} guests
                    </div>
                  </div>

                  {venue.amenities && venue.amenities.length > 0 && (
                    <div style={{ marginBottom: '30px' }}>
                      <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '10px' }}>Key Amenities</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {venue.amenities.slice(0, 3).map(am => (
                          <span key={am} style={{ fontSize: '0.8rem', padding: '4px 10px', backgroundColor: 'rgba(212,175,55,0.08)', color: 'var(--color-espresso)', borderRadius: '4px', border: '1px solid rgba(212,175,55,0.2)' }}>
                            {am}
                          </span>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span style={{ fontSize: '0.8rem', padding: '4px 10px', color: '#888' }}>+{venue.amenities.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px', marginTop: 'auto' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Venue Fee From</span>
                      <span style={{ color: 'var(--color-burgundy)', fontWeight: 'bold', fontSize: '1.3rem' }}>
                        ${venue.pricing?.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleInquire(e, venue)} 
                      className="btn-gold" 
                      style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Venue Modal */}
        {selectedVenue && (
          <VenueModal
            venue={{
              ...selectedVenue,
              image: selectedVenue.imageUrl || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
              highlights: selectedVenue.amenities || []
            }}
            onClose={() => setSelectedVenue(null)}
            onOpenEnquiry={onOpenEnquiry || (() => {})}
          />
        )}
      </div>
    </div>
  );
}

