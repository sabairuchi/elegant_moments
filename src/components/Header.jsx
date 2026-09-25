import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  Instagram,
  Facebook,
  Pinterest,
  WhatsApp,
} from './Icons';

export default function Header({ onOpenEnquiry }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef(null);

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Close popovers on route change
  useEffect(() => {
    setIsDrawerOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
    setSearchQuery('');
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Public Menu Items
  const publicMenuItems = [
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

  // Helper to determine main role dashboard route
  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'client') return '/dashboard';
    if (user.role === 'planner') return '/planner';
    if (user.role === 'vendor') return '/vendor';
    if (user.role === 'admin' || user.role === 'super_admin') return '/admin/users';
    return '/profile';
  };

  // Role-Specific Management Items for MENU Drawer
  const getRoleMenuItems = () => {
    if (!isAuthenticated || !user) return [];

    if (user.role === 'super_admin' || user.role === 'admin') {
      return [
        { name: 'DASHBOARD', path: '/admin/users' },
        { name: 'USERS', path: '/admin/users' },
        { name: 'ENQUIRIES', path: '/admin/enquiries' },
        { name: 'CONSULTATIONS', path: '/admin/consultations' },
        { name: 'WEDDINGS', path: '/admin/weddings' },
        { name: 'SERVICES', path: '/admin/services' },
        { name: 'VENUES', path: '/admin/venues' },
        { name: 'PROPOSALS', path: '/proposals' },
        { name: 'BOOKINGS', path: '/bookings' },
      ];
    }

    if (user.role === 'client') {
      return [
        { name: 'MY DASHBOARD', path: '/dashboard' },
        { name: 'MY WEDDING', path: '/dashboard/wedding' },
        { name: 'MY ENQUIRIES', path: '/dashboard/enquiries' },
        { name: 'MY CONSULTATIONS', path: '/dashboard/enquiries' },
        { name: 'MY PROPOSALS', path: '/proposals' },
        { name: 'MY BOOKINGS', path: '/bookings' },
      ];
    }

    if (user.role === 'planner') {
      return [
        { name: 'PLANNER PORTAL', path: '/planner' },
        { name: 'PROPOSALS', path: '/proposals' },
        { name: 'BOOKINGS', path: '/bookings' },
        { name: 'MY PROFILE', path: '/profile' },
      ];
    }

    if (user.role === 'vendor') {
      return [
        { name: 'VENDOR PORTAL', path: '/vendor' },
        { name: 'PROPOSALS', path: '/proposals' },
        { name: 'BOOKINGS', path: '/bookings' },
        { name: 'MY PROFILE', path: '/profile' },
      ];
    }

    return [];
  };

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

  const formatRoleLabel = (role) => {
    if (!role) return '';
    return role.replace('_', ' ').toUpperCase();
  };

  return (
    <>
      {/* 1. TOP NAVBAR */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          backgroundColor: '#3B161B', // Deep Burgundy
          borderBottom: 'none',
          boxShadow: isScrolled
            ? '0 10px 30px rgba(0, 0, 0, 0.4)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.4s ease',
          height: isScrolled ? '80px' : '96px',
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

          {/* Center Brand Logo */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem 0',
            }}
            aria-label="Elegant Moments Home"
          >
            <img
              src="/logo-transparent.png?v=2"
              alt="Elegant Moments Luxury Wedding Logo"
              style={{
                height: isScrolled ? 'clamp(62px, 7.5vh, 72px)' : 'clamp(76px, 9.5vh, 88px)',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.5))',
                transition: 'all 0.35s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.filter = 'drop-shadow(0 4px 16px rgba(201, 168, 106, 0.5))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.5))';
              }}
            />
          </Link>

          {/* Right Action: Auth / Compact Profile Dropdown + BEGIN YOUR STORY Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {isAuthenticated ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                {/* Compact Profile Control */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: 'var(--color-ivory)',
                    background: 'rgba(212,175,55,0.12)',
                    border: '1px solid rgba(212,175,55,0.35)',
                    padding: '0.42rem 0.85rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.78rem',
                    letterSpacing: '0.12em',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                  className="nav-btn-hover"
                  aria-expanded={isUserMenuOpen}
                  aria-label="User Account Menu"
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#22C55E',
                      boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
                    }}
                  />
                  <span>{user.firstName || 'ACCOUNT'}</span>
                  <ChevronDown size={14} color="var(--color-gold-light)" />
                </button>

                {/* Compact Profile Popover Dropdown */}
                {isUserMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: '240px',
                      backgroundColor: '#2A1014',
                      border: '1px solid rgba(201, 168, 106, 0.4)',
                      borderRadius: '4px',
                      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
                      padding: '0.8rem 0',
                      zIndex: 1005,
                      animation: 'fadeIn 0.2s ease forwards',
                    }}
                  >
                    {/* Profile Header Block */}
                    <div
                      style={{
                        padding: '0.6rem 1.2rem 0.8rem 1.2rem',
                        borderBottom: '1px solid rgba(201, 168, 106, 0.2)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '0.95rem',
                          color: 'var(--color-ivory)',
                          fontWeight: '600',
                          marginBottom: '0.2rem',
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.58rem',
                          letterSpacing: '0.18em',
                          fontWeight: '700',
                          color: 'var(--color-gold)',
                          backgroundColor: 'rgba(201, 168, 106, 0.15)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '2px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {formatRoleLabel(user.role)}
                      </div>
                    </div>

                    {/* Links */}
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1.2rem',
                        color: 'var(--color-ivory)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.12em',
                        transition: 'background 0.2s ease',
                      }}
                      className="dropdown-item-hover"
                    >
                      <User size={15} color="var(--color-gold-light)" />
                      <span>MY PROFILE</span>
                    </Link>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1.2rem',
                        color: 'var(--color-ivory)',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.12em',
                        transition: 'background 0.2s ease',
                      }}
                      className="dropdown-item-hover"
                    >
                      <ChevronRight size={15} color="var(--color-gold-light)" />
                      <span>DASHBOARD</span>
                    </Link>

                    <div
                      style={{
                        height: '1px',
                        backgroundColor: 'rgba(201, 168, 106, 0.2)',
                        margin: '0.4rem 0',
                      }}
                    />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.15em',
                        fontWeight: '600',
                        transition: 'background 0.2s ease',
                      }}
                      className="dropdown-item-hover"
                    >
                      LOGOUT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  color: 'var(--color-ivory)',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.18em',
                  fontWeight: '500',
                  padding: '0.4rem 0.6rem',
                }}
                className="nav-btn-hover"
              >
                SIGN IN
              </Link>
            )}

            <button
              onClick={onOpenEnquiry}
              style={{
                backgroundColor: 'var(--color-gold)',
                color: '#1A0F12',
                border: 'none',
                padding: '0.72rem 1.4rem',
                borderRadius: '2px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.73rem',
                fontWeight: '600',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
              className="btn-story-hover header-cta-btn"
            >
              BEGIN YOUR STORY
            </button>
          </div>
        </div>
      </header>

      {/* 2. SLIDE-OUT DRAWER NAVIGATION */}
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

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '380px',
          maxWidth: '88vw',
          height: '100vh',
          backgroundColor: 'var(--color-ivory)',
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
        {/* Drawer Header */}
        <div>
          <div
            style={{
              padding: '1.6rem 1.8rem 1.2rem 1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(41, 38, 38, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <img
                src="/logo-emblem.png?v=2"
                alt="Elegant Moments Crest"
                style={{ height: '58px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.15rem',
                    color: 'var(--color-burgundy)',
                    letterSpacing: '0.12em',
                    lineHeight: 1.1,
                    textTransform: 'uppercase',
                    fontWeight: '500',
                  }}
                >
                  ELEGANT<br />MOMENTS
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.5rem',
                    letterSpacing: '0.26em',
                    color: 'var(--color-gold-dark)',
                    textTransform: 'uppercase',
                    marginTop: '0.2rem',
                    fontWeight: '600',
                  }}
                >
                  LUXURY WEDDINGS
                </span>
              </div>
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

          {/* Role Management Menu Items (If Logged In) */}
          {isAuthenticated && getRoleMenuItems().length > 0 && (
            <div
              style={{
                padding: '0.8rem 0 0.4rem 0',
                borderBottom: '1px solid rgba(41, 38, 38, 0.08)',
                backgroundColor: 'rgba(59, 22, 27, 0.03)',
              }}
            >
              <div
                style={{
                  padding: '0.4rem 1.8rem',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  letterSpacing: '0.25em',
                  color: 'var(--color-gold-dark)',
                  textTransform: 'uppercase',
                }}
              >
                {user.role === 'client' ? 'MY PORTAL' : `${formatRoleLabel(user.role)} MANAGEMENT`}
              </div>
              <nav>
                {getRoleMenuItems().map((item) => {
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
                        padding: '0.75rem 1.8rem',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.8rem',
                        fontWeight: isActive ? '600' : '500',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: isActive ? 'var(--color-burgundy)' : 'var(--color-charcoal)',
                        backgroundColor: isActive ? 'rgba(201, 168, 106, 0.12)' : 'transparent',
                        transition: 'all 0.25s ease',
                      }}
                      className="drawer-item-hover"
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={14} color="var(--color-gold-dark)" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Main Atelier Website Links */}
          <nav style={{ padding: '0.5rem 0' }}>
            <div
              style={{
                padding: '0.5rem 1.8rem 0.2rem 1.8rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.62rem',
                fontWeight: '700',
                letterSpacing: '0.25em',
                color: 'rgba(41, 38, 38, 0.4)',
                textTransform: 'uppercase',
              }}
            >
              EXPLORE ATELIER
            </div>
            {publicMenuItems.map((item) => {
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
                    padding: '0.85rem 1.8rem',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? '600' : '400',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: isActive
                      ? 'var(--color-gold-dark)'
                      : 'var(--color-charcoal)',
                    borderBottom: '1px solid rgba(41, 38, 38, 0.05)',
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

        {/* Drawer Bottom Footer */}
        <div
          style={{
            padding: '1.2rem 1.8rem 1.8rem 1.8rem',
            borderTop: '1px solid rgba(41, 38, 38, 0.08)',
            backgroundColor: 'var(--color-ivory)',
          }}
        >
          {isAuthenticated ? (
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                logout();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.65rem 1rem',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '3px',
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.04)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.18em',
                marginBottom: '1.2rem',
                transition: 'all 0.25s ease',
              }}
            >
              LOGOUT ({user.firstName?.toUpperCase()})
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <Link
                to="/login"
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.6rem 0',
                  border: '1px solid var(--color-burgundy)',
                  color: 'var(--color-burgundy)',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.15em',
                  fontWeight: '600',
                }}
              >
                SIGN IN
              </Link>
              <Link
                to="/register"
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.6rem 0',
                  backgroundColor: 'var(--color-burgundy)',
                  color: 'var(--color-ivory)',
                  textDecoration: 'none',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.15em',
                  fontWeight: '600',
                }}
              >
                REGISTER
              </Link>
            </div>
          )}

          {/* Call Pill Button */}
          <a
            href="tel:+919876543210"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.7rem 1.2rem',
              border: '1px solid var(--color-gold)',
              borderRadius: '3px',
              color: 'var(--color-gold-dark)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: '600',
              letterSpacing: '0.12em',
              width: 'fit-content',
              marginBottom: '1.2rem',
              backgroundColor: 'rgba(201, 168, 106, 0.05)',
              transition: 'all 0.3s ease',
            }}
            className="phone-pill-hover"
          >
            <Phone size={15} color="var(--color-gold-dark)" />
            <span>+91 98765 43210</span>
          </a>

          {/* Social Icons Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.4rem',
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
              <Instagram size={19} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="Facebook"
            >
              <Facebook size={19} />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="Pinterest"
            >
              <Pinterest size={19} />
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-burgundy)', transition: 'color 0.2s ease' }}
              className="social-icon-hover"
              aria-label="WhatsApp"
            >
              <WhatsApp size={19} />
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
          padding-left: 2.1rem !important;
          background-color: rgba(201, 168, 106, 0.08) !important;
        }
        .dropdown-item-hover:hover {
          background-color: rgba(201, 168, 106, 0.15) !important;
          color: var(--color-gold-light) !important;
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
        @media (max-width: 768px) {
          .header-cta-btn {
            display: none;
          }
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
