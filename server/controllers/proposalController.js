import { proposalService } from '../services/proposalService.js';
import { weddingService } from '../services/weddingService.js';

export const getProposals = async (req, res, next) => {
  try {
    const { weddingId, status, search } = req.query;
    const { role, id } = req.user;

    const filterOptions = { weddingId, status, search };

    if (role === 'client') {
      filterOptions.clientId = id;
    } else if (role === 'planner') {
      filterOptions.plannerId = id;
    }
    // Admins and super_admins see all proposals

    const result = await proposalService.getAllProposals(filterOptions);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

export const getProposalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proposal = await proposalService.getProposalById(id);

    // Ownership & Security checks for Client and Planner
    if (req.user.role === 'client') {
      const wedding = await weddingService.getWeddingById(proposal.weddingId);
      if (wedding.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this proposal.' });
      }
    } else if (req.user.role === 'planner') {
      const wedding = await weddingService.getWeddingById(proposal.weddingId);
      if (wedding.assignedPlannerId && wedding.assignedPlannerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. Proposal belongs to an unassigned wedding.' });
      }
    }

    res.json({ success: true, proposal });
  } catch (err) {
    next(err);
  }
};

export const createProposal = async (req, res, next) => {
  try {
    const { weddingId } = req.body;
    if (!weddingId) {
      return res.status(400).json({ success: false, message: 'weddingId is required' });
    }

    // Verify planner ownership if role is planner
    if (req.user.role === 'planner') {
      const wedding = await weddingService.getWeddingById(weddingId);
      if (wedding.assignedPlannerId && wedding.assignedPlannerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. Cannot create proposal for an unassigned wedding.' });
      }
    }

    const proposal = await proposalService.createProposal(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Proposal created successfully.',
      proposal
    });
  } catch (err) {
    next(err);
  }
};

export const updateProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proposal = await proposalService.getProposalById(id);

    // Planner scoping check
    if (req.user.role === 'planner') {
      const wedding = await weddingService.getWeddingById(proposal.weddingId);
      if (wedding.assignedPlannerId && wedding.assignedPlannerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not assigned to this wedding.' });
      }
    }

    const updated = await proposalService.updateProposal(id, req.body, req.user);
    res.json({
      success: true,
      message: 'Proposal updated successfully.',
      proposal: updated
    });
  } catch (err) {
    next(err);
  }
};

export const updateProposalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, clientFeedback } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const proposal = await proposalService.getProposalById(id);

    // Security check for client role
    if (req.user.role === 'client') {
      const wedding = await weddingService.getWeddingById(proposal.weddingId);
      if (wedding.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this proposal.' });
      }
      // Clients can transition status to APPROVED, CHANGES_REQUESTED, or REJECTED
      if (!['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Clients can only set proposal status to APPROVED, CHANGES_REQUESTED, or REJECTED.'
        });
      }
    }

    const updated = await proposalService.updateProposalStatus(id, { status, clientFeedback }, req.user);

    res.json({
      success: true,
      message: `Proposal status updated to ${status}.`,
      proposal: updated
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProposal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await proposalService.deleteProposal(id, req.user);
    res.json({
      success: true,
      message: 'Proposal deleted successfully.',
      proposal: deleted
    });
  } catch (err) {
    next(err);
  }
};
