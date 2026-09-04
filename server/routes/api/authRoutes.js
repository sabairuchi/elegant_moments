import express from 'express';
import { authController } from '../../controllers/authController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/debug-tokens', authController.getDebugTokens);

// Authenticated user route
router.get('/me', authenticateUser, authController.getCurrentUser);

export default router;
