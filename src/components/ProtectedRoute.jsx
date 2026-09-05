import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, requiredPermissions, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--color-ivory)', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--color-burgundy)', fontFamily: 'Playfair Display, serif' }}>
          Verifying security credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || [user.role];
    const hasPermission = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      return (
        <div className="section-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid rgba(88,28,37,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔒</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2rem', marginBottom: '15px' }}>
              Access Restricted
            </h2>
            <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '25px' }}>
              Your current role (<strong>{user.role}</strong>) does not have authorization to view this resource. Protected routes require one of: {allowedRoles.join(', ')}.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn btn-secondary">
                View My Profile
              </Link>
              <Link to="/" className="btn btn-primary">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPerms = user.permissions || [];
    const hasPermission = requiredPermissions.every((perm) => userPerms.includes(perm));

    if (!hasPermission) {
      return (
        <div className="section-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid rgba(88,28,37,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔒</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2rem', marginBottom: '15px' }}>
              Access Restricted
            </h2>
            <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '25px' }}>
              You do not have the required permissions to view this resource. Missing: {requiredPermissions.filter(p => !userPerms.includes(p)).join(', ')}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn btn-secondary">
                View My Profile
              </Link>
              <Link to="/" className="btn btn-primary">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
