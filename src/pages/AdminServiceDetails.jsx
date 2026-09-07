import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Trash2, Tag, DollarSign, Image } from '../components/Icons';

export default function AdminServiceDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Photography', 'Videography', 'Catering', 'Decor', 'Florist', 'Music/Entertainment', 'Cake', 'Makeup & Hair', 'Other'];
  const statuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setService(data.data);
        } else {
          setError(data.message || 'Failed to load service');
        }
      } catch (err) {
        setError('Error fetching service details');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchService();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(service)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Service updated successfully');
        setService(data.data);
      } else {
        setError(data.message || 'Failed to update service');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this service? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        navigate('/admin/services');
      } else {
        setError(data.message || 'Failed to delete service');
      }
    } catch (err) {
      setError('An error occurred while deleting.');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading service details...</div>;
  if (!service) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error || 'Service not found'}</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <Link to="/admin/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '25px', fontSize: '0.9rem', fontWeight: '500' }}>
        <ArrowLeft size={16} /> Back to Services
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.2rem', margin: '0 0 10px 0' }}>
            Edit Service
          </h1>
          <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>ID: {service.id}</p>
        </div>
        <button 
          onClick={handleDelete}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#FDF2F2', color: '#C53030', border: '1px solid #FEB2B2', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
        >
          <Trash2 size={16} /> Delete Service
        </button>
      </div>

      {error && <div style={{ padding: '15px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '25px', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ padding: '15px', backgroundColor: '#F0FDF4', borderLeft: '4px solid #2F855A', color: '#2F855A', marginBottom: '25px', borderRadius: '4px' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(88,28,37,0.08)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Service Name</label>
            <input 
              type="text" 
              name="name" 
              value={service.name} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Status</label>
            <select 
              name="status" 
              value={service.status} 
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              <Tag size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Category
            </label>
            <select 
              name="category" 
              value={service.category} 
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
              <DollarSign size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Starting Price ($)
            </label>
            <input 
              type="number" 
              name="startingPrice" 
              value={service.startingPrice} 
              onChange={handleChange}
              min="0"
              step="0.01"
              style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>
            <Image size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> Image URL
          </label>
          <input 
            type="url" 
            name="imageUrl" 
            value={service.imageUrl} 
            onChange={handleChange} 
            placeholder="https://example.com/image.jpg"
            style={{ width: '100%', padding: '12px 15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' }} 
          />
          {service.imageUrl && (
            <div style={{ marginTop: '15px', height: '150px', width: '250px', borderRadius: '8px', backgroundImage: `url(${service.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #eee' }} />
          )}
        </div>

        <div style={{ marginBottom: '35px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-espresso)', fontWeight: '600', marginBottom: '8px' }}>Description</label>
          <textarea 
            name="description" 
            value={service.description} 
            onChange={handleChange} 
            rows={5}
            style={{ width: '100%', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', resize: 'vertical' }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #eee', paddingTop: '25px' }}>
          <Link to="/admin/services" className="btn btn-outline" style={{ padding: '12px 24px' }}>
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
