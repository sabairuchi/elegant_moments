import React, { useState } from 'react';
import { Filter, Sparkles, X, ArrowRight } from '../components/Icons';
import { PORTFOLIO } from '../data/content';
import PortfolioModal from '../components/PortfolioModal';

export default function Portfolio({ onOpenEnquiry }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeItem, setActiveItem] = useState(null);

  const categories = ['All', 'Ceremonies', 'Receptions', 'Weddings', 'Décor', 'Details'];

  const filteredItems = PORTFOLIO.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div style={{ paddingTop: '5rem', backgroundColor: 'var(--color-ivory)' }}>
      {/* 6. PORTFOLIO — VISUAL HERO (Photography Centric) */}
      <section
        style={{
          position: 'relative',
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-burgundy-dark)',
          color: 'var(--color-ivory)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90"
            alt="Haute Photography Hero"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.48) contrast(1.08)' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, var(--color-burgundy-dark), transparent 70%)' }} />
        </div>

        <div className="container-luxury" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '1000px', padding: '4rem 1.5rem' }}>
          <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
            SELECTED CELEBRATIONS
          </span>

          <h1
            style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.8rem)',
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.06em',
              lineHeight: '1.05',
              marginBottom: '1.5rem',
              fontWeight: '400',
            }}
          >
            MOMENTS,<br />BEAUTIFULLY REMEMBERED.
          </h1>

          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: 'var(--color-gold)', fontStyle: 'italic', marginBottom: '2.5rem', fontWeight: '300' }}>
            "A visual archive of high-profile weddings, estate banquets, and timeless rituals."
          </p>

          <a href="#gallery-grid" className="btn-gold" style={{ padding: '1.1rem 2.8rem' }}>
            VIEW THE STORIES →
          </a>
        </div>
      </section>

      {/* Filter Navigation */}
      <section id="gallery-grid" style={{ padding: '2rem 0', backgroundColor: 'var(--color-ivory-pure)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.6rem 1.6rem',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-burgundy)' : 'var(--color-border)',
                  backgroundColor: selectedCategory === cat ? 'var(--color-burgundy)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--color-ivory)' : 'var(--color-charcoal)',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Masonry Gallery */}
      <section className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                style={{
                  position: 'relative',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: '420px',
                  backgroundColor: 'var(--color-burgundy-dark)',
                }}
                className="image-reveal-wrapper"
              >
                <img src={item.image} alt={item.title} />

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '2rem',
                    background: 'linear-gradient(to top, rgba(55, 23, 28, 0.95), transparent)',
                    color: 'var(--color-ivory)',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
                    {item.category} • {item.location}
                  </span>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--color-ivory)', fontFamily: 'var(--font-serif)' }}>
                    {item.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gold-light)', fontStyle: 'italic', marginTop: '0.4rem' }}>
                    {item.couples}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Lightbox Modal */}
      {activeItem && (
        <PortfolioModal item={activeItem} onClose={() => setActiveItem(null)} onOpenEnquiry={onOpenEnquiry} />
      )}
    </div>
  );
}
