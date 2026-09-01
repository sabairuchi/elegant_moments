import React from 'react';
import { Sparkles } from '../components/Icons';

export default function TermsOfService() {
  return (
    <div style={{ paddingTop: '5rem', backgroundColor: 'var(--color-ivory)', minHeight: '100vh' }}>
      {/* Editorial Header */}
      <section className="section-padding bg-ivory-dark" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury" style={{ maxWidth: '850px' }}>
          <div className="tagline-badge" style={{ marginBottom: '1.2rem' }}>
            TERMS OF EXPERIENCE
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
            Terms & Conditions
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.8' }}>
            Governing guidelines for engaging Elegant Moments Haute Event Atelier for wedding planning, spatial design, and destination production.
          </p>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '1rem' }}>
            Effective Date: August 31, 2026
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="section-padding">
        <div className="container-luxury" style={{ maxWidth: '850px', color: 'var(--color-charcoal)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', lineHeight: '1.85', fontSize: '1.02rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                1. Engagement & Production Scope
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                These Terms & Conditions govern your relationship with Elegant Moments. Engagement for luxury wedding planning, destination production, or event design services is formalized via a customized Master Production Agreement outlining specific dates, deliverables, and financial schedules.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                2. Calendar Scarcity & Retainers
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                To maintain haute-couture production quality, Elegant Moments accepts a maximum of 12 full-scope weddings annually. Celebration dates are reserved exclusively upon execution of the agreement and receipt of the initial design retainer.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                3. Vendor & Artisan Coordination
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                As your creative producer, Elegant Moments curates and oversees third-party master artisans (florists, Michelin chefs, lighting architects, musicians, and transport charters). While we enforce rigorous quality protocols, individual third-party service contracts remain subject to vendor policies.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                4. Intellectual Property & Visual Rights
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                All 3D spatial renderings, moodboards, custom stationery blueprints, and visual concept drawings developed by Elegant Moments remain the exclusive creative property of our atelier. Reproduction or distribution without written consent is strictly prohibited.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                5. Rescheduling & Force Majeure
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                In the event of unexpected global travel restrictions, severe weather, or unforeseen acts of force majeure, Elegant Moments will exercise all reasonable endeavors to transition production schedules to alternate agreed dates without penalty.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                6. Governing Law & Concierge Enquiries
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                These terms are governed in accordance with the laws of the State of New York and Italian Civil Code. For legal or contractual inquiries, please contact <a href="mailto:concierge@elegantmoments.com" style={{ color: 'var(--color-burgundy)', fontWeight: '600' }}>concierge@elegantmoments.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
