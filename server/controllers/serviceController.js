import { serviceService } from '../services/serviceService.js';
import { auditService } from '../services/auditService.js';

export const serviceController = {
  async getAllServices(req, res, next) {
    try {
      const { category, status, search } = req.query;
      
      const result = await serviceService.getAllServices({ category, status, search });
      
      res.status(200).json({
        success: true,
        data: result.services,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  },

  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;
      const service = await serviceService.getServiceById(id);
      
      res.status(200).json({
        success: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  },

  async createService(req, res, next) {
    try {
      const newService = await serviceService.createService(req.body);
      
      auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'CREATE_SERVICE',
        entityType: 'SERVICE',
        entityId: newService.id,
        details: { name: newService.name, category: newService.category }
      });
      
      res.status(201).json({
        success: true,
        message: 'Service created successfully.',
        data: newService
      });
    } catch (error) {
      next(error);
    }
  },

  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const updatedService = await serviceService.updateService(id, req.body);
      
      auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'UPDATE_SERVICE',
        entityType: 'SERVICE',
        entityId: updatedService.id,
        details: { updates: Object.keys(req.body) }
      });
      
      res.status(200).json({
        success: true,
        message: 'Service updated successfully.',
        data: updatedService
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      const deletedService = await serviceService.deleteService(id);
      
      auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'DELETE_SERVICE',
        entityType: 'SERVICE',
        entityId: deletedService.id,
        details: { name: deletedService.name }
      });
      
      res.status(200).json({
        success: true,
        message: 'Service deleted successfully.',
        data: deletedService
      });
    } catch (error) {
      next(error);
    }
  }
};
