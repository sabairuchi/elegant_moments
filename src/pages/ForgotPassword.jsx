import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    setDevResetUrl('');

    try {
      const res = await forgotPassword(email);
      setStatus('success');
      setMessage(res.message);
      if (res.resetUrlDevOnly) {
        setDevResetUrl(res.resetUrlDevOnly);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Request failed.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600' }}>
            Account Recovery
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2rem', marginTop: '5px' }}>
            Forgot Password
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '5px' }}>
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📬</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#166534', marginBottom: '10px' }}>
              Instructions Dispatched
            </h3>
            <p style={{ color: '#15803D', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              {message}
            </p>

            {devResetUrl && (
              <div style={{ background: '#ffffff', padding: '15px', borderRadius: '6px', border: '1px dashed #22C55E', marginBottom: '20px', textAlign: 'left', wordBreak: 'break-all' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#166534', marginBottom: '5px', textTransform: 'uppercase' }}>
                  Dev Reset Link:
                </strong>
                <a href={devResetUrl} style={{ color: 'var(--color-burgundy)', fontSize: '0.9rem', fontWeight: '600' }}>
                  {devResetUrl}
                </a>
              </div>
            )}

            <Link to="/login" className="btn btn-secondary">
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
              <div style={{ backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', padding: '12px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
                {message}
              </div>
            )}

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
            >
              {status === 'loading' ? 'Processing...' : 'Send Reset Instructions'}
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
