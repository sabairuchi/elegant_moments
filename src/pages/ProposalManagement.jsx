import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Plus, Search, Edit, Trash2, Eye, X, CheckCircle, FileText } from '../components/Icons';

export default function ProposalManagement() {
  const { user, token, logout } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [weddings, setWeddings] = useState([]);
  const [services, setServices] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { serviceId: '', description: 'Custom Planning Package', quantity: 1, unitPrice: 2500, subtotal: 2500 }
  ]);
  const [saving, setSaving] = useState(false);

  const STATUSES = ['All', 'DRAFT', 'SENT', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'EXPIRED'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const responses = await Promise.all([
        fetch('/api/proposals', { headers }),
        fetch('/api/weddings', { headers }),
        fetch('/api/services', { headers }),
        fetch('/api/venues', { headers })
      ]);

      if (responses.some(r => r.status === 401)) {
        logout();
        return;
      }

      const [propRes, wedRes, srvRes, venRes] = responses;

      const [propData, wedData, srvData, venData] = await Promise.all([
        propRes.json(),
        wedRes.json(),
        srvRes.json(),
        venRes.json()
      ]);

      if (propData.success) setProposals(propData.proposals || []);
      if (wedData.success) setWeddings(wedData.weddings || []);
      if (srvData.success) setServices(srvData.services || []);
      if (venData.success) setVenues(venData.venues || []);
    } catch (err) {
      setError('Failed to load proposals data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddItem = () => {
    setItems([...items, { serviceId: '', description: '', quantity: 1, unitPrice: 0, subtotal: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'serviceId' && value) {
      const selectedSrv = services.find(s => s.id === value);
      if (selectedSrv) {
        updated[index].description = selectedSrv.name;
        updated[index].unitPrice = Number(selectedSrv.startingPrice || selectedSrv.basePrice || 1000);
      }
    }

    const qty = Number(updated[index].quantity) || 1;
    const price = Number(updated[index].unitPrice) || 0;
    updated[index].subtotal = qty * price;

    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const calculateFinalTotal = () => Math.max(0, calculateSubtotal() + Number(taxAmount) - Number(discountAmount));

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!selectedWeddingId) {
      setError('Please select a target wedding.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weddingId: selectedWeddingId,
          items,
          discountAmount: Number(discountAmount),
          taxAmount: Number(taxAmount),
          validUntil: validUntil || undefined,
          notes,
          status: 'DRAFT'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Created Proposal ${data.proposal.proposalNumber} successfully.`);
        setModalOpen(false);
        fetchData();
      } else {
        setError(data.message || 'Failed to create proposal.');
      }
    } catch (err) {
      setError('Error creating proposal.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendProposal = async (proposalId) => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'SENT' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Proposal status updated to SENT.`);
        fetchData();
      }
    } catch (err) {
      setError('Failed to send proposal.');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED': return { bg: '#E8F5E9', color: '#2E7D32', border: '1px solid #A5D6A7' };
      case 'SENT': return { bg: '#E3F2FD', color: '#1565C0', border: '1px solid #90CAF9' };
      case 'CHANGES_REQUESTED': return { bg: '#FFF3E0', color: '#E65100', border: '1px solid #FFCC80' };
      case 'REJECTED': return { bg: '#FFEBEE', color: '#C62828', border: '1px solid #EF9A9A' };
      case 'EXPIRED': return { bg: '#FAFAFA', color: '#616161', border: '1px solid #E0E0E0' };
      default: return { bg: '#FFF8E1', color: '#B78103', border: '1px solid #FFE082' }; // DRAFT
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = !search || 
      (p.proposalNumber && p.proposalNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.weddingTitle && p.weddingTitle.toLowerCase().includes(search.toLowerCase())) ||
      (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '88vh', padding: '50px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '30px 40px',
          marginBottom: '35px',
          boxShadow: '0 15px 35px rgba(44,24,16,0.06)',
          border: '1px solid rgba(88,28,37,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <span style={{
              backgroundColor: 'var(--color-burgundy)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 12px',
              borderRadius: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Luxury Proposal Engine
            </span>
            <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', marginTop: '10px', marginBottom: '4px' }}>
              Proposal Management
            </h1>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
              Construct tailored service proposals, track line-item valuations, and manage client feedback.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} /> Create New Proposal
            </button>
          </div>
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

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search by proposal #, client, or wedding..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
            />
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#aaa' }}>
              <Search size={16} />
            </div>
          </div>
          <div style={{ flex: '0 0 200px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', backgroundColor: '#fff' }}
            >
              {STATUSES.map(st => <option key={st} value={st}>{st === 'All' ? 'All Proposal Statuses' : st}</option>)}
            </select>
          </div>
        </div>

        {/* Proposal Roster */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Loading proposals...</div>
        ) : filteredProposals.length === 0 ? (
          <div style={{ background: '#fff', padding: '50px', textAlign: 'center', borderRadius: '10px', border: '1px solid #eee' }}>
            <FileText size={40} style={{ color: '#ccc', marginBottom: '15px' }} />
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', margin: '0 0 10px 0' }}>No Proposals Found</h3>
            <p style={{ color: '#666', margin: 0 }}>Create a new proposal to get started with client quotes and service breakdowns.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {filteredProposals.map((p) => {
              const badge = getStatusBadge(p.status);

              return (
                <div key={p.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(88,28,37,0.1)', padding: '25px 30px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.3rem', fontWeight: '700' }}>
                        {p.proposalNumber}
                      </span>
                      <span style={{ backgroundColor: badge.bg, color: badge.color, border: badge.border, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {p.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#333', fontWeight: '600', marginBottom: '4px' }}>
                      {p.weddingTitle} • Client: {p.clientName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#777' }}>
                      Items: <strong>{(p.items || []).length}</strong> • Valid Until: <strong>{p.validUntil ? new Date(p.validUntil).toLocaleDateString() : 'N/A'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Total Investment</span>
                      <strong style={{ fontSize: '1.4rem', color: 'var(--color-espresso)', fontFamily: 'Playfair Display, serif' }}>
                        ${Number(p.finalAmount).toLocaleString()}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {p.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSendProposal(p.id)}
                          className="btn btn-secondary"
                          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        >
                          Send Proposal
                        </button>
                      )}
                      <Link
                        to={`/proposals/${p.id}`}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={14} /> View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Proposal */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', margin: 0 }}>
                  Construct New Luxury Proposal
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProposal}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                    Select Target Wedding *
                  </label>
                  <select
                    required
                    value={selectedWeddingId}
                    onChange={(e) => setSelectedWeddingId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Choose Wedding --</option>
                    {weddings.map(w => (
                      <option key={w.id} value={w.id}>{w.weddingName} ({w.clientName})</option>
                    ))}
                  </select>
                </div>

                {/* Proposal Line Items */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>
                      Selected Services & Line Items
                    </label>
                    <button type="button" onClick={handleAddItem} style={{ background: 'none', border: 'none', color: 'var(--color-burgundy)', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                      + Add Item
                    </button>
                  </div>

                  {items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'center', background: '#FAF7F2', padding: '10px', borderRadius: '6px' }}>
                      <div>
                        <select
                          value={item.serviceId}
                          onChange={(e) => handleItemChange(idx, 'serviceId', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '4px' }}
                        >
                          <option value="">-- Custom Package --</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (${s.startingPrice || s.basePrice})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Description..."
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#888', display: 'block' }}>Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#888', display: 'block' }}>Unit Price ($)</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          style={{ width: '100%', padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>

                      <div style={{ textAlign: 'right', fontWeight: '600', fontSize: '0.9rem' }}>
                        ${Number(item.subtotal).toLocaleString()}
                      </div>

                      {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer' }}>
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals & Adjustments */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px', backgroundColor: '#F9F9F9', padding: '15px', borderRadius: '6px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Tax Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Discount ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Calculated Total</span>
                    <strong style={{ fontSize: '1.3rem', color: 'var(--color-burgundy)', fontFamily: 'Playfair Display, serif' }}>
                      ${calculateFinalTotal().toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Valid Until</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Terms & Proposal Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter payment terms, deposit requirements, or inclusions..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ padding: '9px 18px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '9px 20px' }}>
                    {saving ? 'Creating...' : 'Save Draft Proposal'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
