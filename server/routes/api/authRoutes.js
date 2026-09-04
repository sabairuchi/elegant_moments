import express from 'express';
import { authController } from '../../controllers/authController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { rateLimit } from '../../middleware/rateLimiter.js';
import { config } from '../../config/index.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per IP per 15 mins for development/beta
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
});

const router = express.Router();

// Public routes (with rate limiting on sensitive endpoints)
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

router.get('/debug-tokens', (req, res, next) => {
  if (config.env !== 'development') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  next();
}, authController.getDebugTokens);

// Authenticated user route
router.get('/me', authenticateUser, authController.getCurrentUser);

export default router;
