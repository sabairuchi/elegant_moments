import { Router } from 'express';
import { venueController } from '../../controllers/venueController.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = Router();

// GET /api/venues - View all venues
router.get('/', requirePermission(PERMISSIONS.VENUES_VIEW), venueController.getAllVenues);

// GET /api/venues/:id - View single venue
router.get('/:id', requirePermission(PERMISSIONS.VENUES_VIEW), venueController.getVenueById);

// POST /api/venues - Create a new venue
router.post('/', requirePermission(PERMISSIONS.VENUES_CREATE), venueController.createVenue);

// PATCH /api/venues/:id - Update a venue
router.patch('/:id', requirePermission(PERMISSIONS.VENUES_UPDATE), venueController.updateVenue);

// DELETE /api/venues/:id - Delete a venue
router.delete('/:id', requirePermission(PERMISSIONS.VENUES_DELETE), venueController.deleteVenue);

export default router;
