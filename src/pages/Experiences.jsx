import React from 'react';
import { Sparkles, ArrowRight } from '../components/Icons';
import { EXPERIENCES, CINEMATIC_VIDEOS } from '../data/content';

export default function Experiences({ onOpenEnquiry }) {
  return (
    <div style={{ paddingTop: '74px', backgroundColor: 'var(--color-ivory)' }}>
      {/* 3. EXPERIENCES — IMMERSIVE HERO WITH VIDEO */}
      <section
        style={{
          position: 'relative',
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-burgundy-dark)',
          color: 'var(--color-ivory)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=90"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45) contrast(1.08)' }}
          >
            <source src={CINEMATIC_VIDEOS.destination} type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, var(--color-burgundy-dark), transparent 70%)' }} />
        </div>

        <div className="container-luxury" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '1000px', padding: '4rem 1.5rem' }}>
          <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
            CURATED EXPERIENCES
          </span>

          <h1
            style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.5rem)',
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.06em',
              lineHeight: '1.05',
              marginBottom: '1.5rem',
              fontWeight: '400',
            }}
          >
            CELEBRATIONS,<br />CRAFTED YOUR WAY
          </h1>

          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.15rem, 2vw, 1.6rem)', color: 'var(--color-gold)', fontStyle: 'italic', marginBottom: '2.5rem', fontWeight: '300' }}>
            "From intimate gatherings to extraordinary destination celebrations."
          </p>

          {/* Subtle Category Pill Links */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['WEDDINGS', 'DESTINATIONS', 'PRIVATE CELEBRATIONS'].map((cat, i) => (
              <span
                key={i}
                style={{
                  padding: '0.5rem 1.4rem',
                  border: '1px solid rgba(201, 168, 106, 0.4)',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ivory)',
                  backgroundColor: 'rgba(74, 32, 38, 0.4)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Collection Showcases */}
      <section className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            {EXPERIENCES.map((exp, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={exp.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '4rem',
                    alignItems: 'center',
                  }}
                >
                  <div
                    className="image-reveal-wrapper"
                    style={{
                      height: '420px',
                      borderRadius: '3px',
                      order: isEven ? 1 : 2,
                      border: '1px solid var(--color-gold)',
                    }}
                  >
                    <img src={exp.image} alt={exp.title} />
                  </div>

                  <div style={{ order: isEven ? 2 : 1 }}>
                    <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
                      {exp.category}
                    </span>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>
                      {exp.title}
                    </h2>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-gold-dark)', fontStyle: 'italic', fontWeight: '400', marginBottom: '1.2rem' }}>
                      "{exp.tagline}"
                    </h3>
                    <p style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                      {exp.description}
                    </p>

                    <button onClick={onOpenEnquiry} className="btn-gold">
                      <Sparkles size={16} /> PLAN THIS EXPERIENCE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
