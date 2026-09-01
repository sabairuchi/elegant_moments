import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, X } from '../components/Icons';
import { SERVICES } from '../data/content';

export default function Services({ onOpenEnquiry }) {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div style={{ paddingTop: '74px', backgroundColor: 'var(--color-ivory)' }}>
      {/* 4. SERVICES — ASYMMETRIC EDITORIAL HERO */}
      <section className="section-padding bg-ivory-dark" style={{ borderBottom: '1px solid var(--color-border-subtle)', position: 'relative' }}>
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            {/* Vertical Decorative Typography Sidebar */}
            <div className="vertical-text-sidebar" style={{ alignSelf: 'center' }}>
              PLANNING • DESIGN • PRODUCTION
            </div>

            {/* Typography Content */}
            <div style={{ paddingRight: '1rem' }}>
              <span className="eyebrow-label" style={{ marginBottom: '1.2rem' }}>
                OUR EXPERTISE
              </span>

              <h1
                style={{
                  fontSize: 'clamp(2.8rem, 5vw, 4.8rem)',
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-burgundy)',
                  lineHeight: '1.05',
                  marginBottom: '1.5rem',
                  fontWeight: '400',
                }}
              >
                THE ART OF<br />EFFORTLESS CELEBRATION
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.85', fontWeight: '300' }}>
                "From the first idea to the final detail, every element is thoughtfully orchestrated."
              </p>
            </div>

            {/* Large Asymmetrical Hero Image Card */}
            <div className="image-reveal-wrapper" style={{ height: '480px', borderRadius: '2px', border: '1px solid var(--color-gold)' }}>
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Haute Couture Event Design"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            {SERVICES.map((s, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '4rem',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-ivory-pure)',
                    padding: '2.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '3px',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div className="image-reveal-wrapper" style={{ height: '380px', borderRadius: '2px', order: isEven ? 1 : 2 }}>
                    <img src={s.image} alt={s.title} />
                  </div>

                  <div style={{ order: isEven ? 2 : 1 }}>
                    <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
                      SERVICE PILLAR {idx + 1}
                    </span>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>
                      {s.title}
                    </h2>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold-dark)', fontStyle: 'italic', fontWeight: '400', marginBottom: '1.2rem' }}>
                      {s.subtitle}
                    </h3>
                    <p style={{ fontSize: '1rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                      {s.description}
                    </p>

                    <h4 style={{ fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '0.8rem', color: 'var(--color-burgundy)' }}>
                      KEY INCLUSIONS & DELIVERABLES:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                      {s.features.slice(0, 4).map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--color-charcoal)' }}>
                          <Check size={16} color="var(--color-gold-dark)" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedService(s)} className="btn-outline">
                        VIEW ALL INCLUSIONS
                      </button>
                      <button onClick={onOpenEnquiry} className="btn-gold">
                        <Sparkles size={14} /> INQUIRE NOW
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Inclusion Drawer Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2.5rem' }}>
            <button
              onClick={() => setSelectedService(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-burgundy)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
              COMPLETE SERVICE SCOPE
            </span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-burgundy)', marginBottom: '0.4rem' }}>
              {selectedService.title}
            </h2>
            <p style={{ color: 'var(--color-gold-dark)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              {selectedService.subtitle}
            </p>

            <p style={{ fontSize: '1rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
              {selectedService.description}
            </p>

            <h4 style={{ fontSize: '0.85rem', letterSpacing: '0.15em', marginBottom: '1rem', color: 'var(--color-burgundy)' }}>
              FULL LIST OF SERVICE DELIVERABLES
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', marginBottom: '2.5rem' }}>
              {selectedService.features.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem 1.2rem',
                    backgroundColor: 'var(--color-ivory-dark)',
                    borderLeft: '3px solid var(--color-gold)',
                    fontSize: '0.92rem',
                    color: 'var(--color-charcoal)',
                  }}
                >
                  {feat}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setSelectedService(null)} className="btn-outline">
                CLOSE
              </button>
              <button
                onClick={() => {
                  setSelectedService(null);
                  onOpenEnquiry();
                }}
                className="btn-gold"
              >
                <Sparkles size={16} /> REQUEST SERVICE CONSULTATION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
