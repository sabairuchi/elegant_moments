import React, { useState } from 'react';
import { ArrowRight, BookOpen, Clock, X } from '../components/Icons';
import { JOURNAL_ARTICLES } from '../data/content';

export default function Journal() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const tags = ['All', 'INSPIRATION', 'DESTINATIONS', 'PLANNING', 'DESIGN', 'REAL WEDDINGS'];

  const filteredPosts = JOURNAL_ARTICLES.filter(
    (post) => selectedTag === 'All' || post.category.toUpperCase().includes(selectedTag)
  );

  return (
    <div style={{ paddingTop: '5rem', backgroundColor: 'var(--color-ivory)' }}>
      {/* 8. JOURNAL — EDITORIAL MAGAZINE HERO WITH ARCHITECTURAL BACKGROUND */}
      <section
        style={{
          position: 'relative',
          minHeight: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-burgundy-dark)',
          color: 'var(--color-ivory)',
          overflow: 'hidden',
          textAlign: 'center',
          padding: '5rem 1.5rem',
        }}
      >
        {/* Background Architectural Wedding Image (Natural Appearance) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90"
            alt="Lake Como Villa Estate"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Hero Overlay Content */}
        <div className="container-luxury" style={{ position: 'relative', zIndex: 2, maxWidth: '950px' }}>
          <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1.2rem', letterSpacing: '0.35em', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
            THE JOURNAL
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.8rem, 5.8vw, 5rem)',
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-serif)',
              letterSpacing: '0.06em',
              lineHeight: '1.05',
              marginBottom: '1.5rem',
              fontWeight: '400',
              textShadow: '0 3px 20px rgba(0,0,0,0.6)',
            }}
          >
            IDEAS, INSPIRATION<br />& BEAUTIFUL DETAILS
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.15rem, 2vw, 1.6rem)',
              color: 'var(--color-gold)',
              fontStyle: 'italic',
              marginBottom: '2.5rem',
              fontWeight: '300',
              textShadow: '0 2px 15px rgba(0,0,0,0.6)',
            }}
          >
            "Notes on celebration, design, destinations and the art of gathering."
          </p>

          {/* Subcategory Tag Navigation */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '0.55rem 1.5rem',
                  border: '1px solid',
                  borderColor: selectedTag === tag ? 'var(--color-gold)' : 'rgba(201, 168, 106, 0.35)',
                  backgroundColor: selectedTag === tag ? 'var(--color-gold)' : 'rgba(74, 32, 38, 0.55)',
                  color: selectedTag === tag ? 'var(--color-burgundy)' : 'var(--color-ivory)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: '50px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Articles Grid */}
      <section className="section-padding">
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                style={{
                  backgroundColor: 'var(--color-ivory-pure)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)',
                }}
                className="experience-card-hover"
              >
                <div className="image-reveal-wrapper" style={{ height: '280px' }}>
                  <img src={post.image} alt={post.title} />
                </div>
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-gold-dark)', fontWeight: '600', marginBottom: '0.8rem', letterSpacing: '0.15em' }}>
                    <span>{post.category.toUpperCase()}</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h2 style={{ fontSize: '1.7rem', color: 'var(--color-burgundy)', marginBottom: '0.8rem', fontFamily: 'var(--font-serif)' }}>
                    {post.title}
                  </h2>

                  <p style={{ fontSize: '0.95rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                    {post.excerpt}
                  </p>

                  <button
                    onClick={() => setActiveArticle(post)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-burgundy)',
                      fontWeight: '600',
                      fontSize: '0.82rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    READ ARTICLE <ArrowRight size={14} color="var(--color-gold-dark)" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Article Reader Drawer */}
      {activeArticle && (
        <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '3rem' }}>
            <button
              onClick={() => setActiveArticle(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-burgundy)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <span className="eyebrow-label" style={{ marginBottom: '0.5rem' }}>
              {activeArticle.category.toUpperCase()} • {activeArticle.readTime}
            </span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-burgundy)', marginBottom: '1rem' }}>
              {activeArticle.title}
            </h2>

            <div className="image-reveal-wrapper" style={{ height: '340px', marginBottom: '2rem', borderRadius: '2px' }}>
              <img src={activeArticle.image} alt={activeArticle.title} />
            </div>

            <div style={{ fontSize: '1.08rem', lineHeight: '1.85', color: 'var(--color-charcoal)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ fontWeight: '500', color: 'var(--color-burgundy)' }}>
                {activeArticle.excerpt}
              </p>
              <p>
                When planning a multi-day luxury celebration, the visual narrative begins long before guests arrive at the venue. From hand-pressed botanical paper invitations to custom fragrance diffusions at cocktail hour, every touchpoint communicates your aesthetic vision.
              </p>
              <p>
                Our production team works closely with lighting sculptors and floral artists to ensure that as dusk falls over historic land sanctuaries, the atmosphere evolves effortlessly from romantic dinner light into high-energy midnight revelry.
              </p>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveArticle(null)} className="btn-outline">
                CLOSE ARTICLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
