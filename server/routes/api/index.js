import express from 'express';
import enquiryRoutes from './enquiryRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import weddingRoutes from './weddingRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import venueRoutes from './venueRoutes.js';
import proposalRoutes from './proposalRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import paymentRoutes from './paymentRoutes.js';

import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import vendorRoutes from './vendorRoutes.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Elegant Moments API (Milestone 3 Architecture)',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/consultations', consultationRoutes);
router.use('/users', userRoutes);
router.use('/weddings', weddingRoutes);
router.use('/services', serviceRoutes);
router.use('/venues', venueRoutes);
router.use('/proposals', proposalRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/vendors', vendorRoutes);

// Placeholder endpoints
const placeholderHandler = (moduleName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `Module '/api/${moduleName}' architecture is ready.`,
  });
};
router.use('/documents', placeholderHandler('documents'));

export default router;
