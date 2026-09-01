import React from 'react';
import { X, MapPin, Sparkles } from './Icons';

export default function PortfolioModal({ item, onClose, onOpenEnquiry }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backgroundColor: 'rgba(20, 10, 12, 0.92)' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1000px',
          backgroundColor: 'var(--color-burgundy-dark)',
          color: 'var(--color-ivory)',
          border: '1px solid var(--color-gold)',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.6)',
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '520px' }} className="portfolio-modal-grid">
          {/* Main Image View */}
          <div style={{ position: 'relative', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '70vh' }}
            />
          </div>

          {/* Details Sidebar */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="tagline-badge" style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)', marginBottom: '1rem' }}>
                {item.category}
              </span>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--color-ivory)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>
                {item.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <MapPin size={16} /> {item.location}
              </div>
              <p style={{ fontSize: '1rem', color: 'rgba(250, 247, 240, 0.85)', lineHeight: '1.7', fontStyle: 'italic' }}>
                "{item.caption}"
              </p>
            </div>

            <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(201, 168, 106, 0.2)' }}>
              <button
                onClick={() => {
                  onClose();
                  onOpenEnquiry();
                }}
                className="btn-gold"
                style={{ width: '100%' }}
              >
                <Sparkles size={16} /> RECREATE THIS LOOK
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .portfolio-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
