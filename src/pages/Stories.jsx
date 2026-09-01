import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, ArrowRight, X } from '../components/Icons';
import { WEDDING_STORIES } from '../data/content';

export default function Stories({ onOpenEnquiry }) {
  const [activeStory, setActiveStory] = useState(null);

  return (
    <div style={{ paddingTop: '74px', backgroundColor: 'var(--color-ivory)' }}>
      {/* 7. WEDDING STORIES — STORYTELLING MAGAZINE HERO (Layered Composition) */}
      <section className="section-padding bg-ivory-dark" style={{ borderBottom: '1px solid var(--color-border-subtle)', position: 'relative' }}>
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '5rem', alignItems: 'center' }}>
            {/* Left: Magazine Typography */}
            <div>
              <span className="eyebrow-label" style={{ marginBottom: '1.2rem' }}>
                REAL CELEBRATIONS
              </span>

              <h1
                style={{
                  fontSize: 'clamp(2.8rem, 5vw, 4.6rem)',
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-burgundy)',
                  lineHeight: '1.05',
                  marginBottom: '1.5rem',
                  fontWeight: '400',
                }}
              >
                EVERY LOVE STORY<br />DESERVES ITS OWN CHAPTER
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.85', marginBottom: '2.5rem', fontWeight: '300' }}>
                Go behind the scenes of our signature destination weddings across Lake Como, Paris, the Amalfi Coast, and Rajasthan.
              </p>

              <a href="#stories-feed" className="btn-gold">
                EXPLORE STORIES →
              </a>
            </div>

            {/* Right: Layered Image Composition */}
            <div style={{ position: 'relative', height: '480px' }}>
              {/* Primary Large Image */}
              <div
                className="image-reveal-wrapper"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '82%',
                  height: '82%',
                  borderRadius: '2px',
                  border: '1px solid var(--color-gold)',
                  boxShadow: 'var(--shadow-luxury)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                  alt="Lake Como Ceremony"
                />
              </div>

              {/* Smaller Overlapping Detail Image */}
              <div
                className="image-reveal-wrapper"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '52%',
                  height: '52%',
                  borderRadius: '2px',
                  border: '4px solid var(--color-ivory)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                  zIndex: 2,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80"
                  alt="Detail Floral Art"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Feed */}
      <section id="stories-feed" className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
            {WEDDING_STORIES.map((story, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={story.id}
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
                      height: '460px',
                      borderRadius: '2px',
                      order: isEven ? 1 : 2,
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <img src={story.image || story.heroImage} alt={story.title} />
                  </div>

                  <div style={{ order: isEven ? 2 : 1 }}>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-gold-dark)', fontSize: '0.85rem', marginBottom: '0.8rem', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={15} color="var(--color-gold)" /> {story.location}
                      </span>
                      {story.type && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={15} color="var(--color-gold)" /> {story.type}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '2.5rem', color: 'var(--color-burgundy)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                      {story.title}
                    </h2>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--color-burgundy-light)', fontStyle: 'italic', fontWeight: '400', marginBottom: '1.2rem' }}>
                      {story.couple || story.couples}
                    </h3>
                    <p style={{ fontSize: '1.05rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.8', marginBottom: '2rem' }}>
                      {story.summary || story.overview}
                    </p>

                    <button onClick={() => setActiveStory(story)} className="btn-primary">
                      READ FULL CHAPTER <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Reader Modal */}
      {activeStory && (
        <div className="modal-overlay" onClick={() => setActiveStory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '3rem' }}>
            <button
              onClick={() => setActiveStory(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-burgundy)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <span className="eyebrow-label" style={{ marginBottom: '0.5rem' }}>
              DESTINATION CASE STUDY
            </span>
            <h2 style={{ fontSize: '2.6rem', color: 'var(--color-burgundy)', marginBottom: '0.3rem' }}>
              {activeStory.title}
            </h2>
            <div style={{ color: 'var(--color-gold-dark)', fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {activeStory.couple || activeStory.couples} — {activeStory.location}
            </div>

            <div className="image-reveal-wrapper" style={{ height: '360px', marginBottom: '2rem', borderRadius: '2px' }}>
              <img src={activeStory.image || activeStory.heroImage} alt={activeStory.title} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-burgundy)', marginBottom: '0.8rem' }}>
              THE CELEBRATION VISION
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-charcoal-muted)', marginBottom: '2rem' }}>
              {activeStory.summary || activeStory.overview || activeStory.concept}
            </p>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
              PRODUCTION HIGHLIGHTS & BLUEPRINT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', marginBottom: '2.5rem' }}>
              {activeStory.highlights.map((h, i) => (
                <div key={i} style={{ padding: '1rem 1.2rem', backgroundColor: 'var(--color-ivory-dark)', borderLeft: '3px solid var(--color-gold)', fontSize: '0.95rem', color: 'var(--color-charcoal)' }}>
                  ✦ {h}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setActiveStory(null)} className="btn-outline">
                CLOSE CHAPTER
              </button>
              <button onClick={() => { setActiveStory(null); onOpenEnquiry(); }} className="btn-gold">
                <Sparkles size={16} /> PLAN SIMILAR CELEBRATION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
