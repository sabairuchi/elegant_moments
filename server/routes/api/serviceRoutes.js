import { Router } from 'express';
import { serviceController } from '../../controllers/serviceController.js';
import { requireAuth, requirePermissions } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = Router();

// Protect all service routes with authentication
router.use(requireAuth);

// GET /api/services - View all services
router.get('/', requirePermissions([PERMISSIONS.SERVICES_VIEW]), serviceController.getAllServices);

// GET /api/services/:id - View single service
router.get('/:id', requirePermissions([PERMISSIONS.SERVICES_VIEW]), serviceController.getServiceById);

// POST /api/services - Create a new service
router.post('/', requirePermissions([PERMISSIONS.SERVICES_CREATE]), serviceController.createService);

// PATCH /api/services/:id - Update a service
router.patch('/:id', requirePermissions([PERMISSIONS.SERVICES_UPDATE]), serviceController.updateService);

// DELETE /api/services/:id - Delete a service
router.delete('/:id', requirePermissions([PERMISSIONS.SERVICES_DELETE]), serviceController.deleteService);

export default router;
