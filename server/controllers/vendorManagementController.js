import { vendorManagementService } from '../services/vendorManagementService.js';

export const vendorManagementController = {
  async getMyAssignments(req, res, next) {
    try {
      const vendorUserId = req.user.id;
      const assignments = await vendorManagementService.getVendorAssignments(vendorUserId);
      res.status(200).json({ success: true, assignments });
    } catch (error) {
      next(error);
    }
  },

  async getAllVendors(req, res, next) {
    try {
      const vendors = await vendorManagementService.getAllVendorsWithStats();
      res.status(200).json({ success: true, vendors });
    } catch (error) {
      next(error);
    }
  },

  async assignVendor(req, res, next) {
    try {
      const { vendorUserId, weddingId, serviceTitle, customPrice } = req.body;
      const assignment = await vendorManagementService.assignVendorToWedding({ vendorUserId, weddingId, serviceTitle, customPrice });
      res.status(201).json({ success: true, assignment });
    } catch (error) {
      next(error);
    }
  },
};
