import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from '../components/Icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              Your client account has been created and authenticated successfully.
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                Go to Client Dashboard
              </button>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ backgroundColor: '#fff', border: '1px solid #ddd', color: '#333' }}>
                Sign In to Another Account
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
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
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
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
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
                style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
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
                style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars with Uppercase, Lowercase, Number & Special char"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Live Password Policy Helper Pills */}
              {formData.password && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', fontSize: '0.75rem' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: formData.password.length >= 8 ? '#DEF7EC' : '#FDE8E8', color: formData.password.length >= 8 ? '#03543F' : '#9B1C1C' }}>
                    {formData.password.length >= 8 ? '✓ 8+ chars' : '✗ 8+ chars'}
                  </span>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: /[A-Z]/.test(formData.password) ? '#DEF7EC' : '#FDE8E8', color: /[A-Z]/.test(formData.password) ? '#03543F' : '#9B1C1C' }}>
                    {/[A-Z]/.test(formData.password) ? '✓ Uppercase' : '✗ Uppercase'}
                  </span>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: /[a-z]/.test(formData.password) ? '#DEF7EC' : '#FDE8E8', color: /[a-z]/.test(formData.password) ? '#03543F' : '#9B1C1C' }}>
                    {/[a-z]/.test(formData.password) ? '✓ Lowercase' : '✗ Lowercase'}
                  </span>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: /[0-9]/.test(formData.password) ? '#DEF7EC' : '#FDE8E8', color: /[0-9]/.test(formData.password) ? '#03543F' : '#9B1C1C' }}>
                    {/[0-9]/.test(formData.password) ? '✓ Number' : '✗ Number'}
                  </span>
                  <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '#DEF7EC' : '#FDE8E8', color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '#03543F' : '#9B1C1C' }}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓ Special char' : '✗ Special char'}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '6px' }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer' }}
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
