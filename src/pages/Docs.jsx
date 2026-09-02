import React, { useState, useEffect } from 'react';
import { BookOpen, Code, Database, Layers, Sparkles, Terminal, CheckCircle2, Server } from '../components/Icons';

export default function Docs() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiHealth, setApiHealth] = useState(null);
  const [enquiriesCount, setEnquiriesCount] = useState(0);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiHealth(data))
      .catch(() => setApiHealth({ status: 'offline', note: 'Run npm run dev:server to start Express API' }));

    fetch('/api/enquiries')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEnquiriesCount(data.count);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ paddingTop: '74px', backgroundColor: 'var(--color-ivory)', minHeight: '100vh' }}>
      {/* Header */}
      <section className="section-padding bg-ivory-dark" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="container-luxury" style={{ maxWidth: '900px' }}>
          <div className="tagline-badge" style={{ marginBottom: '1.2rem' }}>
            LEARNING & DEVELOPER DOCUMENTATION
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)', marginBottom: '1.2rem' }}>
            Elegant Moments — Milestone 1 Architecture Guide
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.8' }}>
            A comprehensive, educational overview of how the customer-facing luxury experience, React component hierarchy, state validation, and Express backend persistence work together.
          </p>

          {/* Realtime API Connection Status Card */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1.2rem 1.6rem',
              backgroundColor: 'var(--color-ivory-pure)',
              border: '1px solid var(--color-gold)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Server size={22} color="var(--color-burgundy)" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--color-burgundy)' }}>Backend Express API Status:</strong>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-charcoal-muted)' }}>
                  {apiHealth?.status === 'ok' ? (
                    <span style={{ color: '#27AE60', fontWeight: '600' }}>● ONLINE (Port 5000) — Ready for Milestone 2</span>
                  ) : (
                    <span style={{ color: '#E67E22' }}>● Dev Offline Fallback Active</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--color-charcoal-light)' }}>Enquiries Saved: </span>
                <strong style={{ color: 'var(--color-burgundy)' }}>{enquiriesCount} Records</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation Tabs */}
      <section className="section-padding">
        <div className="container-luxury" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: '1. Overview & Setup', icon: Terminal },
              { id: 'brand', label: '2. Brand Assets & Logo Kit', icon: Sparkles },
              { id: 'structure', label: '3. Project Structure', icon: Layers },
              { id: 'enquiry', label: '4. Enquiry API Flow', icon: Database },
              { id: 'milestone2', label: '5. Milestone 2 Prep', icon: Code },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.9rem 1.4rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid var(--color-burgundy)' : '3px solid transparent',
                    color: isActive ? 'var(--color-burgundy)' : 'var(--color-charcoal-muted)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconComp size={18} color={isActive ? 'var(--color-gold-dark)' : 'currentColor'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW & SETUP */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>How to Run the Project Locally</h2>
                <p style={{ color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                  The project features a concurrent client and server setup using Vite and Express. Follow these simple steps:
                </p>

                <div style={{ backgroundColor: 'var(--color-burgundy-dark)', color: 'var(--color-ivory)', padding: '1.5rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.8' }}>
                  <div style={{ color: 'var(--color-gold)' }}># 1. Install dependencies (Vite, React, Express, Lucide)</div>
                  <div>npm install</div>
                  <br />
                  <div style={{ color: 'var(--color-gold)' }}># 2. Run client & server concurrently</div>
                  <div>npm run dev</div>
                  <br />
                  <div style={{ color: 'var(--color-gold)' }}># 3. Open browser</div>
                  <div>http://localhost:3000</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ color: 'var(--color-burgundy)', marginBottom: '0.8rem' }}>Key Architectural Design Decisions</h3>
                <ul style={{ marginLeft: '1.2rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.8' }}>
                  <li><strong>Vanilla CSS Tokens (`src/index.css`):</strong> Clean design system using CSS custom properties (`--color-burgundy`, `--color-gold`, etc.) to guarantee exact brand compliance without extra build clutter.</li>
                  <li><strong>Client-Side Validation & Multi-Step Wizard:</strong> The "Tell Us Your Story" modal breaks lengthy input into 3 logical steps to maximize conversion while verifying email syntax and required fields.</li>
                  <li><strong>Data Persistence Layer:</strong> API entries are saved to disk (`server/data/enquiries.json`) ensuring submitted requests persist across server restarts.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: BRAND ASSETS & LOGO KIT */}
          {activeTab === 'brand' && (
            <div>
              <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>Official Brand Logo Identity & Asset Kit</h2>
              <p style={{ color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
                The official 3D metallic gold <strong>Elegant Moments</strong> logo identity system is integrated across the website header, footer, modals, and favicon. Below are the production asset files:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {/* Full Logo Card */}
                <div style={{ padding: '1.8rem', backgroundColor: 'var(--color-burgundy-dark)', border: '1px solid var(--color-gold)', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '1.2rem', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo-transparent.png" alt="Full Transparent Logo" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ color: 'var(--color-ivory)', fontSize: '1.1rem', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>1. Full Gold Logo (Transparent)</h3>
                  <code style={{ fontSize: '0.78rem', color: 'var(--color-gold)', display: 'block', marginBottom: '1rem' }}>/logo-transparent.png</code>
                  <a href="/logo-transparent.png" download="ElegantMoments_FullLogo_Transparent.png" className="btn-gold" style={{ display: 'inline-block', padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}>
                    DOWNLOAD PNG ↓
                  </a>
                </div>

                {/* Emblem Crest Card */}
                <div style={{ padding: '1.8rem', backgroundColor: 'var(--color-ivory-pure)', border: '1px solid var(--color-gold)', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-ivory-dark)', borderRadius: '4px', marginBottom: '1.2rem', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo-emblem.png" alt="Monogram Emblem Crest" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ color: 'var(--color-burgundy)', fontSize: '1.1rem', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>2. Gold Monogram Emblem Crest</h3>
                  <code style={{ fontSize: '0.78rem', color: 'var(--color-gold-dark)', display: 'block', marginBottom: '1rem' }}>/logo-emblem.png</code>
                  <a href="/logo-emblem.png" download="ElegantMoments_Emblem_Crest.png" className="btn-primary" style={{ display: 'inline-block', padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}>
                    DOWNLOAD PNG ↓
                  </a>
                </div>

                {/* Master Original Card */}
                <div style={{ padding: '1.8rem', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#FAF7F0', borderRadius: '4px', marginBottom: '1.2rem', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo.png" alt="Master Original Logo" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ color: 'var(--color-burgundy)', fontSize: '1.1rem', marginBottom: '0.4rem', fontFamily: 'var(--font-serif)' }}>3. Master Gold Logo (Original)</h3>
                  <code style={{ fontSize: '0.78rem', color: 'var(--color-charcoal-muted)', display: 'block', marginBottom: '1rem' }}>/logo.png</code>
                  <a href="/logo.png" download="ElegantMoments_MasterLogo.png" className="btn-secondary" style={{ display: 'inline-block', padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}>
                    DOWNLOAD MASTER ↓
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECT STRUCTURE */}
          {activeTab === 'structure' && (
            <div>
              <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>Directory Layout</h2>
              <p style={{ color: 'var(--color-charcoal-muted)', marginBottom: '1.5rem' }}>
                Here is the clean separation of concerns maintained in Milestone 1:
              </p>

              <pre
                style={{
                  backgroundColor: 'var(--color-ivory-dark)',
                  padding: '1.8rem',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'monospace',
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                }}
              >
{`elegant-moments-m1/
├── server/
│   ├── index.js             # Express API server (Port 5000)
│   └── data/
│       ├── enquiries.json   # Persistent store for client story submissions
│       └── consultations.json # Persistent store for quick consultation calls
├── src/
│   ├── components/          # Reusable luxury UI components
│   │   ├── Header.jsx       # Editorial desktop header & mobile nav overlay
│   │   ├── Footer.jsx       # Brand links & concierge footer
│   │   ├── EnquiryModal.jsx # 3-step interactive "Tell Us Your Story" form
│   │   ├── VenueModal.jsx   # Venue details & gallery overlay
│   │   └── PortfolioModal.jsx # Full resolution photography lightbox
│   ├── data/
│   │   └── content.js       # Central luxury content repository
│   ├── pages/               # Customer-facing public pages
│   │   ├── Home.jsx         # Hero, Philosophy, Experiences, Cases
│   │   ├── About.jsx        # Story, Differentiators, Team Profiles
│   │   ├── Services.jsx     # 7 Luxury Services & detail drawers
│   │   ├── Experiences.jsx  # Curated collection showcases
│   │   ├── Venues.jsx       # Estate showcase with search & filters
│   │   ├── Portfolio.jsx    # Masonry gallery & lightbox
│   │   ├── Stories.jsx      # Real wedding case studies
│   │   ├── Journal.jsx      # Editorial articles & reader view
│   │   ├── Contact.jsx      # Studio addresses & general form
│   │   └── Docs.jsx         # Interactive developer documentation
│   ├── index.css            # CSS variables & typography tokens
│   ├── App.jsx              # Main React Router & modal coordinator
│   └── main.jsx             # React entrypoint
├── vite.config.js           # Vite dev server with proxy to Express backend
└── package.json`}
              </pre>
            </div>
          )}

          {/* TAB 3: ENQUIRY API FLOW */}
          {activeTab === 'enquiry' && (
            <div>
              <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>Enquiry Form & API Mechanism</h2>
              <p style={{ color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                The enquiry process handles client requests end-to-end:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { step: 'Step 1: Frontend Interaction', detail: 'User fills out the 3-step form in EnquiryModal.jsx. Real-time validation checks email regex and mandatory fields.' },
                  { step: 'Step 2: HTTP POST Payload', detail: 'Form data is serialized and dispatched via fetch("/api/enquiries", { method: "POST", body: JSON.stringify(formData) }).' },
                  { step: 'Step 3: Vite Proxy Routing', detail: 'Vite proxies /api to http://localhost:5000/api/enquiries during development.' },
                  { step: 'Step 4: Express Validation & Disk Write', detail: 'server/index.js validates input, assigns unique reference ID (e.g. ENQ-982143), and unshifts to server/data/enquiries.json.' },
                  { step: 'Step 5: Client Confirmation', detail: 'Modal renders luxury success screen with reference ID and next steps.' }
                ].map((s, i) => (
                  <div key={i} style={{ padding: '1.2rem', backgroundColor: 'var(--color-ivory-pure)', border: '1px solid var(--color-border)', borderRadius: '3px' }}>
                    <strong style={{ color: 'var(--color-burgundy)', fontSize: '0.95rem' }}>{s.step}</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)', marginTop: '0.3rem' }}>{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MILESTONE 2 PREPARATION */}
          {activeTab === 'milestone2' && (
            <div>
              <h2 style={{ color: 'var(--color-burgundy)', marginBottom: '1rem' }}>Extending for Milestone 2 (Admin Dashboard)</h2>
              <p style={{ color: 'var(--color-charcoal-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Milestone 1 is specifically engineered so Milestone 2 can seamlessly build the Admin Dashboard and Role-Based Access Control (RBAC) without modifying the public site:
              </p>

              <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-ivory-dark)', borderLeft: '4px solid var(--color-gold)', borderRadius: '3px' }}>
                <h4 style={{ color: 'var(--color-burgundy)', marginBottom: '0.5rem' }}>Milestone 2 Integration Blueprints:</h4>
                <ul style={{ marginLeft: '1.2rem', color: 'var(--color-charcoal-muted)', lineHeight: '1.7' }}>
                  <li><strong>Endpoint Reuse:</strong> The Admin Dashboard can directly fetch `GET /api/enquiries` to view incoming lead submissions with status filtering (`New`, `In Review`, `Booked`).</li>
                  <li><strong>Authentication Module:</strong> Next milestone can attach JWT middleware to `/api/admin/*` routes while leaving public routes open.</li>
                  <li><strong>Database Migration:</strong> The `readData` and `writeData` helpers in `server/index.js` can be swapped for PostgreSQL / MongoDB drivers with zero frontend breaking changes.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
