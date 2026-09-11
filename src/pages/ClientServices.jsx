import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClientSubNav from '../components/ClientSubNav';
import { Sparkles, Tag, Check, X } from '../components/Icons';

export default function ClientServices({ onOpenEnquiry }) {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(null);

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

  const handleRequestInfo = (e, service) => {
    e.stopPropagation();
    if (onOpenEnquiry) {
      onOpenEnquiry();
    }
  };

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
              <div 
                key={service.id} 
                onClick={() => setSelectedService(service)}
                style={{ backgroundColor: '#fff', borderRadius: '0', overflow: 'hidden', boxShadow: '0 15px 35px rgba(44,24,16,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0', cursor: 'pointer' }}
              >
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
                    
                    <button 
                      onClick={(e) => handleRequestInfo(e, service)} 
                      className="btn-outline" 
                      style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                    >
                      Request Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <div className="modal-overlay" onClick={() => setSelectedService(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', padding: '40px', backgroundColor: '#fff', borderRadius: '12px', position: 'relative' }}>
              <button 
                onClick={() => setSelectedService(null)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="var(--color-burgundy)" />
              </button>

              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--color-gold)', fontWeight: '700' }}>
                {selectedService.category}
              </span>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: 'var(--color-burgundy)', margin: '10px 0 20px 0' }}>
                {selectedService.name}
              </h2>

              <p style={{ color: '#4B5563', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '30px' }}>
                {selectedService.description || 'Exclusive service offering for Elegant Moments weddings.'}
              </p>

              <div style={{ backgroundColor: 'var(--color-ivory)', padding: '20px', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Starting Investment</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-burgundy)' }}>
                    ${selectedService.startingPrice?.toLocaleString()}
                  </div>
                </div>
                <button 
                  onClick={(e) => { setSelectedService(null); handleRequestInfo(e, selectedService); }} 
                  className="btn-gold"
                  style={{ padding: '12px 24px' }}
                >
                  <Sparkles size={16} /> Request Info
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

