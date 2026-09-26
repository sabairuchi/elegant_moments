import express from 'express';
import {
  getWeddings,
  getWeddingById,
  createWedding,
  updateWedding,
  deleteWedding
} from '../../controllers/weddingController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission, checkResourceOwnership } from '../../middleware/rbacMiddleware.js';
import { weddingService } from '../../services/weddingService.js';
import { PERMISSIONS } from '../../config/permissions.js';

import { checklistController } from '../../controllers/checklistController.js';
import { guestController } from '../../controllers/guestController.js';

const router = express.Router();

router.use(authenticateUser);

// helper owner...
const getWeddingOwner = async (req) => {
  const weddingId = req.params.id || req.params.weddingId;
  const wedding = await weddingService.getWeddingById(weddingId);

  if (req.user.role === 'client' && (wedding.clientId === req.user.id || wedding.clientProfileId === req.user.id || wedding.clientProfileId === req.user.email)) {
    return req.user.id;
  }

  if (req.user.role === 'planner' && (wedding.assignedPlannerId === req.user.id || wedding.plannerProfileId === req.user.id)) {
    return req.user.id;
  }

  return 'UNAUTHORIZED_OWNER';
};

// GET /api/weddings
router.get('/', requirePermission(PERMISSIONS.WEDDINGS_VIEW), getWeddings);

// GET /api/weddings/new
router.get('/new', requirePermission(PERMISSIONS.WEDDINGS_VIEW), (req, res) => {
  res.json({
    success: true,
    wedding: {
      weddingName: '',
      clientName: '',
      weddingDate: '',
      status: 'PLANNING',
      guestCount: '',
      budget: '',
      notes: '',
      venueReference: '',
      selectedVenueId: '',
      selectedServices: [],
      assignedPlannerId: '',
      clientId: ''
    }
  });
});

// Checklist Routes
router.get('/:weddingId/checklist', checklistController.getChecklist);
router.post('/:weddingId/checklist', checklistController.addItem);
router.put('/:weddingId/checklist/:taskId', checklistController.updateItem);
router.delete('/:weddingId/checklist/:taskId', checklistController.deleteItem);

// Guest Routes
router.get('/:weddingId/guests', guestController.getGuests);
router.post('/:weddingId/guests', guestController.addGuest);
router.put('/:weddingId/guests/:guestId', guestController.updateGuest);
router.delete('/:weddingId/guests/:guestId', guestController.deleteGuest);

// GET /api/weddings/:id
router.get('/:id',
  requirePermission(PERMISSIONS.WEDDINGS_VIEW),
  checkResourceOwnership(getWeddingOwner),
  getWeddingById
);

// POST /api/weddings
router.post('/', requirePermission(PERMISSIONS.WEDDINGS_CREATE), createWedding);

// PATCH /api/weddings/:id
router.patch('/:id',
  requirePermission(PERMISSIONS.WEDDINGS_UPDATE),
  checkResourceOwnership(getWeddingOwner),
  updateWedding
);

// DELETE /api/weddings/:id
router.delete('/:id', requirePermission(PERMISSIONS.WEDDINGS_DELETE), deleteWedding);

export default router;
