import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, CheckCircle, AlertCircle, Loader2, Calendar, Clock, CreditCard, ShieldCheck } from './Icons';

export default function BookConsultationModal({ isOpen, onClose, onConsultationBooked, initialConsultation = null }) {
  const { user, token } = useAuth();

  const [step, setStep] = useState(1); // 1: Schedule, 2: Payment, 3: Processing, 4: Result
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    meetingType: 'Video Call',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:00 AM',
    notes: '',
  });

  const [createdConsultation, setCreatedConsultation] = useState(null);
  const [paymentSession, setPaymentSession] = useState(null);
  const [mockOutcome, setMockOutcome] = useState('SUCCESS'); // 'SUCCESS' | 'FAILED' | 'CANCEL'
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '4242 •••• •••• 4242',
    exp: '12/28',
    cvc: '123',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      setCardDetails((prev) => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Client',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (initialConsultation) {
      setCreatedConsultation(initialConsultation);
      setStep(2); // Jump directly to payment for unpaid consultation
    } else {
      setStep(1);
    }
  }, [initialConsultation, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    if (!formData.date) errs.date = 'Date is required.';
    if (!formData.time) errs.time = 'Time is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInitiateAndProceed = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Create or retrieve consultation
      let consultation = createdConsultation;

      if (!consultation) {
        const createRes = await fetch('/api/consultations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ...formData,
            fee: 150.00,
          }),
        });

        const createData = await createRes.json();
        if (!createRes.ok || !createData.success) {
          throw new Error(createData.message || 'Failed to request consultation.');
        }
        consultation = createData.consultation;
        setCreatedConsultation(consultation);
      }

      // 2. Initiate Payment Session
      const payRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consultationId: consultation.id,
          paymentMethod: 'CARD',
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success) {
        if (payData.code === 'DUPLICATE_PAYMENT') {
          throw new Error('This consultation has already been paid and confirmed.');
        }
        throw new Error(payData.message || 'Failed to initiate payment session.');
      }

      setPaymentSession(payData);
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentSession || !paymentSession.payment) return;

    if (mockOutcome === 'CANCEL') {
      setLoading(true);
      try {
        await fetch('/api/payments/cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId: paymentSession.payment.id,
            reason: 'Payment cancelled by user in gateway dialog.',
          }),
        });
        setPaymentResult({
          status: 'CANCELLED',
          message: 'Payment session was cancelled. You can complete payment anytime from your dashboard.',
        });
        setStep(4);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep(3); // Show Processing State
    setLoading(true);
    setErrorMessage('');

    setTimeout(async () => {
      try {
        const orderId = paymentSession.gateway?.gatewayOrderId || paymentSession.payment.gatewayOrderId;
        const mockSignature = mockOutcome === 'SUCCESS' ? `sig_valid_${orderId}` : 'invalid_sig_mismatch';
        const mockTxnId = mockOutcome === 'SUCCESS' ? `txn_sbx_${Date.now()}` : `txn_fail_${Date.now()}`;

        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId: paymentSession.payment.id,
            gatewayOrderId: orderId,
            gatewayTransactionId: mockTxnId,
            gatewaySignature: mockSignature,
            mockOutcome: mockOutcome === 'FAILED' ? 'FAILED' : 'SUCCESS',
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          setPaymentResult({
            status: 'PAID',
            payment: verifyData.payment,
            consultation: verifyData.consultation,
          });
          setStep(4);
          if (onConsultationBooked) onConsultationBooked(verifyData);
        } else {
          setPaymentResult({
            status: 'FAILED',
            message: verifyData.message || 'Payment verification failed. Card declined.',
            payment: verifyData.payment || paymentSession.payment,
          });
          setStep(4);
        }
      } catch (err) {
        setPaymentResult({
          status: 'FAILED',
          message: err.message || 'An unexpected error occurred during verification.',
        });
        setStep(4);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setCreatedConsultation(null);
    setPaymentSession(null);
    setPaymentResult(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleResetAndClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '90%',
          padding: '2.2rem',
          position: 'relative',
          backgroundColor: 'var(--color-ivory)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
      >
        <button
          onClick={handleResetAndClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'none',
            border: '1px solid var(--color-gold)',
            color: 'var(--color-burgundy)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* STEP 1: CONSULTATION DETAILS */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '700' }}>
                Online Concierge
              </span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.8rem', margin: '4px 0 0 0' }}>
                Schedule Private Consultation
              </h2>
              <p style={{ color: '#666', fontSize: '0.88rem', margin: '6px 0 0 0' }}>
                Meet with our lead event curator to explore bespoke design, venue match, and budget planning.
              </p>
            </div>

            {errorMessage && (
              <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px' }}>
                {errorMessage}
              </div>
            )}

            {/* Fee Banner */}
            <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-gold)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--color-burgundy)', fontSize: '0.95rem' }}>Consultation Fee</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Fully credited toward your wedding package upon booking</div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-burgundy)', fontFamily: 'Playfair Display, serif' }}>
                $150.00
              </div>
            </div>

            <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Eleanor Vance"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: errors.name ? '1px solid red' : '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@domain.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: errors.email ? '1px solid red' : '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Preferred Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: errors.date ? '1px solid red' : '1px solid #D1D5DB' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Time Slot *</label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  >
                    <option value="10:00 AM">10:00 AM EST</option>
                    <option value="01:30 PM">01:30 PM EST</option>
                    <option value="04:00 PM">04:00 PM EST</option>
                    <option value="06:30 PM">06:30 PM EST</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Meeting Format</label>
                <select
                  name="meetingType"
                  value={formData.meetingType}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                >
                  <option value="Video Call">HD Video Call (Zoom / Google Meet)</option>
                  <option value="Phone Call">Private Phone Consultation</option>
                  <option value="In Person">In-Person Concierge Studio Visit</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-espresso)', marginBottom: '4px' }}>Celebration Notes / Special Requests</label>
                <textarea
                  name="notes"
                  rows="2"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Tell us briefly about your wedding date, venue preference, or vision..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB', resize: 'vertical' }}
                />
              </div>
            </div>

            <button
              onClick={handleInitiateAndProceed}
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-burgundy)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'Initiating Session...' : 'Proceed to Payment ($150.00) \u2192'}
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT GATEWAY (SANDBOX) */}
        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold-dark)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
                <ShieldCheck size={16} /> 256-Bit Encrypted Gateway (Sandbox)
              </div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.8rem', margin: '4px 0 0 0' }}>
                Confirm & Pay Consultation
              </h2>
            </div>

            {errorMessage && (
              <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px' }}>
                {errorMessage}
              </div>
            )}

            {/* Summary Box */}
            <div style={{ backgroundColor: '#FAF7F2', borderRadius: '10px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#6B7280' }}>Consultation Reference:</span>
                <strong style={{ color: 'var(--color-burgundy)' }}>{createdConsultation?.consultationNumber || createdConsultation?.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#6B7280' }}>Scheduled Date & Time:</span>
                <strong style={{ color: 'var(--color-espresso)' }}>{formData.date} at {formData.time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '8px', fontSize: '1rem' }}>
                <strong style={{ color: 'var(--color-espresso)' }}>Total Amount Due:</strong>
                <strong style={{ color: 'var(--color-burgundy)', fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>$150.00 USD</strong>
              </div>
            </div>

            {/* Card Information */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-espresso)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px' }}>
                <CreditCard size={18} color="var(--color-gold)" /> Sandbox Test Payment Details
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Cardholder Name</label>
                  <input type="text" value={cardDetails.name} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '0.88rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Card Number (Sandbox Test Card)</label>
                  <input type="text" value={cardDetails.number} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontFamily: 'monospace', fontSize: '0.9rem' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Expires</label>
                    <input type="text" value={cardDetails.exp} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '0.88rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>CVC</label>
                    <input type="text" value={cardDetails.cvc} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '0.88rem' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sandbox Simulation Options */}
            <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#92400E', marginBottom: '6px' }}>
                Sandbox Test Mode Trigger:
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ fontSize: '0.8rem', color: '#78350F', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="mockOutcome" value="SUCCESS" checked={mockOutcome === 'SUCCESS'} onChange={() => setMockOutcome('SUCCESS')} />
                  Success Flow
                </label>
                <label style={{ fontSize: '0.8rem', color: '#78350F', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="mockOutcome" value="FAILED" checked={mockOutcome === 'FAILED'} onChange={() => setMockOutcome('FAILED')} />
                  Failure Flow
                </label>
                <label style={{ fontSize: '0.8rem', color: '#78350F', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="mockOutcome" value="CANCEL" checked={mockOutcome === 'CANCEL'} onChange={() => setMockOutcome('CANCEL')} />
                  Cancel Flow
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                \u2190 Back
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={loading}
                style={{
                  flex: 2,
                  backgroundColor: 'var(--color-burgundy)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Pay $150.00 Now
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING STATE */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Loader2 size={48} color="var(--color-gold)" style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.6rem', marginBottom: '10px' }}>
              Processing Payment...
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto' }}>
              Verifying transaction signature server-side and updating consultation records.
            </p>
          </div>
        )}

        {/* STEP 4: RESULT / CONFIRMATION */}
        {step === 4 && paymentResult && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            {paymentResult.status === 'PAID' && (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#DCFCE7', border: '2px solid #166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  <CheckCircle size={36} color="#166534" />
                </div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold-dark)', fontWeight: '700' }}>
                  PAYMENT VERIFIED • CONFIRMED
                </span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.8rem', margin: '8px 0 15px 0' }}>
                  Consultation Confirmed!
                </h2>
                <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
                  Your online consultation fee has been verified and processed successfully. Our planning studio has confirmed your appointment slot.
                </p>

                {/* Reference Details */}
                <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-gold)', borderRadius: '10px', padding: '18px', textAlign: 'left', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6B7280' }}>Consultation Number:</span>
                    <strong style={{ color: 'var(--color-burgundy)' }}>{paymentResult.consultation?.consultationNumber || createdConsultation?.consultationNumber || createdConsultation?.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6B7280' }}>Payment Reference:</span>
                    <strong style={{ color: 'var(--color-espresso)', fontFamily: 'monospace' }}>{paymentResult.payment?.paymentNumber || paymentResult.payment?.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6B7280' }}>Gateway Transaction ID:</span>
                    <strong style={{ color: '#166534', fontFamily: 'monospace' }}>{paymentResult.payment?.gatewayTransactionId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6B7280' }}>Scheduled Date & Time:</span>
                    <strong style={{ color: 'var(--color-espresso)' }}>{paymentResult.consultation?.date || formData.date} ({paymentResult.consultation?.time || formData.time})</strong>
                  </div>
                </div>

                <button
                  onClick={handleResetAndClose}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-burgundy)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Return to Dashboard
                </button>
              </>
            )}

            {paymentResult.status === 'FAILED' && (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEE2E2', border: '2px solid #991B1B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  <AlertCircle size={36} color="#991B1B" />
                </div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#991B1B', fontWeight: '700' }}>
                  TRANSACTION DECLINED
                </span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#991B1B', fontSize: '1.8rem', margin: '8px 0 15px 0' }}>
                  Payment Unsuccessful
                </h2>
                <div style={{ backgroundColor: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '8px', padding: '14px', color: '#9B2C2C', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {paymentResult.message}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--color-burgundy)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Retry Payment
                  </button>
                  <button
                    onClick={handleResetAndClose}
                    style={{
                      flex: 1,
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {paymentResult.status === 'CANCELLED' && (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEF3C7', border: '2px solid #D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                  <AlertCircle size={36} color="#D97706" />
                </div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#D97706', fontWeight: '700' }}>
                  PAYMENT CANCELLED
                </span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.8rem', margin: '8px 0 15px 0' }}>
                  Session Cancelled
                </h2>
                <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {paymentResult.message}
                </p>

                <button
                  onClick={handleResetAndClose}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-espresso)',
                    color: '#fff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Return to Dashboard
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
