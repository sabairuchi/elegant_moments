import React from 'react';
import { Sparkles, ArrowRight, Shield, Award, Heart, Eye } from '../components/Icons';
import { TEAM_MEMBERS } from '../data/content';

export default function About({ onOpenEnquiry }) {
  return (
    <div style={{ paddingTop: '5rem', backgroundColor: 'var(--color-ivory)' }}>
      {/* 2. ABOUT — EDITORIAL STORY HERO (Split Composition) */}
      <section className="section-padding bg-ivory-dark" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '5rem', alignItems: 'center' }}>
            {/* Left: Large Portrait/Editorial Image */}
            <div className="image-reveal-wrapper" style={{ height: '560px', borderRadius: '2px', border: '1px solid var(--color-gold)' }}>
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                alt="Haute Couture Wedding Editorial"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Right: Editorial Typography */}
            <div>
              <span className="eyebrow-label" style={{ marginBottom: '1.5rem' }}>
                THE ELEGANT MOMENTS STORY
              </span>

              <h1
                style={{
                  fontSize: 'clamp(2.8rem, 5.2vw, 4.8rem)',
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-burgundy)',
                  lineHeight: '1.05',
                  marginBottom: '1.8rem',
                  fontWeight: '400',
                }}
              >
                ARCHITECTS OF<br />EXTRAORDINARY MOMENTS
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.85', marginBottom: '2.5rem', fontWeight: '300' }}>
                Founded on the conviction that true luxury is deeply personal, emotional, and timeless. We compose living atmospheres that reflect your unique narrative.
              </p>

              <a href="#philosophy-section" className="btn-gold">
                DISCOVER OUR PHILOSOPHY →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story & Philosophy */}
      <section id="philosophy-section" className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
                OUR ORIGIN & HERITAGE
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', marginBottom: '1.5rem' }}>
                Where European Artistry Meets Global Vision
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--color-charcoal-muted)', marginBottom: '1.2rem' }}>
                Established in Paris and expanded across New York and Milan, <strong>Elegant Moments</strong> emerged from a desire to elevate wedding production beyond conventional templates.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--color-charcoal-muted)', marginBottom: '1.8rem' }}>
                We limit our production calendar to a select handful of celebrations each year. This intentional scarcity guarantees that every client receives our executive creative director’s undivided devotion, white-glove concierge care, and master-level spatial design.
              </p>

              <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-ivory-dark)', borderLeft: '4px solid var(--color-gold)', borderRadius: '2px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--color-burgundy)' }}>
                  "We don't simply plan events. We compose living atmospheres where emotion, light, and hospitality dissolve into timeless memories."
                </p>
                <div style={{ marginTop: '0.8rem', fontSize: '0.82rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold-dark)' }}>
                  — Genevieve Sterling, Founder
                </div>
              </div>
            </div>

            <div className="image-reveal-wrapper" style={{ height: '520px', borderRadius: '3px' }}>
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80"
                alt="Genevieve Sterling & Studio Team"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators Matrix */}
      <section className="section-padding bg-ivory-dark" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
            <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
              THE ELEGANT MOMENTS DIFFERENCE
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
              Why Discerning Couples Choose Us
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {[
              {
                icon: Shield,
                title: 'Strict Scarcity & Privacy',
                desc: 'We limit our calendar to 12 bespoke weddings per year to ensure absolute executive focus and confidentiality.',
              },
              {
                icon: Award,
                title: 'Haute-Couture Production',
                desc: 'Custom spatial blueprints, 3D renderings, and bespoke stationery crafted by master European artisans.',
              },
              {
                icon: Heart,
                title: 'White-Glove Guest Concierge',
                desc: 'Dedicated guest relations team managing international flight transfers, villa bookings, and VIP hospitality.',
              },
              {
                icon: Eye,
                title: 'Artistic & Sensory Focus',
                desc: 'Sculptural floral art, custom fragrance diffusions, acoustic soundscapes, and sommelier vintage pairings.',
              },
            ].map((diff, idx) => {
              const IconComp = diff.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-ivory)',
                    padding: '2.2rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '3px',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(201, 168, 106, 0.15)',
                      border: '1px solid var(--color-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.2rem',
                    }}
                  >
                    <IconComp size={22} color="var(--color-gold-dark)" />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--color-burgundy)', marginBottom: '0.75rem' }}>
                    {diff.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.6' }}>
                    {diff.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team / Creative Leadership */}
      <section className="section-padding">
        <div className="container-luxury">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
            <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
              MEET OUR MASTERS
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
              Creative Leadership & Producers
            </h2>
            <p style={{ color: 'var(--color-charcoal-muted)' }}>
              Passionate visionaries, stage architects, and hospitality concierges devoted to your peace of mind.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {TEAM_MEMBERS.map((member, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--color-ivory-pure)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div className="image-reveal-wrapper" style={{ height: '320px' }}>
                  <img src={member.image} alt={member.name} />
                </div>
                <div style={{ padding: '1.8rem' }}>
                  <span style={{ fontSize: '0.75rem', letterSpacing: '0.18em', color: 'var(--color-gold-dark)', textTransform: 'uppercase', fontWeight: '600' }}>
                    {member.role}
                  </span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--color-burgundy)', marginTop: '0.2rem', marginBottom: '0.8rem' }}>
                    {member.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.6' }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
