import express from 'express';
import { userController } from '../../controllers/userController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateUser);

// GET /api/users (requires users.view permission)
router.get('/', requirePermission(PERMISSIONS.USERS_VIEW), userController.listUsers);

// PATCH /api/users/:id/status (requires users.suspend permission)
router.patch('/:id/status', requirePermission(PERMISSIONS.USERS_SUSPEND), userController.updateUserStatus);

// PATCH /api/users/:id/role (requires users.change_role permission)
router.patch('/:id/role', requirePermission(PERMISSIONS.USERS_CHANGE_ROLE), userController.updateUserRole);

export default router;
