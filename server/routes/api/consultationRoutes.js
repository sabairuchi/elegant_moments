import express from 'express';
import { getConsultations, getConsultationById, createConsultation, updateConsultation } from '../../controllers/consultationController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = express.Router();

// Public route to submit a consultation
router.post('/', createConsultation);

// Protected routes
router.get('/', authenticateUser, requirePermission(PERMISSIONS.CONSULTATIONS_VIEW), getConsultations);
router.get('/:id', authenticateUser, requirePermission(PERMISSIONS.CONSULTATIONS_VIEW), getConsultationById);
router.patch('/:id', authenticateUser, requirePermission(PERMISSIONS.CONSULTATIONS_UPDATE), updateConsultation);

export default router;
