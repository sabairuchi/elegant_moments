import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClientSubNav from '../components/ClientSubNav';
import { Sparkles, Calendar, Clock, Video, FileText, CheckCircle, MessageSquare } from '../components/Icons';

import BookConsultationModal from '../components/BookConsultationModal';

export default function ClientEnquiries() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('consultations'); // 'enquiries' | 'consultations'
  const [enquiries, setEnquiries] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedConsultationForPay, setSelectedConsultationForPay] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enquiriesRes, consultationsRes] = await Promise.all([
        fetch('/api/enquiries', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/consultations', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const enquiriesData = await enquiriesRes.json();
      const consultationsData = await consultationsRes.json();

      if (enquiriesData.success) {
        setEnquiries(enquiriesData.enquiries || []);
      } else {
        setError(enquiriesData.message || 'Failed to load enquiries.');
      }

      if (consultationsData.success) {
        setConsultations(consultationsData.consultations || []);
      }
    } catch (err) {
      setError('An error occurred while fetching your records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const renderBadge = (status) => {
    let bg = '#F3F4F6';
    let color = '#4B5563';
    switch(status) {
      case 'NEW': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'CONTACTED': bg = '#FEF3C7'; color = '#92400E'; break;
      case 'CONSULTATION_SCHEDULED': bg = '#E0E7FF'; color = '#3730A3'; break;
      case 'QUALIFIED': bg = '#DCFCE7'; color = '#166534'; break;
      case 'CONVERTED': bg = '#F3E8FF'; color = '#6B21A8'; break;
      case 'REQUESTED': bg = '#FEF3C7'; color = '#92400E'; break;
      case 'SCHEDULED': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'CONFIRMED': bg = '#DCFCE7'; color = '#166534'; break;
      case 'COMPLETED': bg = '#F3E8FF'; color = '#6B21A8'; break;
      case 'CANCELLED': bg = '#FEE2E2'; color = '#991B1B'; break;
      default: bg = '#F3F4F6'; color = '#4B5563'; break;
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '6px 14px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>
        {status ? status.replace(/_/g, ' ') : 'PENDING'}
      </span>
    );
  };

  const renderPaymentBadge = (payStatus) => {
    let bg = '#FEF3C7';
    let color = '#92400E';
    switch(payStatus) {
      case 'PAID': bg = '#DCFCE7'; color = '#166534'; break;
      case 'PENDING': bg = '#DBEAFE'; color = '#1E40AF'; break;
      case 'FAILED': bg = '#FEE2E2'; color = '#991B1B'; break;
      case 'UNPAID':
      default: bg = '#FEF3C7'; color = '#92400E'; break;
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.05em' }}>
        PAYMENT: {payStatus || 'UNPAID'}
      </span>
    );
  };

  const upcomingConsultations = consultations.filter(c => ['REQUESTED', 'SCHEDULED', 'CONFIRMED'].includes(c.status));
  const pastConsultations = consultations.filter(c => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(c.status));

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <ClientSubNav />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            Communication History
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', margin: '0 0 15px 0' }}>
            My Enquiries & Consultations
          </h1>
          <p style={{ color: '#666', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 20px auto' }}>
            Track the status of your initial inquiries and scheduled private consultations with our event curators.
          </p>

          <button
            onClick={() => {
              setSelectedConsultationForPay(null);
              setIsBookModalOpen(true);
            }}
            style={{
              backgroundColor: 'var(--color-burgundy)',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.88rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(88,24,37,0.2)',
            }}
          >
            <Sparkles size={16} /> Schedule Online Consultation ($150)
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
          <button
            onClick={() => setActiveTab('enquiries')}
            style={{
              padding: '10px 28px',
              borderRadius: '24px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'enquiries' ? '1px solid var(--color-burgundy)' : '1px solid #D1D5DB',
              backgroundColor: activeTab === 'enquiries' ? 'var(--color-burgundy)' : '#fff',
              color: activeTab === 'enquiries' ? '#fff' : 'var(--color-espresso)',
              transition: 'all 0.3s ease'
            }}
          >
            My Enquiries ({enquiries.length})
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            style={{
              padding: '10px 28px',
              borderRadius: '24px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'consultations' ? '1px solid var(--color-burgundy)' : '1px solid #D1D5DB',
              backgroundColor: activeTab === 'consultations' ? 'var(--color-burgundy)' : '#fff',
              color: activeTab === 'consultations' ? '#fff' : 'var(--color-espresso)',
              transition: 'all 0.3s ease'
            }}
          >
            My Consultations ({consultations.length})
          </button>
        </div>

        {error && (
          <div style={{ padding: '20px', backgroundColor: '#FDF2F2', color: '#9B2C2C', borderRadius: '8px', textAlign: 'center', marginBottom: '30px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Fetching records...</div>
        ) : activeTab === 'enquiries' ? (
          <div>
            {enquiries.length === 0 ? (
              <div style={{ padding: '50px', backgroundColor: '#fff', borderRadius: '12px', textAlign: 'center', color: '#888', border: '1px solid #eaeaea' }}>
                You have not submitted any enquiries yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '24px' }}>
                {enquiries.map((enq) => (
                  <div key={enq.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          ID: {enq.id}
                        </div>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--color-espresso)', margin: '4px 0 0 0' }}>
                          {enq.eventType || 'Event Enquiry'}
                        </h3>
                      </div>
                      <div>{renderBadge(enq.status)}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Event Date</span>
                        <strong style={{ color: '#374151', fontSize: '0.95rem' }}>{enq.eventDate || 'Not specified'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Guest Count</span>
                        <strong style={{ color: '#374151', fontSize: '0.95rem' }}>{enq.guestCount || 'Not specified'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Estimated Budget</span>
                        <strong style={{ color: '#374151', fontSize: '0.95rem' }}>{enq.estimatedBudget ? `$${enq.estimatedBudget}` : 'Not specified'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700' }}>Submitted On</span>
                        <strong style={{ color: '#374151', fontSize: '0.95rem' }}>{new Date(enq.createdAt).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    {enq.vision && (
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Vision / Notes</span>
                        <p style={{ color: '#4B5563', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>{enq.vision}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Consultations Tab */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--color-espresso)', marginBottom: '20px' }}>
                Upcoming Consultations
              </h2>
              {upcomingConsultations.length === 0 ? (
                <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '12px', color: '#888', border: '1px solid #eaeaea', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 15px 0' }}>No upcoming consultations scheduled.</p>
                  <button
                    onClick={() => {
                      setSelectedConsultationForPay(null);
                      setIsBookModalOpen(true);
                    }}
                    style={{ backgroundColor: 'var(--color-burgundy)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                  >
                    Schedule Online Consultation
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {upcomingConsultations.map((c) => (
                    <div key={c.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderLeft: '4px solid var(--color-gold)', border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: '700', textTransform: 'uppercase' }}>Ref #{c.consultationNumber || c.id}</span>
                          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--color-burgundy)', margin: '2px 0 0 0' }}>
                            {c.meetingType || 'Consultation Session'}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {renderPaymentBadge(c.paymentStatus)}
                          {renderBadge(c.status)}
                        </div>
                      </div>

                      <div style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        <div><strong>Date & Time:</strong> {c.date || c.requestedDate || 'To be confirmed'} {c.time ? `at ${c.time}` : ''} ({c.duration || '30 mins'})</div>
                        <div><strong>Fee:</strong> ${Number(c.fee || 150).toFixed(2)} USD</div>
                        {c.paymentId && <div><strong>Payment Ref:</strong> <code style={{ backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>{c.paymentId}</code></div>}
                        {c.locationLink && (
                          <div style={{ marginTop: '8px' }}>
                            <strong>Join Link:</strong> <a href={c.locationLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-burgundy)' }}>{c.locationLink}</a>
                          </div>
                        )}
                        {c.notes && <div style={{ marginTop: '8px', color: '#6B7280', fontSize: '0.9rem' }}>Notes: {c.notes}</div>}
                      </div>

                      {c.paymentStatus !== 'PAID' && (
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setSelectedConsultationForPay(c);
                              setIsBookModalOpen(true);
                            }}
                            style={{
                              backgroundColor: 'var(--color-gold-dark)',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 18px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            Pay Consultation Fee ($150) &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--color-espresso)', marginBottom: '20px' }}>
                Past / Completed Consultations
              </h2>
              {pastConsultations.length === 0 ? (
                <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '12px', color: '#888', border: '1px solid #eaeaea' }}>
                  No past consultation records.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {pastConsultations.map((c) => (
                    <div key={c.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', opacity: 0.85, border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#374151', margin: 0 }}>
                          {c.meetingType || 'Consultation'}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {renderPaymentBadge(c.paymentStatus)}
                          {renderBadge(c.status)}
                        </div>
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                        Date: {c.date || c.requestedDate || 'N/A'} | Payment Ref: {c.paymentId || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <BookConsultationModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        initialConsultation={selectedConsultationForPay}
        onConsultationBooked={() => {
          fetchData();
        }}
      />
    </div>
  );
}
