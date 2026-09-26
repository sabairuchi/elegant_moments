import express from 'express';
import { vendorManagementController } from '../../controllers/vendorManagementController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/my-assignments', requireRoles('vendor', 'admin', 'super_admin'), vendorManagementController.getMyAssignments);
router.get('/all', requireRoles('super_admin', 'admin', 'planner'), vendorManagementController.getAllVendors);
router.post('/assign', requireRoles('super_admin', 'admin', 'planner'), vendorManagementController.assignVendor);

export default router;
