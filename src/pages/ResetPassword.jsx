import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from URL.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600' }}>
            Account Security
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2rem', marginTop: '5px' }}>
            Create New Password
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '5px' }}>
            Enter your new secure password to restore access to your account.
          </p>
        </div>

        {success ? (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#166534', marginBottom: '10px' }}>
              Password Updated!
            </h3>
            <p style={{ color: '#15803D', fontSize: '0.95rem', marginBottom: '20px' }}>
              Your password has been securely updated and your reset token has been invalidated.
            </p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Sign In with New Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!token && (
              <div style={{ backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', padding: '12px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
                ⚠️ Missing reset token. Please open the link directly from your email/dev console.
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', padding: '12px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars (1 upper, 1 lower, 1 num, 1 spec)"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', cursor: (loading || !token) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem' }}>
          <Link to="/login" style={{ color: 'var(--color-burgundy)', fontWeight: '600', textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
