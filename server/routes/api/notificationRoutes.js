import express from 'express';
import { notificationController } from '../../controllers/notificationController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markAsRead);

// Admin Routes
router.get('/admin/all', requireRoles('super_admin', 'admin', 'planner'), notificationController.getAllAdmin);
router.post('/admin/reminders', requireRoles('super_admin', 'admin', 'planner'), notificationController.triggerReminders);

export default router;
