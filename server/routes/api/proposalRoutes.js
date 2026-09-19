import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { requirePermission } from '../../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../../config/permissions.js';
import {
  getProposals,
  getProposalById,
  createProposal,
  updateProposal,
  updateProposalStatus,
  deleteProposal
} from '../../controllers/proposalController.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', requirePermission(PERMISSIONS.PROPOSALS_VIEW), getProposals);
router.get('/:id', requirePermission(PERMISSIONS.PROPOSALS_VIEW), getProposalById);
router.post('/', requirePermission(PERMISSIONS.PROPOSALS_CREATE), createProposal);
router.patch('/:id', requirePermission(PERMISSIONS.PROPOSALS_UPDATE), updateProposal);
router.patch('/:id/status', requirePermission(PERMISSIONS.PROPOSALS_UPDATE), updateProposalStatus);
router.delete('/:id', requirePermission(PERMISSIONS.PROPOSALS_DELETE), deleteProposal);

export default router;
