import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Pinterest, Youtube, Linkedin } from './Icons';
import { BRAND } from '../data/content';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-burgundy-dark)',
        color: 'var(--color-ivory)',
        paddingTop: '3.5rem',
        paddingBottom: '2rem',
        borderTop: '1px solid rgba(201, 168, 106, 0.25)',
      }}
    >
      <div className="container-luxury" style={{ textAlign: 'center', maxWidth: '950px' }}>
        {/* Centered Luxury Logo & Tagline */}
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
          aria-label="Elegant Moments Home"
        >
          <img
            src="/logo-transparent.png"
            alt="Elegant Moments Wedding Planner & Management"
            style={{
              height: 'clamp(85px, 12vw, 115px)',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.4))',
              transition: 'transform 0.4s ease, filter 0.4s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.filter = 'drop-shadow(0 6px 20px rgba(201, 168, 106, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'drop-shadow(0 4px 15px rgba(0, 0, 0, 0.4))';
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.68rem',
              letterSpacing: '0.38em',
              color: 'var(--color-gold-light)',
              textTransform: 'uppercase',
              marginTop: '0.6rem',
              fontWeight: '500',
              opacity: 0.9,
            }}
          >
            Where Moments Become Memories
          </span>
        </Link>

        {/* 4 Essential Primary Links */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2.5rem',
            margin: '1.8rem 0 1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { name: 'About', path: '/about' },
            { name: 'Experiences', path: '/experiences' },
            { name: 'Services', path: '/services' },
            { name: 'Venues', path: '/venues' },
            { name: 'Journal', path: '/journal' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                color: 'rgba(250, 247, 240, 0.88)',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--color-gold)')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(250, 247, 240, 0.88)')}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Subtle Locations Line */}
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            letterSpacing: '0.3em',
            color: 'var(--color-gold-light)',
            opacity: 0.8,
            marginBottom: '1.8rem',
          }}
        >
          PARIS · MILAN · NEW YORK
        </div>

        {/* Expanded "Let's Connect" Social Media Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250, 247, 240, 0.6)' }}>
            LET'S CONNECT:
          </span>
          
          <a
            href={`https://${BRAND.instagram}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', letterSpacing: '0.1em', transition: 'opacity 0.2s ease' }}
          >
            <Instagram size={15} /> INSTAGRAM
          </a>

          <span style={{ color: 'rgba(201, 168, 106, 0.3)' }}>|</span>

          <a
            href="https://pinterest.com/elegantmoments"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', letterSpacing: '0.1em', transition: 'opacity 0.2s ease' }}
          >
            <Pinterest size={15} /> PINTEREST
          </a>

          <span style={{ color: 'rgba(201, 168, 106, 0.3)' }}>|</span>

          <a
            href="https://youtube.com/@elegantmoments"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', letterSpacing: '0.1em', transition: 'opacity 0.2s ease' }}
          >
            <Youtube size={15} /> YOUTUBE
          </a>

          <span style={{ color: 'rgba(201, 168, 106, 0.3)' }}>|</span>

          <a
            href="https://linkedin.com/company/elegantmoments"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', letterSpacing: '0.1em', transition: 'opacity 0.2s ease' }}
          >
            <Linkedin size={15} /> LINKEDIN
          </a>

          <span style={{ color: 'rgba(201, 168, 106, 0.3)' }}>|</span>

          <a
            href="mailto:concierge@elegantmoments.com"
            style={{ color: 'var(--color-gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', letterSpacing: '0.1em', transition: 'opacity 0.2s ease' }}
          >
            <Mail size={15} /> EMAIL
          </a>
        </div>

        {/* Thin Gold Divider */}
        <div style={{ height: '1px', backgroundColor: 'rgba(201, 168, 106, 0.2)', margin: '0 auto 1.5rem', maxWidth: '600px' }} />

        {/* Minimal Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.8rem',
            fontSize: '0.75rem',
            color: 'rgba(250, 247, 240, 0.45)',
            letterSpacing: '0.05em',
          }}
        >
          <div>© {new Date().getFullYear()} Elegant Moments. All Rights Reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Link to="/privacy" style={{ color: 'rgba(250, 247, 240, 0.5)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <span style={{ color: 'rgba(201, 168, 106, 0.4)', fontSize: '0.7rem' }}>|</span>
            <Link to="/terms" style={{ color: 'rgba(250, 247, 240, 0.5)', textDecoration: 'none' }}>
              Terms of Experience
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
