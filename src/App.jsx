import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Experiences from './pages/Experiences';
import Venues from './pages/Venues';
import Portfolio from './pages/Portfolio';
import Stories from './pages/Stories';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Docs from './pages/Docs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Helper component for automatic scroll restoration and hash anchoring
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Helper component for direct enquiry route
function EnquireRouteHandler({ onOpenEnquiry }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    onOpenEnquiry();
    navigate('/', { replace: true });
  }, [navigate, onOpenEnquiry]);
  return null;
}

export default function App() {
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  const handleOpenEnquiry = () => setEnquiryModalOpen(true);
  const handleCloseEnquiry = () => setEnquiryModalOpen(false);

  return (
    <Router>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-ivory)' }}>
        <Header onOpenEnquiry={handleOpenEnquiry} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/about" element={<About onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/services" element={<Services onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/experiences" element={<Experiences onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/venues" element={<Venues onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/portfolio" element={<Portfolio onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/stories" element={<Stories onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/contact" element={<Contact onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/enquire" element={<EnquireRouteHandler onOpenEnquiry={handleOpenEnquiry} />} />
            <Route path="*" element={<Home onOpenEnquiry={handleOpenEnquiry} />} />
          </Routes>
        </main>

        <Footer onOpenEnquiry={handleOpenEnquiry} />

        <EnquiryModal isOpen={enquiryModalOpen} onClose={handleCloseEnquiry} />
      </div>
    </Router>
  );
}
