import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  cancelPayment,
  getPayments,
  getPaymentById,
} from '../../controllers/paymentController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/initiate', requirePermission(PERMISSIONS.PAYMENTS_CREATE), initiatePayment);
router.post('/verify', requirePermission(PERMISSIONS.PAYMENTS_CREATE), verifyPayment);
router.post('/cancel', requirePermission(PERMISSIONS.PAYMENTS_CREATE), cancelPayment);

router.get('/', requirePermission(PERMISSIONS.PAYMENTS_VIEW), getPayments);
router.get('/:id', requirePermission(PERMISSIONS.PAYMENTS_VIEW), getPaymentById);

export default router;
