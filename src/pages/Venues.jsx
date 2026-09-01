import React, { useState } from 'react';
import { Search, MapPin, Users, Filter, Sparkles, ArrowRight } from '../components/Icons';
import { VENUES } from '../data/content';
import VenueModal from '../components/VenueModal';

export default function Venues({ onOpenEnquiry }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const venueTypes = ['All', 'Historic Renaissance Villa', 'French Royal Château', 'Palazzo Hotel', 'Royal Indian Palace', 'Clifftop Palace', 'Iconic Manhattan Landmark'];

  const filteredVenues = VENUES.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || v.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ paddingTop: '5rem', backgroundColor: 'var(--color-ivory)' }}>
      {/* 5. VENUES — DESTINATION SANCTUARY HERO (Full Width Cinematic) */}
      <section
        style={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-burgundy-dark)',
          color: 'var(--color-ivory)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=90"
            alt="Architectural Venue Sanctuary"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.48) contrast(1.08)',
              animation: 'slowZoom 18s ease-in-out infinite alternate',
            }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(74, 32, 38, 0.3) 0%, rgba(41, 38, 38, 0.88) 100%)' }} />
        </div>

        <div className="container-luxury" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '1050px', padding: '4rem 1.5rem' }}>
          <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
            CURATED VENUES
          </span>

          <h1
            style={{
              fontSize: 'clamp(3.2rem, 7vw, 6rem)',
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.06em',
              lineHeight: '1.02',
              marginBottom: '1.6rem',
              fontWeight: '400',
            }}
          >
            PLACES WORTH<br />CELEBRATING IN
          </h1>

          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem, 2.2vw, 1.8rem)', color: 'var(--color-gold)', fontStyle: 'italic', marginBottom: '2rem', fontWeight: '300' }}>
            "Exceptional settings chosen to become part of your story."
          </p>

          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', letterSpacing: '0.3em', color: 'var(--color-gold-light)', textTransform: 'uppercase', marginBottom: '2.5rem' }}>
            PARIS · LAKE COMO · NEW YORK · RAVELLO · UDAIPUR
          </div>

          <a href="#venue-collection" className="btn-gold" style={{ padding: '1.1rem 2.8rem' }}>
            EXPLORE THE COLLECTION →
          </a>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section id="venue-collection" style={{ padding: '2rem 0', backgroundColor: 'var(--color-ivory-pure)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury">
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
              <Search size={18} color="var(--color-gold-dark)" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search venue name or location (e.g. Lake Como, Paris, Italy)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Filter size={16} color="var(--color-gold-dark)" />
              <span style={{ fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600', color: 'var(--color-burgundy)' }}>
                Venue Type:
              </span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
                style={{ minWidth: '200px' }}
              >
                {venueTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="section-padding">
        <div className="container-luxury">
          {filteredVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>No matching venues found</h3>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>Try adjusting your search keywords or venue type filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
              {filteredVenues.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVenue(v)}
                  style={{
                    backgroundColor: 'var(--color-ivory-pure)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                  className="experience-card-hover"
                >
                  <div className="image-reveal-wrapper" style={{ height: '280px' }}>
                    <img src={v.image} alt={v.name} />
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                      {v.type}
                    </span>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--color-burgundy)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                      {v.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '1.2rem', color: 'var(--color-charcoal-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={15} color="var(--color-gold)" /> {v.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={15} color="var(--color-gold)" /> {v.capacity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.6' }}>
                      {v.description}
                    </p>

                    <button className="btn-outline" style={{ width: '100%', fontSize: '0.8rem', marginTop: '1.2rem' }}>
                      EXPLORE ESTATE DETAILS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Venue Modal */}
      {selectedVenue && (
        <VenueModal venue={selectedVenue} onClose={() => setSelectedVenue(null)} onOpenEnquiry={onOpenEnquiry} />
      )}
    </div>
  );
}
