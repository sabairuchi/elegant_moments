import { Router } from 'express';
import { venueController } from '../../controllers/venueController.js';
import { requireAuth, requirePermissions } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = Router();

// Protect all venue routes with authentication
router.use(requireAuth);

// GET /api/venues - View all venues
router.get('/', requirePermissions([PERMISSIONS.VENUES_VIEW]), venueController.getAllVenues);

// GET /api/venues/:id - View single venue
router.get('/:id', requirePermissions([PERMISSIONS.VENUES_VIEW]), venueController.getVenueById);

// POST /api/venues - Create a new venue
router.post('/', requirePermissions([PERMISSIONS.VENUES_CREATE]), venueController.createVenue);

// PATCH /api/venues/:id - Update a venue
router.patch('/:id', requirePermissions([PERMISSIONS.VENUES_UPDATE]), venueController.updateVenue);

// DELETE /api/venues/:id - Delete a venue
router.delete('/:id', requirePermissions([PERMISSIONS.VENUES_DELETE]), venueController.deleteVenue);

export default router;
