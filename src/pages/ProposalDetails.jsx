import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, CheckCircle, X, ArrowLeft, MessageSquare, Check, Calendar, FileText } from '../components/Icons';

export default function ProposalDetails() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Client response feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [responseStatus, setResponseStatus] = useState(''); // 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
  const [submitting, setSubmitting] = useState(false);

  const fetchProposal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProposal(data.proposal);
      } else {
        setError(data.message || 'Failed to load proposal details.');
      }
    } catch (err) {
      setError('Error loading proposal details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) fetchProposal();
  }, [token, id]);

  const handleUpdateStatus = async (status, feedback = '') => {
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/proposals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, clientFeedback: feedback })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Proposal status updated to ${status}.`);
        setProposal(data.proposal);
        setFeedbackOpen(false);

        // If approved, offer 1-click booking creation
        if (status === 'APPROVED') {
          handleCreateBooking();
        }
      } else {
        setError(data.message || 'Failed to update proposal status.');
      }
    } catch (err) {
      setError('Error updating proposal status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/from-proposal/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Proposal APPROVED! Booking ${data.booking.bookingNumber} created successfully.`);
      }
    } catch (err) {
      // ignore
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED': return { bg: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' };
      case 'SENT': return { bg: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' };
      case 'CHANGES_REQUESTED': return { bg: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80' };
      case 'REJECTED': return { bg: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' };
      case 'EXPIRED': return { bg: '#FAFAFA', color: '#616161', border: '1px solid #E0E0E0' };
      default: return { bg: '#FFF8E1', color: '#B78103', border: '1px solid #FFE082' };
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#888' }}>Loading proposal details...</div>;
  }

  if (error || !proposal) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '30px', background: '#fff', borderRadius: '8px' }}>
        <h3 style={{ color: '#C62828' }}>Error</h3>
        <p>{error || 'Proposal not found.'}</p>
        <Link to="/proposals" style={{ color: 'var(--color-burgundy)', fontWeight: '600' }}>← Return to Proposals</Link>
      </div>
    );
  }

  const badge = getStatusBadge(proposal.status);
  const isClient = user?.role === 'client';

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '88vh', padding: '50px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>

        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link to={isClient ? '/dashboard' : '/proposals'} style={{ color: 'var(--color-burgundy)', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Feedback Notices */}
        {error && (
          <div style={{ padding: '15px 20px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '25px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '15px 20px', backgroundColor: '#EDF7ED', borderLeft: '4px solid #2E7D32', color: '#1E4620', marginBottom: '25px', borderRadius: '4px' }}>
            {successMsg}
          </div>
        )}

        {/* Main Luxury Document Card */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px 50px', boxShadow: '0 15px 35px rgba(44,24,16,0.06)', border: '1px solid rgba(88,28,37,0.1)', marginBottom: '30px' }}>
          
          {/* Document Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '2px solid #FAF7F2', paddingBottom: '25px', marginBottom: '30px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--color-gold-dark)', textTransform: 'uppercase', fontWeight: '700' }}>
                Elegant Moments Luxury Collection
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.5rem', margin: '8px 0 6px 0' }}>
                {proposal.proposalNumber}
              </h1>
              <p style={{ color: '#666', margin: 0, fontSize: '1rem' }}>
                Prepared for: <strong>{proposal.clientName}</strong> • Event: <strong>{proposal.weddingTitle}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border, padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', display: 'inline-block', marginBottom: '10px' }}>
                {proposal.status}
              </span>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>
                Date Issued: {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>
                Valid Until: {proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.4rem', marginBottom: '15px' }}>
            Curated Services & Experiences
          </h3>

          <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-espresso)', textTransform: 'uppercase', letterSpacing: '1px' }}>Service / Inclusion Description</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-espresso)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-espresso)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-espresso)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(proposal.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: '#333', fontWeight: '500' }}>{item.description}</td>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: '#666', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: '#666', textAlign: 'right' }}>${Number(item.unitPrice).toLocaleString()}</td>
                    <td style={{ padding: '16px', fontSize: '0.95rem', color: '#333', fontWeight: '600', textAlign: 'right' }}>${Number(item.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '35px' }}>
            <div style={{ width: '100%', maxWidth: '350px', background: '#FAF7F2', padding: '20px 25px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
                <span>Subtotal</span>
                <span>${Number(proposal.subtotal).toLocaleString()}</span>
              </div>
              {proposal.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '0.9rem', color: '#666' }}>
                  <span>Tax Amount</span>
                  <span>+${Number(proposal.taxAmount).toLocaleString()}</span>
                </div>
              )}
              {proposal.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', fontSize: '0.9rem', color: '#2E7D32' }}>
                  <span>Exclusive Privilege Discount</span>
                  <span>-${Number(proposal.discountAmount).toLocaleString()}</span>
                </div>
              )}
              <div style={{ borderTop: '2px solid var(--color-burgundy)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-burgundy)' }}>Final Investment</strong>
                <strong style={{ fontSize: '1.5rem', color: 'var(--color-burgundy)', fontFamily: 'Playfair Display, serif' }}>
                  ${Number(proposal.finalAmount).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Terms & Notes */}
          {proposal.notes && (
            <div style={{ backgroundColor: '#FFFBEB', padding: '15px 20px', borderRadius: '6px', borderLeft: '3px solid var(--color-gold)', fontSize: '0.9rem', color: '#555', marginBottom: '30px' }}>
              <strong>Terms & Inclusions:</strong> {proposal.notes}
            </div>
          )}

          {/* Client Feedback section if present */}
          {proposal.clientFeedback && (
            <div style={{ backgroundColor: '#FFF3E0', padding: '15px 20px', borderRadius: '6px', borderLeft: '3px solid #E65100', fontSize: '0.9rem', color: '#555', marginBottom: '30px' }}>
              <strong>Client Response Notes:</strong> {proposal.clientFeedback}
            </div>
          )}

          {/* Action Toolbar for Clients */}
          {isClient && ['SENT', 'DRAFT', 'CHANGES_REQUESTED'].includes(proposal.status) && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setResponseStatus('REJECTED'); setFeedbackOpen(true); }}
                className="btn btn-secondary"
                style={{ color: '#C62828', borderColor: '#EF9A9A', padding: '10px 20px' }}
              >
                Decline Proposal
              </button>
              <button
                onClick={() => { setResponseStatus('CHANGES_REQUESTED'); setFeedbackOpen(true); }}
                className="btn btn-secondary"
                style={{ padding: '10px 20px' }}
              >
                Request Adjustments
              </button>
              <button
                onClick={() => handleUpdateStatus('APPROVED', 'Accepted by client')}
                className="btn btn-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={18} /> Approve Proposal & Reserve
              </button>
            </div>
          )}

          {/* Action Toolbar for Admin/Planner */}
          {!isClient && proposal.status === 'APPROVED' && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button
                onClick={handleCreateBooking}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Generate Booking Confirmation
              </button>
            </div>
          )}

        </div>

        {/* Modal: Client Feedback / Request Adjustments */}
        {feedbackOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '550px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.4rem', marginTop: 0, marginBottom: '15px' }}>
                {responseStatus === 'CHANGES_REQUESTED' ? 'Request Proposal Adjustments' : 'Decline Proposal'}
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                  Your Feedback or Notes for the Planner
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={responseStatus === 'CHANGES_REQUESTED' ? 'Describe requested service additions or budget adjustments...' : 'Reason for declining...'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setFeedbackOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleUpdateStatus(responseStatus, feedbackText)}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
