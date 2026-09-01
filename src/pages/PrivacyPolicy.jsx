import React from 'react';
import { Shield, Sparkles } from '../components/Icons';

export default function PrivacyPolicy() {
  return (
    <div style={{ paddingTop: '5rem', backgroundColor: 'var(--color-ivory)', minHeight: '100vh' }}>
      {/* Editorial Header */}
      <section className="section-padding bg-ivory-dark" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury" style={{ maxWidth: '850px' }}>
          <div className="tagline-badge" style={{ marginBottom: '1.2rem' }}>
            <Shield size={14} /> PRIVACY & DISCRETION
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.8' }}>
            At Elegant Moments, absolute discretion, client privacy, and white-glove security are foundational to our luxury event curation.
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
                1. Our Commitment to Discretion
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                Elegant Moments ("we", "our", or "atelier") respects the strict privacy of our clients, guests, and dignitaries. Whether submitting a private enquiry or engaging our multi-day event production services, all information provided is treated with executive confidentiality.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                2. Information We Collect
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)', marginBottom: '0.8rem' }}>
                We collect personal information necessary to deliver bespoke event experiences, including:
              </p>
              <ul style={{ marginLeft: '1.5rem', color: 'var(--color-charcoal-muted)' }}>
                <li>Contact Information (Name, email address, telephone number, private residence or preferred correspondence address).</li>
                <li>Celebration Vision & Specifications (Event dates, guest counts, target investment budgets, location preferences, and aesthetic notes).</li>
                <li>Guest Concierge Details (Dietary requirements, hotel preferences, and transport logistics provided voluntarily for guest management).</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                3. Use of Information
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                Your information is strictly utilized to curate custom visual moodboards, coordinate with vetted tier-1 international artisans, process reservations, communicate project timelines, and deliver concierge services. We do not sell, lease, or monetize your personal data to third parties under any circumstances.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                4. Confidentiality & Non-Disclosure
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                For high-profile, celebrity, or dignitary celebrations, we routinely execute custom bilateral Non-Disclosure Agreements (NDAs). All personnel, production crews, and vendor partners bound to your event operate under strict confidentiality clauses regarding event dates, locations, attendee lists, and photography.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                5. Data Security & Storage
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                Client records are stored in encrypted, access-restricted databases. Technical measures are audited regularly to safeguard against unauthorized access, disclosure, or alteration.
              </p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                6. Contacting Our Atelier Privacy Lead
              </h2>
              <p style={{ color: 'var(--color-charcoal-muted)' }}>
                If you have questions regarding this Privacy Policy or wish to request data modification or erasure, please contact our concierge lead at <a href="mailto:concierge@elegantmoments.com" style={{ color: 'var(--color-burgundy)', fontWeight: '600' }}>concierge@elegantmoments.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
