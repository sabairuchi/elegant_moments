import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from '../components/Icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              style={{ width: '100%', padding: '14px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-burgundy)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer' }}
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
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', textAlign: 'center', marginBottom: '16px', fontWeight: '600' }}>
            Quick Demo Login (Development Only)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            <button type="button" onClick={() => fillDemoCredentials('client@elegantmoments.com')} style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-burgundy)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => {e.target.style.background = 'rgba(212,175,55,0.1)'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'}}>
              Client
            </button>
            <button type="button" onClick={() => fillDemoCredentials('planner@elegantmoments.com')} style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-burgundy)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => {e.target.style.background = 'rgba(212,175,55,0.1)'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'}}>
              Planner
            </button>
            <button type="button" onClick={() => fillDemoCredentials('vendor@elegantmoments.com')} style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-burgundy)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => {e.target.style.background = 'rgba(212,175,55,0.1)'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'}}>
              Vendor
            </button>
            <button type="button" onClick={() => fillDemoCredentials('admin@elegantmoments.com')} style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-burgundy)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => {e.target.style.background = 'rgba(212,175,55,0.1)'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'}}>
              Admin
            </button>
            <button type="button" onClick={() => fillDemoCredentials('superadmin@elegantmoments.com')} style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: '6px', background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-burgundy)', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => {e.target.style.background = 'rgba(212,175,55,0.1)'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'}}>
              Super Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
