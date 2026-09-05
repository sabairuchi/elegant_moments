import express from 'express';
import enquiryRoutes from './enquiryRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import weddingRoutes from './weddingRoutes.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Elegant Moments API (Milestone 2.2 Layered Architecture)',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/consultations', consultationRoutes);
router.use('/users', userRoutes);
router.use('/weddings', weddingRoutes);

// Placeholder endpoints for Milestone 2 modules (M2.3 onwards)
const placeholderHandler = (moduleName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `Module '/api/${moduleName}' architecture is ready. Implementation arrives in Milestone 2.3+.`,
  });
};
router.use('/services', placeholderHandler('services'));
router.use('/venues', placeholderHandler('venues'));
router.use('/proposals', placeholderHandler('proposals'));
router.use('/bookings', placeholderHandler('bookings'));
router.use('/documents', placeholderHandler('documents'));
router.use('/notifications', placeholderHandler('notifications'));

export default router;
