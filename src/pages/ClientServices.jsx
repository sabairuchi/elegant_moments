import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClientSubNav from '../components/ClientSubNav';
import { Sparkles, Tag, Check } from '../components/Icons';

export default function ClientServices() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Photography', 'Videography', 'Catering', 'Decor', 'Florist', 'Music/Entertainment', 'Cake', 'Makeup & Hair', 'Other'];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category !== 'All') queryParams.append('category', category);
        queryParams.append('status', 'ACTIVE'); // Clients only see active services

        const res = await fetch(`/api/services?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
    if (token) fetchServices();
  }, [token, category]);

  return (
    <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <ClientSubNav />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-gold)', fontWeight: '600', display: 'block', marginBottom: '10px' }}>
            Curated For You
          </span>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '3rem', margin: '0 0 15px 0' }}>
            Exclusive Services
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Browse our hand-selected network of luxury vendors and service partners to elevate your celebration.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '50px' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                backgroundColor: category === c ? 'var(--color-burgundy)' : 'transparent',
                color: category === c ? '#fff' : 'var(--color-espresso)',
                border: `1px solid ${category === c ? 'var(--color-burgundy)' : '#ddd'}`,
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '20px', backgroundColor: '#FDF2F2', color: '#9B2C2C', borderRadius: '8px', textAlign: 'center', marginBottom: '40px' }}>
            {error}
          </div>
        )}

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Curating services...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', color: '#888', border: '1px solid #eaeaea' }}>
            No services currently available in this category.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {services.map(service => (
              <div key={service.id} style={{ backgroundColor: '#fff', borderRadius: '0', overflow: 'hidden', boxShadow: '0 15px 35px rgba(44,24,16,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0' }}>
                <div style={{ height: '240px', backgroundColor: '#f9f9f9', backgroundImage: `url(${service.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--color-burgundy)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {service.category}
                  </div>
                </div>
                
                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-espresso)', fontSize: '1.6rem', margin: '0 0 15px 0' }}>
                    {service.name}
                  </h3>
                  
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.7', flex: 1, marginBottom: '25px' }}>
                    {service.description || 'Elevate your experience with this premium service.'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px', marginTop: 'auto' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Investment from</span>
                      <span style={{ color: 'var(--color-gold)', fontWeight: '600', fontSize: '1.2rem' }}>
                        ${service.startingPrice?.toLocaleString()}
                      </span>
                    </div>
                    
                    <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                      Request Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
