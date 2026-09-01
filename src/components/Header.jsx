import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  ChevronRight,
  Phone,
  Instagram,
  Facebook,
  Pinterest,
  WhatsApp,
  Sparkles,
} from './Icons';

export default function Header({ onOpenEnquiry }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawer or search is open
  useEffect(() => {
    if (isDrawerOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, isSearchOpen]);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Navigation Items matching Image 2
  const menuItems = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'SERVICES', path: '/services', hasArrow: true },
    { name: 'EXPERIENCES', path: '/experiences' },
    { name: 'VENUES', path: '/venues' },
    { name: 'PORTFOLIO', path: '/portfolio' },
    { name: 'STORIES', path: '/stories' },
    { name: 'JOURNAL', path: '/journal' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    setIsSearchOpen(false);
    setSearchQuery('');
    if (q.includes('service') || q.includes('plan')) {
      navigate('/services');
    } else if (q.includes('venue') || q.includes('como')) {
      navigate('/venues');
    } else if (q.includes('story') || q.includes('stories')) {
      navigate('/stories');
    } else if (q.includes('journal') || q.includes('blog')) {
      navigate('/journal');
    } else if (q.includes('contact') || q.includes('book')) {
      navigate('/contact');
    } else {
      navigate('/portfolio');
    }
  };

  return (
    <>
      {/* 1. TOP NAVBAR (MATCHING IMAGE 1) */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          backgroundColor: '#3B161B', // Deep Burgundy as in Image 1
          borderBottom: '1px solid rgba(201, 168, 106, 0.25)',
          boxShadow: isScrolled
            ? '0 10px 30px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.4s ease',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="container-luxury"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Left Actions: MENU | SEARCH */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
            }}
          >
            {/* Menu Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-ivory)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: '500',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                padding: '0.4rem 0',
                transition: 'color 0.3s ease',
              }}
              className="nav-btn-hover"
              aria-label="Open Menu Drawer"
            >
              <Menu size={20} color="var(--color-gold-light)" />
              <span>MENU</span>
            </button>

            {/* Vertical Divider */}
            <div
              style={{
                width: '1px',
                height: '22px',
                backgroundColor: 'rgba(201, 168, 106, 0.35)',
                margin: '0 0.5rem',
              }}
            />

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-ivory)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: '500',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                padding: '0.4rem 0',
                transition: 'color 0.3s ease',
              }}
              className="nav-btn-hover"
              aria-label="Search Site"
            >
              <Search size={18} color="var(--color-gold-light)" />
              <span className="search-btn-text">SEARCH</span>
            </button>
          </div>

          {/* Center Brand Logo (Image 1) */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.25rem, 2.2vw, 1.7rem)',
                fontWeight: '400',
                color: 'var(--color-ivory-pure)',
                letterSpacing: '0.14em',
                lineHeight: 1.05,
                textTransform: 'uppercase',
              }}
            >
              ELEGANT MOMENTS
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.5rem, 0.8vw, 0.62rem)',
                letterSpacing: '0.34em',
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                fontWeight: '500',
                marginTop: '0.2rem',
              }}
            >
              LUXURY WEDDING & EVENTS
            </span>
          </Link>

          {/* Right Action: BEGIN YOUR STORY CTA Button */}
          <div>
            <button
              onClick={onOpenEnquiry}
              style={{
                backgroundColor: 'var(--color-gold)',
                color: '#1A0F12',
                border: 'none',
                padding: '0.72rem 1.6rem',
                borderRadius: '2px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
              className="btn-story-hover"
            >
              BEGIN YOUR STORY
            </button>
          </div>
        </div>
      </header>

      {/* 2. SLIDE-OUT DRAWER NAVIGATION (MATCHING IMAGE 2) */}
      {/* Dark Overlay Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 10001,
          opacity: isDrawerOpen ? 1 : 0,
          pointerEvents: isDrawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Off-Canvas Left Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '380px',
          maxWidth: '86vw',
          height: '100vh',
          backgroundColor: 'var(--color-ivory)', // Off-white ivory background as in Image 2
          color: 'var(--color-charcoal)',
          zIndex: 10002,
          boxShadow: '12px 0 45px rgba(0, 0, 0, 0.4)',
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
        }}
      >
        {/* Drawer Header (Logo + Close X Button) */}
        <div>
          <div
            style={{
              padding: '1.8rem 2rem 1.4rem 2rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(41, 38, 38, 0.08)',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.45rem',
                  color: 'var(--color-burgundy)',
                  letterSpacing: '0.12em',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  fontWeight: '400',
                }}
              >
                ELEGANT<br />MOMENTS
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.56rem',
                  letterSpacing: '0.3em',
                  color: 'var(--color-gold-dark)',
                  textTransform: 'uppercase',
                  marginTop: '0.35rem',
                  fontWeight: '600',
                }}
              >
                LUXURY WEDDING & EVENTS
              </span>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-burgundy)',
                cursor: 'pointer',
                padding: '0.3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease',
              }}
              aria-label="Close Navigation"
            >
              <X size={24} color="var(--color-burgundy)" />
            </button>
          </div>

          {/* Drawer Menu Items List */}
          <nav style={{ padding: '0.5rem 0' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsDrawerOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.05rem 2rem',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? '600' : '400',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: isActive
                      ? 'var(--color-gold-dark)'
                      : 'var(--color-charcoal)',
                    borderBottom: '1px solid rgba(41, 38, 38, 0.06)',
                    backgroundColor: isActive
                      ? 'rgba(201, 168, 106, 0.06)'
                      : 'transparent',
                    transition: 'all 0.25s ease',
                  }}
                  className="drawer-item-hover"
                >
                  <span>{item.name}</span>
                  {item.hasArrow && (
                    <ChevronRight
                      size={16}
                      color={
                        isActive
                          ? 'var(--color-gold-dark)'
                          : 'var(--color-charcoal-muted)'
                      }
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Footer (Phone Pill + Social Icons) */}
        <div
          style={{
            padding: '1.5rem 2rem 2.2rem 2rem',
            borderTop: '1px solid rgba(41, 38, 38, 0.08)',
            backgroundColor: 'var(--color-ivory)',
          }}
        >
          {/* Call Pill Button (Matching Image 2: +91 98765 43210) */}
          <a
            href="tel:+919876543210"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1.2rem',
              border: '1px solid var(--color-gold)',
              borderRadius: '3px',
              color: 'var(--color-gold-dark)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.84rem',
              fontWeight: '600',
              letterSpacing: '0.12em',
              width: 'fit-content',
              marginBottom: '1.6rem',
              backgroundColor: 'rgba(201, 168, 106, 0.05)',
              transition: 'all 0.3s ease',
            }}
            className="phone-pill-hover"
          >
            <Phone size={16} color="var(--color-gold-dark)" />
            <span>+91 98765 43210</span>
          </a>

          {/* Social Icons Row (Instagram, Facebook, Pinterest, WhatsApp) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="Pinterest"
            >
              <Pinterest size={20} />
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="WhatsApp"
            >
              <WhatsApp size={20} />
            </a>
          </div>
        </div>
      </aside>

      {/* 3. INTERACTIVE SEARCH OVERLAY MODAL */}
      {isSearchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26, 15, 18, 0.96)',
            backdropFilter: 'blur(16px)',
            zIndex: 10003,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.3s ease forwards',
          }}
        >
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'none',
              border: 'none',
              color: 'var(--color-ivory)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            aria-label="Close Search"
          >
            <X size={28} color="var(--color-gold)" />
          </button>

          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.72rem',
                letterSpacing: '0.3em',
                color: 'var(--color-gold)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              EXPLORE ELEGANT MOMENTS ATELIER
            </span>

            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '2px solid var(--color-gold)',
                  paddingBottom: '0.8rem',
                }}
              >
                <Search size={26} color="var(--color-gold)" style={{ marginRight: '1rem' }} />
                <input
                  type="text"
                  placeholder="Search experiences, venues, portfolio, stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--color-ivory-pure)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
                    fontWeight: '300',
                  }}
                />
              </div>
            </form>

            <div
              style={{
                marginTop: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(250, 247, 240, 0.6)',
                  textTransform: 'uppercase',
                }}
              >
                POPULAR:
              </span>
              {[
                { tag: 'LUXURY WEDDINGS', path: '/services' },
                { tag: 'LAKE COMO', path: '/venues' },
                { tag: 'DESTINATION', path: '/experiences' },
                { tag: 'PORTFOLIO', path: '/portfolio' },
                { tag: 'JOURNAL', path: '/journal' },
              ].map((item) => (
                <button
                  key={item.tag}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(item.path);
                  }}
                  style={{
                    background: 'rgba(201, 168, 106, 0.12)',
                    border: '1px solid rgba(201, 168, 106, 0.3)',
                    color: 'var(--color-ivory)',
                    padding: '0.45rem 1rem',
                    borderRadius: '50px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.15em',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                  className="tag-btn-hover"
                >
                  {item.tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Component Styles & Hover Micro-interactions */}
      <style>{`
        .nav-btn-hover:hover {
          color: var(--color-gold) !important;
        }
        .btn-story-hover:hover {
          background-color: #DFCA9B !important;
          transform: translateY(-1px);
        }
        .drawer-item-hover:hover {
          color: var(--color-gold-dark) !important;
          padding-left: 2.3rem !important;
          background-color: rgba(201, 168, 106, 0.08) !important;
        }
        .phone-pill-hover:hover {
          background-color: var(--color-gold) !important;
          color: #1A0F12 !important;
        }
        .social-icon-hover:hover {
          color: var(--color-gold-dark) !important;
          transform: translateY(-2px);
        }
        .tag-btn-hover:hover {
          background-color: var(--color-gold) !important;
          color: #1A0F12 !important;
        }
        @media (max-width: 640px) {
          .search-btn-text {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
