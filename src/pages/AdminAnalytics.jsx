import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Calendar, Users, DollarSign, BarChart2 } from '../components/Icons';

export default function AdminAnalytics() {
  const { token } = useAuth();
  const [dateRange, setDateRange] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/dashboard?dateRange=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.metrics);
      } else {
        setError(json.message || 'Failed to load analytics.');
      }
    } catch (err) {
      setError('Error fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics(dateRange);
  }, [token, dateRange]);

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', padding: '40px 20px 80px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', borderTop: '4px solid var(--color-gold)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '700' }}>
                Admin Portal & Intelligence
              </span>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', margin: '6px 0 0 0' }}>
                Executive Analytics Dashboard
              </h1>
            </div>

            {/* Date Range Selector */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FAF6F0', padding: '6px', borderRadius: '8px', border: '1px solid #E5D5C5' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: dateRange === range.id ? 'var(--color-burgundy)' : 'transparent',
                    color: dateRange === range.id ? '#fff' : '#4B5563',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Sparkles size={32} color="var(--color-gold)" />
            <p>Computing real-time PostgreSQL analytics...</p>
          </div>
        ) : data ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {/* KPI 1: Enquiries & Conversions */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>Public Enquiries</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-burgundy)', margin: '8px 0' }}>{data.totalEnquiries}</div>
              <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                Consultation Conversion: <strong>{data.consultationConversionRate}</strong>
              </div>
            </div>

            {/* KPI 2: Total Consultations */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>Online Consultations</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-espresso)', margin: '8px 0' }}>{data.totalConsultations}</div>
              <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                Confirmed / Scheduled: <strong>{data.confirmedConsultations}</strong>
              </div>
            </div>

            {/* KPI 3: Total Revenue */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>Total Processed Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534', margin: '8px 0' }}>${data.totalRevenue?.toLocaleString()}</div>
              <div style={{ fontSize: '0.85rem', color: '#92400E' }}>
                Pending Payments: <strong>${data.pendingPaymentsTotal?.toLocaleString()} ({data.pendingPaymentsCount})</strong>
              </div>
            </div>

            {/* KPI 4: Proposals & Approvals */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>Luxury Proposals</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-gold-dark)', margin: '8px 0' }}>{data.totalProposals}</div>
              <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                Approval Rate: <strong>{data.proposalApprovalRate}</strong> ({data.approvedProposals} Approved)
              </div>
            </div>

            {/* KPI 5: Active Weddings */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>Total Weddings Managed</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-burgundy)', margin: '8px 0' }}>{data.totalWeddings}</div>
              <div style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                Active Planning: <strong>{data.activeWeddings}</strong>
              </div>
            </div>

            {/* KPI 6: Confirmed Bookings */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase' }}>Confirmed Contracts / Bookings</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6B21A8', margin: '8px 0' }}>{data.totalBookings}</div>
              <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                Binding Contracts Executed
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
