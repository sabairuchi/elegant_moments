import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Play, X } from '../components/Icons';
import { EXPERIENCES, VENUES, TESTIMONIALS, CINEMATIC_VIDEOS } from '../data/content';
import VenueModal from '../components/VenueModal';

export default function Home({ onOpenEnquiry }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div style={{ width: '100%', backgroundColor: 'var(--color-ivory)' }}>
      {/* 1. CINEMATIC VIDEO HERO (Full Viewport 100vh) */}
      <section className="hero-section">
        {/* Full Viewport Background Video & Poster (Natural Color Appearance) */}
        <div className="hero-video-container">
          {prefersReducedMotion ? (
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90"
              alt="Cinematic Luxury Wedding"
              className="hero-video"
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=90"
              className="hero-video"
            >
              <source src={CINEMATIC_VIDEOS.heroFallback || CINEMATIC_VIDEOS.hero} type="video/mp4" />
              <source src={CINEMATIC_VIDEOS.hero} type="video/mp4" />
            </video>
          )}
          {/* Subtle localized vignette overlay - keeps natural video colors visible, NO burgundy tint */}
          <div className="hero-vignette" />
        </div>

        {/* Hero Overlay Content */}
        <div className="container-luxury hero-content-wrapper">
          {/* Floating Brand Logo Emblem & Eyebrow */}
          <div className="hero-anim-eyebrow" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img
              src="/logo-transparent.png?v=2"
              alt="Elegant Moments Logo"
              style={{
                height: 'clamp(95px, 14vh, 135px)',
                width: 'auto',
                objectFit: 'contain',
                margin: '0 auto 0.9rem',
                display: 'block',
                filter: 'drop-shadow(0 4px 18px rgba(0, 0, 0, 0.65))',
              }}
            />
            <span
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.68rem, 1vw, 0.78rem)',
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                color: 'var(--color-gold-light)',
                fontWeight: '600',
                textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              }}
            >
              WEDDINGS • EVENTS • EXPERIENCES
            </span>
          </div>

          {/* Main Editorial Headline */}
          <div className="hero-anim-heading">
            <h1
              style={{
                fontSize: 'clamp(2.8rem, 6.2vw, 5.5rem)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-serif)',
                letterSpacing: '-0.01em',
                lineHeight: '1.08',
                marginBottom: '1.4rem',
                fontWeight: '300',
                textShadow: '0 4px 30px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              Where Every Moment<br />Becomes a Memory
            </h1>
          </div>

          {/* Supporting Subtext */}
          <div className="hero-anim-subtext">
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(0.98rem, 1.6vw, 1.22rem)',
                color: '#F4EFE6',
                fontWeight: '300',
                letterSpacing: '0.01em',
                marginBottom: '2.5rem',
                maxWidth: '620px',
                lineHeight: '1.6',
                textShadow: '0 2px 12px rgba(0,0,0,0.75)',
                opacity: 0.92,
              }}
            >
              Thoughtfully curated celebrations, beautifully designed around you.
            </p>
          </div>

          {/* Minimal Editorial CTA */}
          <div className="hero-anim-cta hero-cta-group">
            <button onClick={onOpenEnquiry} className="btn-hero-editorial">
              <span>BEGIN YOUR STORY</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Minimal Animated Scroll Indicator */}
        <a
          href="#explore-world"
          className="hero-anim-scroll"
          style={{
            position: 'absolute',
            bottom: '1.8rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            color: 'rgba(244, 239, 230, 0.75)',
            fontSize: '0.68rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
          }}
          aria-label="Scroll to content"
        >
          <span style={{ fontWeight: '500' }}>SCROLL</span>
          <div className="hero-scroll-line" />
        </a>
      </section>

      {/* 2. EDITORIAL MANIFESTO */}
      <section id="explore-world" className="section-padding" style={{ backgroundColor: 'var(--color-ivory)' }}>
        <div className="container-luxury" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span className="eyebrow-label" style={{ marginBottom: '1.2rem' }}>
              OUR MANIFESTO
            </span>
            <blockquote
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)',
                color: 'var(--color-burgundy)',
                lineHeight: '1.25',
                fontWeight: '400',
                marginBottom: '2rem',
              }}
            >
              "We don't simply plan events. We compose living atmospheres where emotion, light, and white-glove hospitality dissolve into timeless heirlooms."
            </blockquote>
            <div className="divider-flourish" />
            <div style={{ fontSize: '0.82rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-gold-dark)', fontWeight: '600' }}>
              GENEVIEVE STERLING • FOUNDER & EXECUTIVE DIRECTOR
            </div>
          </div>

          {/* Asymmetrical Editorial Composition */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '5rem', alignItems: 'center' }}>
            <div className="image-reveal-wrapper" style={{ height: '520px', borderRadius: '2px', border: '1px solid var(--color-border)' }}>
              <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80" alt="Haute Couture Bride & Groom" />
            </div>

            <div>
              <span className="eyebrow-label" style={{ marginBottom: '1.2rem' }}>
                INTENTIONAL EXCELLENCE
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '2.8rem', marginBottom: '1.5rem' }}>
                Sculpting Immersion for the Discerning Host
              </h2>
              <p style={{ fontSize: '1.08rem', lineHeight: '1.85', color: 'var(--color-charcoal-muted)', marginBottom: '1.5rem' }}>
                By intentionally restricting our production calendar to twelve high-profile weddings annually, Elegant Moments provides an unmatched level of executive devotion and spatial artistry.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.85', color: 'var(--color-charcoal-muted)', marginBottom: '2.5rem' }}>
                From securing private historic land access to orchestrating 3D lighting blueprints and sommelier vintage pairings, every detail honors your legacy.
              </p>

              <Link to="/about" className="btn-primary">
                OUR PHILOSOPHY & TEAM <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED SIGNATURE COLLECTIONS */}
      <section className="section-padding bg-ivory-dark" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 5rem' }}>
            <span className="eyebrow-label" style={{ marginBottom: '1.2rem' }}>
              CURATED ARCHITECTURE
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '3rem', marginBottom: '1rem' }}>
              Signature Collections
            </h2>
            <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '1.08rem' }}>
              Explore our framed celebration concepts designed for iconic heritage estates and private sanctuaries globally.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem' }}>
            {EXPERIENCES.slice(0, 3).map((exp) => (
              <div
                key={exp.id}
                style={{
                  backgroundColor: 'var(--color-ivory)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)',
                }}
                className="experience-card-hover"
              >
                <div className="image-reveal-wrapper" style={{ height: '440px' }}>
                  <img src={exp.image} alt={exp.title} style={{ objectPosition: 'center 35%', width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '2.2rem' }}>
                  <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold-dark)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                    {exp.category}
                  </span>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-burgundy)', marginBottom: '0.8rem', fontFamily: 'var(--font-serif)' }}>
                    {exp.title}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                    {exp.description}
                  </p>
                  <Link to="/experiences" style={{ fontSize: '0.82rem', color: 'var(--color-burgundy)', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    EXPLORE COLLECTION <ArrowRight size={14} color="var(--color-gold-dark)" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED DESTINATION STORY */}
      <section className="section-padding bg-burgundy" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container-luxury">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '5rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
                FEATURED WEDDING STORY
              </span>
              <h2 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.8rem)', color: 'var(--color-ivory)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>
                Victoria & Alexander in Lake Como
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'rgba(250, 247, 240, 0.85)', lineHeight: '1.85', marginBottom: '2.5rem' }}>
                A 3-day destination celebration at Villa d'Este featuring private wooden Riva boat arrivals, a 50-meter candlelit banquet overlooking the water, and midnight fireworks synchronized to a live orchestra.
              </p>

              <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                <Link to="/stories" className="btn-gold">
                  READ CASE STUDY <ArrowRight size={16} />
                </Link>
                <button onClick={onOpenEnquiry} className="btn-outline-gold">
                  PLAN SIMILAR EXPERIENCE
                </button>
              </div>
            </div>

            <div
              className="image-reveal-wrapper"
              style={{
                height: '540px',
                borderRadius: '2px',
                border: '1px solid var(--color-gold)',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => setActiveVideo({ title: "Victoria & Alexander — Romantic Evening Wedding", url: CINEMATIC_VIDEOS.lakeComo, fallbackUrl: CINEMATIC_VIDEOS.lakeComoFallback })}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              >
                <source src={CINEMATIC_VIDEOS.lakeComo} type="video/mp4" />
                <source src={CINEMATIC_VIDEOS.lakeComoFallback} type="video/mp4" />
              </video>
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', textAlign: 'center', color: 'var(--color-ivory)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'rgba(55,23,28,0.7)', padding: '0.6rem', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                ✦ WATCH 4K CINEMA REEL ✦
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CURATED ESTATES SPOTLIGHT */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-ivory)' }}>
        <div className="container-luxury">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="eyebrow-label" style={{ marginBottom: '1rem' }}>
                WORLDWIDE SANCTUARIES
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', fontSize: '2.8rem' }}>
                Curated Estates Collection
              </h2>
            </div>
            <Link to="/venues" className="btn-outline">
              VIEW ALL VENUES <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {VENUES.slice(0, 3).map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVenue(v)}
                style={{
                  backgroundColor: 'var(--color-ivory-pure)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  transition: 'var(--transition-smooth)',
                }}
                className="experience-card-hover"
              >
                <div className="image-reveal-wrapper" style={{ height: '280px' }}>
                  <img src={v.image} alt={v.name} />
                </div>
                <div style={{ padding: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
                    {v.type}
                  </span>
                  <h3 style={{ fontSize: '1.7rem', color: 'var(--color-burgundy)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                    {v.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-charcoal-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                    <MapPin size={15} color="var(--color-gold)" /> {v.location}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.6' }}>
                    {v.description.slice(0, 110)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIAL QUOTE */}
      <section className="section-padding bg-rose-subtle" style={{ textAlign: 'center' }}>
        <div className="container-luxury" style={{ maxWidth: '900px' }}>
          <span className="eyebrow-label" style={{ marginBottom: '1.8rem' }}>
            WORDS FROM OUR COUPLES
          </span>
          <blockquote
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3vw, 2.5rem)',
              color: 'var(--color-burgundy)',
              fontStyle: 'italic',
              lineHeight: '1.5',
              marginBottom: '2rem',
            }}
          >
            "{TESTIMONIALS[0].quote}"
          </blockquote>
          <div style={{ fontWeight: '600', color: 'var(--color-burgundy)', letterSpacing: '0.12em', fontSize: '1.1rem' }}>
            {TESTIMONIALS[0].names}
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: '0.3rem' }}>
            {TESTIMONIALS[0].event} • {TESTIMONIALS[0].location}
          </div>
        </div>
      </section>

      {/* 7. FINAL EDITORIAL CTA BANNER */}
      <section
        style={{
          backgroundColor: 'var(--color-burgundy)',
          color: 'var(--color-ivory)',
          padding: '6rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid var(--color-gold)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container-luxury" style={{ maxWidth: '720px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', letterSpacing: '0.3em', color: 'var(--color-gold)', marginBottom: '1rem', opacity: 0.85 }}>
            ✦ EM ✦
          </div>

          <span className="eyebrow-label" style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>
            YOUR CELEBRATION
          </span>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-ivory)', fontWeight: '400', lineHeight: '1.15', marginBottom: '1.2rem' }}>
            Begin Your Story
          </h2>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: 'rgba(250, 247, 240, 0.85)', fontWeight: '300', lineHeight: '1.7', marginBottom: '2.5rem', maxWidth: '540px', margin: '0 auto 2.5rem' }}>
            Tell us what you're dreaming of. We'll take care of the rest.
          </p>

          <button onClick={onOpenEnquiry} className="btn-gold" style={{ padding: '1.1rem 2.8rem', fontSize: '0.82rem', letterSpacing: '0.2em' }}>
            TELL US YOUR STORY →
          </button>
        </div>
      </section>

      {/* Venue Modal */}
      {selectedVenue && <VenueModal venue={selectedVenue} onClose={() => setSelectedVenue(null)} onOpenEnquiry={onOpenEnquiry} />}

      {/* 4K Cinema Reel Modal */}
      {activeVideo && (
        <div className="modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '960px', backgroundColor: 'var(--color-burgundy-dark)' }}>
            <button
              onClick={() => setActiveVideo(null)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'none',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-ivory)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ color: 'var(--color-ivory)', fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem' }}>
              {activeVideo.title}
            </h3>
            <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%', borderRadius: '2px', overflow: 'hidden', border: '1px solid var(--color-gold)' }}>
              <video
                controls
                autoPlay
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              >
                <source src={activeVideo.url} type="video/mp4" />
                {activeVideo.fallbackUrl && <source src={activeVideo.fallbackUrl} type="video/mp4" />}
              </video>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.02); }
          to { transform: scale(1.08); }
        }
        .experience-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-luxury);
        }
        @keyframes pulseHeight {
          0%, 100% { height: 32px; opacity: 0.85; }
          50% { height: 18px; opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
