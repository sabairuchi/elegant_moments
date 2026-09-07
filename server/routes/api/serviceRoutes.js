import { Router } from 'express';
import { serviceController } from '../../controllers/serviceController.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = Router();

// GET /api/services - View all services
router.get('/', requirePermission(PERMISSIONS.SERVICES_VIEW), serviceController.getAllServices);

// GET /api/services/:id - View single service
router.get('/:id', requirePermission(PERMISSIONS.SERVICES_VIEW), serviceController.getServiceById);

// POST /api/services - Create a new service
router.post('/', requirePermission(PERMISSIONS.SERVICES_CREATE), serviceController.createService);

// PATCH /api/services/:id - Update a service
router.patch('/:id', requirePermission(PERMISSIONS.SERVICES_UPDATE), serviceController.updateService);

// DELETE /api/services/:id - Delete a service
router.delete('/:id', requirePermission(PERMISSIONS.SERVICES_DELETE), serviceController.deleteService);

export default router;
