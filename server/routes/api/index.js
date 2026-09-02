import express from 'express';
import enquiryRoutes from './enquiryRoutes.js';
import consultationRoutes from './consultationRoutes.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Elegant Moments API (Milestone 2.1 Layered Architecture)',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Routes
router.use('/enquiries', enquiryRoutes);
router.use('/consultations', consultationRoutes);

// Placeholder endpoints for Milestone 2 modules (M2.2 onwards)
const placeholderHandler = (moduleName) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `Module '/api/${moduleName}' architecture is ready. Implementation arrives in Milestone 2.2+.`,
  });
};

router.use('/auth', placeholderHandler('auth'));
router.use('/users', placeholderHandler('users'));
router.use('/weddings', placeholderHandler('weddings'));
router.use('/services', placeholderHandler('services'));
router.use('/venues', placeholderHandler('venues'));
router.use('/proposals', placeholderHandler('proposals'));
router.use('/bookings', placeholderHandler('bookings'));
router.use('/documents', placeholderHandler('documents'));
router.use('/notifications', placeholderHandler('notifications'));

export default router;
