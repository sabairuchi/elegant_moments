import express from 'express';
import { getConsultations, getConsultationById, createConsultation, updateConsultation } from '../../controllers/consultationController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return authenticateUser(req, res, next);
  }
  next();
};

// Route to submit a consultation (Public or Authenticated Client)
router.post('/', optionalAuth, createConsultation);

// Protected routes
router.get('/', authenticateUser, requirePermission(PERMISSIONS.CONSULTATIONS_VIEW), getConsultations);
router.get('/:id', authenticateUser, requirePermission(PERMISSIONS.CONSULTATIONS_VIEW), getConsultationById);
router.patch('/:id', authenticateUser, requirePermission(PERMISSIONS.CONSULTATIONS_UPDATE), updateConsultation);

export default router;
