import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MapPin, Tag } from '../components/Icons';

export default function AdminServices() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  const categories = ['All', 'Photography', 'Videography', 'Catering', 'Decor', 'Florist', 'Music/Entertainment', 'Cake', 'Makeup & Hair', 'Other'];
  const statuses = ['All', 'ACTIVE', 'INACTIVE', 'ARCHIVED'];

  const fetchServices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category !== 'All') queryParams.append('category', category);
      if (status !== 'All') queryParams.append('status', status);

      const res = await fetch(`/api/services?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      } else {
        setError(data.message || 'Failed to load services.');
      }
    } catch (err) {
      setError('An error occurred while fetching services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchServices();
    }
  }, [token, search, category, status]);

  const handleCreateService = async () => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'New Service',
          category: 'Other'
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/admin/services/${data.data.id}`);
      } else {
        alert(data.message || 'Failed to create service.');
      }
    } catch (err) {
      alert('Error creating service.');
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'ACTIVE': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'INACTIVE': return { bg: '#FFF3E0', text: '#E65100' };
      case 'ARCHIVED': return { bg: '#EEEEEE', text: '#616161' };
      default: return { bg: '#F5F5F5', text: '#333' };
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.4rem', margin: '0 0 10px 0' }}>Services</h1>
          <p style={{ color: '#666', margin: 0 }}>Manage the vendor services available for Elegant Moments weddings.</p>
        </div>
        {user?.roles?.some(r => ['admin', 'super_admin'].includes(r)) && (
          <button 
            onClick={handleCreateService}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Plus size={18} /> New Service
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#FDF2F2', borderLeft: '4px solid #9B2C2C', color: '#9B2C2C', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#aaa' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search services..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none' }}
          />
        </div>
        
        <div style={{ flex: '1 1 200px' }}>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', backgroundColor: '#fff' }}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', backgroundColor: '#fff' }}
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Loading services...</div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #ccc', color: '#888' }}>
          No services found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {services.map(service => {
            const statusStyle = getStatusColor(service.status);
            return (
              <div key={service.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid rgba(88,28,37,0.08)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', backgroundColor: '#f9f9f9', backgroundImage: `url(${service.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '15px', right: '15px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                    {service.status}
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    <Tag size={14} /> {service.category}
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.4rem', margin: '0 0 10px 0' }}>{service.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
                    {service.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <div style={{ color: 'var(--color-burgundy)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Starts at ${service.startingPrice?.toLocaleString()}
                    </div>
                    {user?.roles?.some(r => ['admin', 'super_admin'].includes(r)) && (
                      <Link to={`/admin/services/${service.id}`} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                        Manage
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
