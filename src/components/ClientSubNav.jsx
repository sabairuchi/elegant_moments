import React from 'react';
import { NavLink } from 'react-router-dom';

export default function ClientSubNav() {
  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    backgroundColor: '#fff',
    padding: '15px 20px',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    flexWrap: 'wrap',
  };

  const linkStyle = ({ isActive }) => ({
    padding: '8px 18px',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    color: isActive ? '#fff' : 'var(--color-espresso)',
    backgroundColor: isActive ? 'var(--color-burgundy)' : 'transparent',
    border: `1px solid ${isActive ? 'var(--color-burgundy)' : '#E5E7EB'}`,
  });

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '1px solid #eaeaea' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <nav style={navStyle}>
          <NavLink to="/dashboard" end style={linkStyle}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/wedding" style={linkStyle}>
            My Wedding
          </NavLink>
          <NavLink to="/dashboard/enquiries" style={linkStyle}>
            My Enquiries & Consultations
          </NavLink>
          <NavLink to="/client/services" style={linkStyle}>
            Browse Services
          </NavLink>
          <NavLink to="/client/venues" style={linkStyle}>
            Browse Venues
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
