import express from 'express';
import { getEnquiries, getEnquiryById, createEnquiry, updateEnquiry, convertEnquiryToClient } from '../../controllers/enquiryController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = express.Router();

// Public route to submit an enquiry
router.post('/', createEnquiry);

// Protected routes
router.get('/', authenticateUser, requirePermission(PERMISSIONS.ENQUIRIES_VIEW), getEnquiries);
router.get('/:id', authenticateUser, requirePermission(PERMISSIONS.ENQUIRIES_VIEW), getEnquiryById);
router.patch('/:id', authenticateUser, requirePermission(PERMISSIONS.ENQUIRIES_UPDATE), updateEnquiry);

// Convert to client requires user creation permission (e.g. USERS_CREATE)
router.post('/:id/convert', authenticateUser, requirePermission(PERMISSIONS.USERS_CREATE), convertEnquiryToClient);

export default router;
