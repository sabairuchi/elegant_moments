import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronRight } from './Icons';

export default function Header({ onOpenEnquiry }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    {
      name: 'Experience',
      path: '/experiences',
      dropdown: [
        { name: 'Signature Collections', path: '/experiences' },
        { name: 'Destination Escapes', path: '/experiences' },
        { name: 'Intimate Estates', path: '/experiences' },
        { name: 'Our Story & Vision', path: '/about' },
      ],
    },
    {
      name: 'Services',
      path: '/services',
      dropdown: [
        { name: 'Luxury Wedding Planning', path: '/services' },
        { name: 'Destination Celebrations', path: '/experiences' },
      ],
    },
    {
      name: 'Portfolios',
      path: '/portfolio',
      dropdown: [
        { name: 'Visual Archive', path: '/portfolio' },
        { name: 'Wedding Stories', path: '/stories' },
        { name: 'Curated Venues', path: '/venues' },
      ],
    },
    {
      name: 'Journal',
      path: '/journal',
    },
    {
      name: 'Contact',
      path: '/contact',
    },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: isScrolled
            ? 'rgba(74, 32, 38, 0.96)'
            : 'rgba(74, 32, 38, 0.65)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(201, 168, 106, 0.2)',
          padding: isScrolled ? '0.9rem 0' : '1.3rem 0',
        }}
      >
        <div className="container-luxury" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Editorial Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: '400',
                color: 'var(--color-ivory)',
                letterSpacing: '0.12em',
                lineHeight: 1,
              }}
            >
              ELEGANT MOMENTS
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.6rem',
                letterSpacing: '0.35em',
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
              }}
            >
              Haute Event Atelier
            </span>
          </Link>

          {/* Minimal 5-Item Desktop Navigation with Luxury Dropdowns */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }} className="desktop-nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const hasDropdown = item.dropdown && item.dropdown.length > 0;

              return (
                <div
                  key={item.name}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    onClick={() => {
                      setActiveDropdown(null);
                      if (location.pathname === item.path) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? '600' : '400',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: isActive ? 'var(--color-gold)' : 'rgba(250, 247, 240, 0.9)',
                      textDecoration: 'none',
                      padding: '0.5rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.name}
                    {hasDropdown && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--color-gold)',
                          transform: activeDropdown === item.name ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        ▾
                      </span>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && activeDropdown === item.name && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--color-burgundy-dark)',
                        border: '1px solid var(--color-gold)',
                        padding: '1.2rem 1.5rem',
                        minWidth: '220px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        borderRadius: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        zIndex: 1001,
                        animation: 'fadeInSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                      }}
                    >
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.8rem',
                            letterSpacing: '0.1em',
                            color: 'rgba(250, 247, 240, 0.85)',
                            textDecoration: 'none',
                            transition: 'color 0.2s ease, transform 0.2s ease',
                            display: 'block',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--color-gold)';
                            e.target.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = 'rgba(250, 247, 240, 0.85)';
                            e.target.style.transform = 'translateX(0)';
                          }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Consultation CTA */}
            <button onClick={onOpenEnquiry} className="btn-gold" style={{ padding: '0.7rem 1.6rem', fontSize: '0.75rem' }}>
              <Sparkles size={14} /> BEGIN YOUR STORY
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--color-ivory)', cursor: 'pointer', display: 'none', padding: '0.5rem' }}
            className="mobile-hamburger"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'var(--color-burgundy-dark)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2.5rem',
            animation: 'fadeIn 0.3s ease forwards',
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: '1px solid var(--color-gold)',
              color: 'var(--color-ivory)',
              padding: '0.5rem',
              borderRadius: '50%',
            }}
          >
            <X size={24} />
          </button>

          <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '2rem' }}>
            ELEGANT MOMENTS ATELIER
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  color: 'var(--color-ivory)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(201, 168, 106, 0.15)',
                  paddingBottom: '0.6rem',
                }}
              >
                <span>{item.name}</span>
                <ChevronRight size={20} color="var(--color-gold)" />
              </Link>
            ))}
          </div>

          <button onClick={() => { setMobileMenuOpen(false); onOpenEnquiry(); }} className="btn-gold" style={{ padding: '1.1rem', width: '100%' }}>
            <Sparkles size={16} /> BEGIN YOUR STORY
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
}
