import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [resendStatus, setResendStatus] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  if (!user) {
    return (
      <div className="section-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p>Please log in to view your user profile.</p>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const handleResend = async () => {
    setResendStatus('loading');
    try {
      const res = await resendVerification(user.email);
      setResendStatus('success');
      setResendMsg(res.verificationUrlDevOnly || res.message);
    } catch (err) {
      setResendStatus('error');
      setResendMsg(err.message);
    }
  };

  const getRoleDashboardPath = (role) => {
    switch (role) {
      case 'super_admin': return '/super-admin';
      case 'admin': return '/admin';
      case 'planner': return '/planner';
      case 'vendor': return '/vendor';
      case 'client': default: return '/dashboard';
    }
  };

  const roleFormatted = user.role ? user.role.replace('_', ' ').toUpperCase() : 'CLIENT';

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Profile Card */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)', marginBottom: '30px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #eee', paddingBottom: '25px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--color-burgundy)', color: 'var(--color-ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'Playfair Display, serif' }}>
                {user.firstName ? user.firstName[0] : 'U'}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2rem', margin: 0 }}>
                  {user.firstName} {user.lastName}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ backgroundColor: 'var(--color-burgundy)', color: '#fff', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', letterSpacing: '1px' }}>
                    {roleFormatted}
                  </span>
                  <span style={{ backgroundColor: user.isVerified ? '#DCFCE7' : '#FEF3C7', color: user.isVerified ? '#15803D' : '#B45309', fontSize: '0.75rem', fontWeight: '600', padding: '3px 10px', borderRadius: '12px' }}>
                    {user.isVerified ? '✓ Email Verified' : '⚠️ Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Sign Out
            </button>
          </div>

          {/* User Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '35px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '4px', fontWeight: '600' }}>
                Email Address
              </div>
              <div style={{ color: 'var(--color-espresso)', fontWeight: '500', fontSize: '1.05rem', wordBreak: 'break-all' }}>
                {user.email}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '4px', fontWeight: '600' }}>
                Phone Number
              </div>
              <div style={{ color: 'var(--color-espresso)', fontWeight: '500', fontSize: '1.05rem', wordBreak: 'break-word' }}>
                {user.phone || 'Not provided'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '4px', fontWeight: '600' }}>
                Account Status
              </div>
              <div style={{ color: user.accountStatus === 'ACTIVE' ? '#166534' : '#9B2C2C', fontWeight: '600', fontSize: '1.05rem' }}>
                {user.accountStatus || 'ACTIVE'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '4px', fontWeight: '600' }}>
                Member Since
              </div>
              <div style={{ color: 'var(--color-espresso)', fontWeight: '500', fontSize: '1.05rem' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Verification Banner if not verified */}
          {!user.isVerified && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <strong style={{ color: '#92400E', fontSize: '0.95rem' }}>Email Verification Action Required</strong>
                  <p style={{ color: '#B45309', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Please verify your email address to unlock full communication features.
                  </p>
                </div>
                <button onClick={handleResend} disabled={resendStatus === 'loading'} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                  {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Link'}
                </button>
              </div>

              {resendMsg && (
                <div style={{ marginTop: '12px', background: '#ffffff', padding: '10px 12px', borderRadius: '4px', border: '1px solid #FDE68A', fontSize: '0.8rem', color: '#B45309', wordBreak: 'break-all' }}>
                  {resendMsg.startsWith('http') ? (
                    <a href={resendMsg} style={{ color: 'var(--color-burgundy)', fontWeight: 'bold' }}>
                      {resendMsg}
                    </a>
                  ) : (
                    resendMsg
                  )}
                </div>
              )}
            </div>
          )}

          {/* Role Navigation Quick Links */}
          <div style={{ background: '#FAF7F2', padding: '25px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.2rem', marginBottom: '10px' }}>
              Role & Protected Route Testing Panel
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
              You are currently logged in as a <strong>{roleFormatted}</strong>. Test route protection and role security by attempting to visit protected endpoints below:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <Link to="/dashboard" style={{ display: 'block', textAlignment: 'center', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', color: 'var(--color-espresso)', fontWeight: '600', fontSize: '0.85rem' }}>
                Client Route (/dashboard)
              </Link>
              <Link to="/planner" style={{ display: 'block', textAlignment: 'center', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', color: 'var(--color-espresso)', fontWeight: '600', fontSize: '0.85rem' }}>
                Planner Route (/planner)
              </Link>
              <Link to="/vendor" style={{ display: 'block', textAlignment: 'center', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', color: 'var(--color-espresso)', fontWeight: '600', fontSize: '0.85rem' }}>
                Vendor Route (/vendor)
              </Link>
              <Link to="/admin" style={{ display: 'block', textAlignment: 'center', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', color: 'var(--color-espresso)', fontWeight: '600', fontSize: '0.85rem' }}>
                Admin Route (/admin)
              </Link>
              <Link to="/super-admin" style={{ display: 'block', textAlignment: 'center', padding: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', textDecoration: 'none', color: 'var(--color-espresso)', fontWeight: '600', fontSize: '0.85rem' }}>
                Super Admin Route (/super-admin)
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
