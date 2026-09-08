import { Router } from 'express';
import { serviceController } from '../../controllers/serviceController.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = Router();

router.use(authenticateUser);

// GET /api/services - View all services
router.get('/', requirePermission(PERMISSIONS.SERVICES_VIEW), serviceController.getAllServices);

// GET /api/services/new
// Explicitly handle "new" route to prevent 404 errors when frontend requests it
router.get('/new', requirePermission(PERMISSIONS.SERVICES_VIEW), (req, res) => {
  res.json({
    success: true,
    data: {
      name: '',
      category: 'Photography',
      description: '',
      startingPrice: 0,
      imageUrl: '',
      status: 'ACTIVE'
    }
  });
});

// GET /api/services/:id - View single service
router.get('/:id', requirePermission(PERMISSIONS.SERVICES_VIEW), serviceController.getServiceById);

// POST /api/services - Create a new service
router.post('/', requirePermission(PERMISSIONS.SERVICES_CREATE), serviceController.createService);

// PATCH /api/services/:id - Update a service
router.patch('/:id', requirePermission(PERMISSIONS.SERVICES_UPDATE), serviceController.updateService);

// DELETE /api/services/:id - Delete a service
router.delete('/:id', requirePermission(PERMISSIONS.SERVICES_DELETE), serviceController.deleteService);

export default router;
