import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password and password confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(formData);
      setSuccessInfo(res);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600' }}>
            Begin Your Journey
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', marginTop: '5px' }}>
            Client Account Registration
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '5px' }}>
            Create your account to start planning your bespoke luxury wedding.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', padding: '12px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {successInfo ? (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#166534', marginBottom: '10px' }}>
              Welcome to Elegant Moments!
            </h3>
            <p style={{ color: '#15803D', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.5 }}>
              Your client account has been created successfully. A verification link has been generated.
            </p>
            {successInfo.verificationUrlDevOnly && (
              <div style={{ background: '#ffffff', padding: '15px', borderRadius: '6px', border: '1px dashed #22C55E', marginBottom: '20px', textAlign: 'left', wordBreak: 'break-all' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#166534', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Dev Verification Link:
                </strong>
                <a href={successInfo.verificationUrlDevOnly} style={{ color: 'var(--color-burgundy)', fontSize: '0.9rem', fontWeight: '600' }}>
                  {successInfo.verificationUrlDevOnly}
                </a>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/profile')} className="btn btn-primary">
                Go to Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Eleanor"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Vanderbilt"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="eleanor@vanderbilt.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-1234"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 chars (1 upper, 1 lower, 1 num, 1 spec)"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ background: '#FAF7F2', padding: '12px 15px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '20px', fontSize: '0.8rem', color: '#555' }}>
              ℹ️ Public registration automatically creates a <strong>CLIENT</strong> role. Admin, Planner, and Vendor roles are assigned through administrative setup.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.95rem', color: '#666' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--color-burgundy)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
