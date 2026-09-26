import express from 'express';
import { aiController } from '../../controllers/aiController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Chat is accessible publicly or by logged in clients
router.post('/chat', aiController.handleChat);

// Recommendations requires authentication
router.post('/recommendations', authenticateUser, aiController.getRecommendations);

export default router;
