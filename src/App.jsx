import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';

// Public Pages
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
import AdminUsers from './pages/AdminUsers';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminConsultations from './pages/AdminConsultations';
import AdminWeddings from './pages/AdminWeddings';
import AdminWeddingDetails from './pages/AdminWeddingDetails';
import ClientWedding from './pages/ClientWedding';

// Auth Pages (M2.2)
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Protected Route Placeholders (M2.2)
import {
  ClientDashboardPlaceholder,
  PlannerDashboardPlaceholder,
  VendorDashboardPlaceholder,
  AdminDashboardPlaceholder,
  SuperAdminDashboardPlaceholder,
} from './pages/ProtectedPlaceholders';

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
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-ivory)' }}>
          <Header onOpenEnquiry={handleOpenEnquiry} />

          <main style={{ flex: 1, paddingTop: '96px' }}>
            <Routes>
              {/* Public Website Routes */}
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

              {/* Authentication Routes (M2.2) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Authenticated Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Role-Protected Route Foundations (M2.2) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['client', 'admin', 'super_admin']}>
                    <ClientWedding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/planner"
                element={
                  <ProtectedRoute allowedRoles={['planner', 'admin', 'super_admin']}>
                    <PlannerDashboardPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin', 'super_admin']}>
                    <VendorDashboardPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                    <AdminDashboardPlaceholder />
                  </ProtectedRoute>
                }
              />
              {/* Admin Workflow Routes */}
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredPermissions={['users.view']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/enquiries" 
                element={
                  <ProtectedRoute requiredPermissions={['enquiries.view']}>
                    <AdminEnquiries />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/consultations" 
                element={
                  <ProtectedRoute requiredPermissions={['consultations.view']}>
                    <AdminConsultations />
                  </ProtectedRoute>
                } 
              />
              {/* M2.5 Wedding Management Routes */}
              <Route 
                path="/admin/weddings" 
                element={
                  <ProtectedRoute requiredPermissions={['weddings.view']}>
                    <AdminWeddings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/weddings/:id" 
                element={
                  <ProtectedRoute requiredPermissions={['weddings.view']}>
                    <AdminWeddingDetails />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboardPlaceholder />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Home onOpenEnquiry={handleOpenEnquiry} />} />
            </Routes>
          </main>

          <Footer onOpenEnquiry={handleOpenEnquiry} />

          <EnquiryModal isOpen={enquiryModalOpen} onClose={handleCloseEnquiry} />
        </div>
      </Router>
    </AuthProvider>
  );
}
