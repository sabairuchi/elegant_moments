import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Bookmark, Sparkles, CheckCircle } from '../components/Icons';

export default function Contact({ onOpenEnquiry }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    location: '',
    budget: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ paddingTop: '74px', backgroundColor: 'var(--color-ivory)' }}>
      {/* 9. CONTACT — EMOTIONAL ATELIER HERO (Deep Burgundy) */}
      <section
        style={{
          backgroundColor: 'var(--color-burgundy)',
          color: 'var(--color-ivory)',
          padding: '6.5rem 1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--color-gold)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container-luxury" style={{ maxWidth: '750px' }}>
          {/* Official Gold Brand Logo Emblem */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <img
              src="/logo-transparent.png"
              alt="Elegant Moments Logo"
              style={{
                height: '155px',
                width: 'auto',
                objectFit: 'contain',
                margin: '0 auto',
                filter: 'drop-shadow(0 6px 20px rgba(0, 0, 0, 0.5))',
              }}
            />
          </div>

          <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1.2rem' }}>
            YOUR CELEBRATION
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
            BEGIN YOUR STORY
          </h1>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', color: 'rgba(250, 247, 240, 0.88)', fontWeight: '300', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '580px', margin: '0 auto 2.5rem' }}>
            Tell us what you're dreaming of. We'll take care of the rest.
          </p>

          <button onClick={onOpenEnquiry} className="btn-gold" style={{ padding: '1.1rem 3rem', fontSize: '0.85rem' }}>
            TELL US YOUR STORY →
          </button>
        </div>
      </section>

      {/* Main Contact Form & Atelier Details */}
      <section className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '5rem' }}>
            {/* Direct Form */}
            <div>
              <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
                DIRECT ATELIER ENQUIRY
              </span>
              <h2 style={{ fontSize: '2.2rem', color: 'var(--color-burgundy)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                Private Consultation Request
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--color-charcoal-muted)', marginBottom: '2.5rem' }}>
                Please fill out the details of your celebration below. Our executive team will respond within 24 hours with private availability.
              </p>

              {submitted ? (
                <div style={{ padding: '3rem', backgroundColor: 'var(--color-ivory-dark)', border: '1px solid var(--color-gold)', borderRadius: '3px', textAlign: 'center' }}>
                  <CheckCircle size={48} color="var(--color-gold-dark)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>
                    Enquiry Submitted Successfully
                  </h3>
                  <p style={{ color: 'var(--color-charcoal-muted)', lineHeight: '1.7' }}>
                    Thank you, {formData.name}. Our executive director Genevieve Sterling will review your event parameters and contact you directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Victoria Sterling"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                    <div className="form-group">
                      <label className="form-label">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        required
                        placeholder="victoria@example.com"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">TELEPHONE *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                    <div className="form-group">
                      <label className="form-label">ESTIMATED EVENT DATE</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">DESIRED DESTINATION</label>
                      <input
                        type="text"
                        placeholder="e.g. Lake Como, Paris, Amalfi"
                        className="form-input"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">TARGET PRODUCTION BUDGET</label>
                    <select
                      className="form-select"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    >
                      <option value="">Select Target Investment Range</option>
                      <option value="$100k - $250k">$100,000 – $250,000</option>
                      <option value="$250k - $500k">$250,000 – $500,000</option>
                      <option value="$500k - $1M">$500,000 – $1,000,000</option>
                      <option value="$1M+">$1,000,000+ (Ultra Luxury)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">YOUR CELEBRATION VISION & NOTES</label>
                    <textarea
                      rows={5}
                      placeholder="Share your story, guest counts, aesthetic preferences, or special requests..."
                      className="form-textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-gold" style={{ width: '100%', padding: '1.1rem' }}>
                    SUBMIT PRIVATE ENQUIRY →
                  </button>
                </form>
              )}
            </div>

            {/* Atelier Contact Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div>
                <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
                  GLOBAL ATELIERS
                </span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--color-burgundy)', marginBottom: '1.2rem' }}>
                  International Presence
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ padding: '1.2rem', backgroundColor: 'var(--color-ivory-dark)', borderLeft: '3px solid var(--color-gold)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-burgundy)', fontSize: '1.05rem' }}>PARIS ATELIER</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)' }}>Place Vendôme, 75001 Paris, France</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', marginTop: '0.3rem' }}>paris@elegantmoments.com</div>
                  </div>

                  <div style={{ padding: '1.2rem', backgroundColor: 'var(--color-ivory-dark)', borderLeft: '3px solid var(--color-gold)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-burgundy)', fontSize: '1.05rem' }}>NEW YORK ATELIER</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)' }}>Madison Avenue, New York, NY 10021</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', marginTop: '0.3rem' }}>ny@elegantmoments.com</div>
                  </div>

                  <div style={{ padding: '1.2rem', backgroundColor: 'var(--color-ivory-dark)', borderLeft: '3px solid var(--color-gold)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--color-burgundy)', fontSize: '1.05rem' }}>MILAN ATELIER</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)' }}>Via Montenapoleone, 20121 Milano, Italy</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', marginTop: '0.3rem' }}>milan@elegantmoments.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
