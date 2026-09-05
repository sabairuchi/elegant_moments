import { weddingService } from '../services/weddingService.js';
import { auditService } from '../services/auditService.js';

export const getWeddings = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const { role, id } = req.user;

    let filterOptions = { search, status };

    // Apply role-based filtering logic
    if (['client'].includes(role)) {
      filterOptions.clientId = id;
    } else if (['planner'].includes(role)) {
      filterOptions.plannerId = id;
    }
    // Admins and super_admins see everything

    const result = await weddingService.getAllWeddings(filterOptions);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getWeddingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wedding = await weddingService.getWeddingById(id);
    res.json({ success: true, wedding });
  } catch (error) {
    next(error);
  }
};

export const createWedding = async (req, res, next) => {
  try {
    const { clientId, clientName } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clientId.',
      });
    }

    const wedding = await weddingService.createWedding(req.body);

    await auditService.logAction({
      actionType: 'CREATE_WEDDING',
      entityType: 'wedding',
      entityId: wedding.id,
      actorId: req.user.id,
      details: { clientId: wedding.clientId, clientName: wedding.clientName },
    });

    return res.status(201).json({
      success: true,
      message: 'Wedding created successfully.',
      wedding,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWedding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent direct status override by planners/clients to COMPLETED or CANCELLED if desired.
    // For now, rely on service validation and permission middleware.
    
    // Track assignment changes
    let oldWedding = null;
    try {
      oldWedding = await weddingService.getWeddingById(id);
    } catch (e) {
      // ignore
    }

    const updatedWedding = await weddingService.updateWedding(id, updates);

    // General Update Audit
    await auditService.logAction({
      actionType: 'UPDATE_WEDDING',
      entityType: 'wedding',
      entityId: id,
      actorId: req.user.id,
      details: updates,
    });

    // Specific Status Audit
    if (updates.status && oldWedding && updates.status !== oldWedding.status) {
      await auditService.logAction({
        actionType: 'UPDATE_WEDDING_STATUS',
        entityType: 'wedding',
        entityId: id,
        actorId: req.user.id,
        details: { oldStatus: oldWedding.status, newStatus: updates.status },
      });
    }

    // Specific Assignment Audit
    if (updates.assignedPlannerId && oldWedding && updates.assignedPlannerId !== oldWedding.assignedPlannerId) {
      await auditService.logAction({
        actionType: 'ASSIGN_PLANNER',
        entityType: 'wedding',
        entityId: id,
        actorId: req.user.id,
        details: { oldPlannerId: oldWedding.assignedPlannerId, newPlannerId: updates.assignedPlannerId },
      });
    }

    res.json({
      success: true,
      message: 'Wedding updated successfully.',
      wedding: updatedWedding,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWedding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedWedding = await weddingService.deleteWedding(id);
    
    await auditService.logAction({
      actionType: 'DELETE_WEDDING',
      entityType: 'wedding',
      entityId: id,
      actorId: req.user.id,
      details: { weddingName: deletedWedding.weddingName },
    });

    res.json({
      success: true,
      message: 'Wedding deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
