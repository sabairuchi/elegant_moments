import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credential quick-select for effortless testing of all 5 roles
  const fillDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600' }}>
            Elegant Moments Authentication
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', marginTop: '5px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '5px' }}>
            Sign in to access your curated wedding planning universe.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', padding: '12px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-burgundy)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: '#666' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--color-burgundy)', fontWeight: '600', textDecoration: 'none' }}>
            Register as Client
          </Link>
        </div>

        {/* Demo Accounts Panel for User Convenience */}
        <div style={{ marginTop: '35px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', textAlign: 'center', marginBottom: '12px', fontWeight: '600' }}>
            Quick Demo Login (Password: Password123!)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            <button type="button" onClick={() => fillDemoCredentials('client@elegantmoments.com')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', background: '#F4F1EA', border: '1px solid #ddd', cursor: 'pointer' }}>
              Client
            </button>
            <button type="button" onClick={() => fillDemoCredentials('planner@elegantmoments.com')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', background: '#F4F1EA', border: '1px solid #ddd', cursor: 'pointer' }}>
              Planner
            </button>
            <button type="button" onClick={() => fillDemoCredentials('vendor@elegantmoments.com')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', background: '#F4F1EA', border: '1px solid #ddd', cursor: 'pointer' }}>
              Vendor
            </button>
            <button type="button" onClick={() => fillDemoCredentials('admin@elegantmoments.com')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', background: '#F4F1EA', border: '1px solid #ddd', cursor: 'pointer' }}>
              Admin
            </button>
            <button type="button" onClick={() => fillDemoCredentials('superadmin@elegantmoments.com')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', background: '#F4F1EA', border: '1px solid #ddd', cursor: 'pointer' }}>
              Super Admin
            </button>
            <button type="button" onClick={() => fillDemoCredentials('suspended@elegantmoments.com')} style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '4px', background: '#FFEAEA', border: '1px solid #E5A0A0', color: '#9B2C2C', cursor: 'pointer' }}>
              Suspended
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
