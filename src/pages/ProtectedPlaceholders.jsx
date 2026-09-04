import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BasePlaceholder = ({ title, roleName, roleBadgeColor, description }) => {
  const { user, logout } = useAuth();

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '80vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <span style={{ backgroundColor: roleBadgeColor || 'var(--color-burgundy)', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '4px 12px', borderRadius: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {roleName} Protected Route
            </span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', marginTop: '10px', marginBottom: '0' }}>
              {title}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Profile
            </Link>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Sign Out
            </button>
          </div>
        </div>

        <div style={{ background: '#FAF7F2', padding: '30px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '30px' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.3rem', marginBottom: '10px' }}>
            🔒 Route Authorization Verified Successfully
          </h3>
          <p style={{ color: '#555', lineHeight: 1.6, margin: 0 }}>
            Welcome, <strong>{user?.firstName} {user?.lastName}</strong>! You have successfully passed authentication and role-based authorization guards for <strong>{roleName}</strong> access.
          </p>
        </div>

        <div style={{ color: '#666', lineHeight: 1.6, marginBottom: '30px' }}>
          <p>{description}</p>
          <div style={{ background: '#FFFBEB', padding: '15px 20px', borderRadius: '6px', borderLeft: '4px solid var(--color-gold)', marginTop: '20px', fontSize: '0.9rem' }}>
            📌 <strong>Milestone 2.2 Scope Notice:</strong> Full interactive dashboard capabilities, analytics, tools, and operational workflows will be built in subsequent milestones.
          </div>
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#888' }}>
            Authenticated ID: {user?.id}
          </span>
          <Link to="/" style={{ color: 'var(--color-burgundy)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export const ClientDashboardPlaceholder = () => (
  <BasePlaceholder
    title="Client / Couple Portal Foundation"
    roleName="Client"
    roleBadgeColor="#581C25"
    description="This portal foundation is reserved for client couples planning their luxury wedding with Elegant Moments. In future modules, clients will track wedding timelines, review proposals, manage budgets, communicate with assigned planners, and select vendor packages."
  />
);

export const PlannerDashboardPlaceholder = () => (
  <BasePlaceholder
    title="Wedding Planner Portal Foundation"
    roleName="Planner"
    roleBadgeColor="#1E3A8A"
    description="This portal foundation is designed for certified Elegant Moments wedding planners. Assigned planners will oversee client wedding rosters, manage vendor allocations, construct proposals, and monitor consultation requests."
  />
);

export const VendorDashboardPlaceholder = () => (
  <BasePlaceholder
    title="Partner Vendor Portal Foundation"
    roleName="Vendor"
    roleBadgeColor="#065F46"
    description="This portal foundation serves verified vendor partners (venues, photographers, florists, caterers). Vendors will publish service packages, respond to wedding RFPs, manage bookings, and communicate with planners."
  />
);

export const AdminDashboardPlaceholder = () => (
  <BasePlaceholder
    title="System Admin Portal Foundation"
    roleName="Admin"
    roleBadgeColor="#7C2D12"
    description="This portal foundation provides administrative oversight for Elegant Moments operations, user account management, enquiry triage, vendor verification, and system configuration."
  />
);

export const SuperAdminDashboardPlaceholder = () => (
  <BasePlaceholder
    title="Super Admin Portal Foundation"
    roleName="Super Admin"
    roleBadgeColor="#4C1D95"
    description="This high-privilege portal foundation provides full system governance, role assignment management, platform audit logs, security key management, and database oversight."
  />
);
