import express from 'express';
import { analyticsController } from '../../controllers/analyticsController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/dashboard', requireRoles('super_admin', 'admin', 'planner'), analyticsController.getDashboard);

export default router;
