import express from 'express';
import {
  getWeddings,
  getWeddingById,
  createWedding,
  updateWedding,
  deleteWedding
} from '../../controllers/weddingController.js';
import { requirePermission, checkResourceOwnership } from '../../middleware/rbacMiddleware.js';
import { weddingService } from '../../services/weddingService.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = express.Router();

// Helper to determine if user is authorized to access the wedding
const getWeddingOwner = async (req) => {
  const weddingId = req.params.id;
  const wedding = await weddingService.getWeddingById(weddingId);
  
  if (req.user.role === 'client' && wedding.clientId === req.user.id) {
    return req.user.id;
  }
  
  if (req.user.role === 'planner' && wedding.assignedPlannerId === req.user.id) {
    return req.user.id;
  }
  
  // If no match, return something that will definitely fail the req.user.id !== ownerUserId check
  return 'UNAUTHORIZED_OWNER';
};

// GET /api/weddings
// List weddings. Controller filters based on role.
router.get('/', requirePermission(PERMISSIONS.WEDDINGS_VIEW), getWeddings);

// GET /api/weddings/:id
// Get details. Owners only (or admin/super_admin via middleware bypass).
router.get('/:id', 
  requirePermission(PERMISSIONS.WEDDINGS_VIEW),
  checkResourceOwnership(getWeddingOwner),
  getWeddingById
);

// POST /api/weddings
router.post('/', requirePermission(PERMISSIONS.WEDDINGS_CREATE), createWedding);

// PATCH /api/weddings/:id
// Only planners/admins can update. Planners must own it. Clients cannot update weddings directly yet.
// Wait, if we want planners to update, we use ownership check.
router.patch('/:id', 
  requirePermission(PERMISSIONS.WEDDINGS_UPDATE),
  checkResourceOwnership(getWeddingOwner),
  updateWedding
);

// DELETE /api/weddings/:id
router.delete('/:id', requirePermission(PERMISSIONS.WEDDINGS_DELETE), deleteWedding);

export default router;
