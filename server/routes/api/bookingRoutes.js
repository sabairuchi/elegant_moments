import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';
import {
  getBookings,
  getBookingById,
  createBooking,
  createBookingFromProposal,
  updateBooking,
  deleteBooking
} from '../../controllers/bookingController.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', requirePermission(PERMISSIONS.BOOKINGS_VIEW), getBookings);
router.get('/:id', requirePermission(PERMISSIONS.BOOKINGS_VIEW), getBookingById);
router.post('/', requirePermission(PERMISSIONS.BOOKINGS_CREATE), createBooking);
router.post('/from-proposal/:proposalId', requirePermission(PERMISSIONS.BOOKINGS_CREATE), createBookingFromProposal);
router.patch('/:id', requirePermission(PERMISSIONS.BOOKINGS_UPDATE), updateBooking);
router.delete('/:id', requirePermission(PERMISSIONS.BOOKINGS_CANCEL), deleteBooking);

export default router;
