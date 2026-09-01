import React from 'react';
import { X, MapPin, Users, Building, Check, Sparkles } from './Icons';

export default function VenueModal({ venue, onClose, onOpenEnquiry }) {
  if (!venue) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          padding: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--color-ivory)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            zIndex: 10,
            background: 'rgba(74, 32, 38, 0.8)',
            border: '1px solid var(--color-gold)',
            color: 'var(--color-ivory)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Hero Image */}
        <div style={{ height: '380px', width: '100%', position: 'relative' }}>
          <img
            src={venue.image}
            alt={venue.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              background: 'linear-gradient(to top, var(--color-burgundy-dark), transparent)',
              padding: '2rem 2.5rem 1.5rem',
              color: 'var(--color-ivory)',
            }}
          >
            <span className="tagline-badge" style={{ backgroundColor: 'var(--color-burgundy)', borderColor: 'var(--color-gold)' }}>
              {venue.type}
            </span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--color-ivory)', fontFamily: 'var(--font-serif)', marginTop: '0.4rem' }}>
              {venue.name}
            </h2>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--color-gold)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> {venue.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} /> {venue.capacity}
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-burgundy)' }}>
            About The Estate
          </h3>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--color-charcoal-muted)', marginBottom: '2rem' }}>
            {venue.description}
          </p>

          <h4 style={{ fontSize: '0.9rem', letterSpacing: '0.15em', marginBottom: '1rem', color: 'var(--color-burgundy)' }}>
            VENUE HIGHLIGHTS & AMENITIES
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '2.5rem' }}>
            {venue.highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-ivory-dark)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '3px',
                  fontSize: '0.88rem',
                  color: 'var(--color-charcoal)',
                }}
              >
                <Check size={16} color="var(--color-gold-dark)" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border-subtle)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Exclusive Curation
              </span>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>
                Reserve via Elegant Moments Concierge
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenEnquiry();
              }}
              className="btn-gold"
              style={{ padding: '0.9rem 2rem' }}
            >
              <Sparkles size={16} /> INQUIRE ABOUT THIS VENUE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
