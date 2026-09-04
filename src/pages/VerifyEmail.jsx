import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [status, setStatus] = useState(tokenFromUrl ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const { verifyEmail, resendVerification, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl && status === 'verifying') {
      verifyEmail(tokenFromUrl)
        .then((res) => {
          setStatus('success');
          setMessage(res.message || 'Your email address has been verified!');
        })
        .catch((err) => {
          setStatus('error');
          setMessage(err.message || 'Verification token is invalid or expired.');
        });
    }
  }, [tokenFromUrl, status, verifyEmail]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendStatus('sending');
    try {
      const res = await resendVerification(resendEmail);
      setResendStatus('success');
      setMessage(res.message);
      if (res.verificationUrlDevOnly) {
        setMessage(`${res.message} Dev Link: ${res.verificationUrlDevOnly}`);
      }
    } catch (err) {
      setResendStatus('error');
      setMessage(err.message || 'Failed to resend verification.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '60px 20px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto', background: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 15px 35px rgba(44,24,16,0.08)', border: '1px solid rgba(88,28,37,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600' }}>
            Account Security
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2rem', marginTop: '5px' }}>
            Email Verification
          </h1>
        </div>

        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
            <p style={{ color: '#555' }}>Verifying your security token...</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '25px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#166534', marginBottom: '10px' }}>
              Verification Successful
            </h3>
            <p style={{ color: '#15803D', fontSize: '0.95rem', marginBottom: '20px' }}>
              {message}
            </p>
            <button onClick={() => navigate('/profile')} className="btn btn-primary">
              View Profile
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ backgroundColor: '#FDF2F2', border: '1px solid #FECACA', padding: '25px', borderRadius: '8px', textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#9B2C2C', marginBottom: '10px' }}>
              Verification Failed
            </h3>
            <p style={{ color: '#9B2C2C', fontSize: '0.95rem', marginBottom: '15px' }}>
              {message}
            </p>
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', marginBottom: '10px' }}>
              Resend Email Verification Link
            </h4>
            <form onSubmit={handleResend}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  required
                  value={resendEmail || (user ? user.email : '')}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                />
              </div>
              <button type="submit" disabled={resendStatus === 'sending'} className="btn btn-secondary" style={{ width: '100%', padding: '12px' }}>
                {resendStatus === 'sending' ? 'Dispatching...' : 'Request New Verification Link'}
              </button>
            </form>

            {resendStatus === 'success' && (
              <div style={{ marginTop: '15px', background: '#F0FDF4', color: '#166534', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {message}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--color-burgundy)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
            ← Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
