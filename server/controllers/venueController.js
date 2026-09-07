import { venueService } from '../services/venueService.js';
import { auditService } from '../services/auditService.js';

export const venueController = {
  async getAllVenues(req, res, next) {
    try {
      const { status, search } = req.query;
      
      const result = await venueService.getAllVenues({ status, search });
      
      res.status(200).json({
        success: true,
        data: result.venues,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  },

  async getVenueById(req, res, next) {
    try {
      const { id } = req.params;
      const venue = await venueService.getVenueById(id);
      
      res.status(200).json({
        success: true,
        data: venue
      });
    } catch (error) {
      next(error);
    }
  },

  async createVenue(req, res, next) {
    try {
      const newVenue = await venueService.createVenue(req.body);
      
      auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'CREATE_VENUE',
        entityType: 'VENUE',
        entityId: newVenue.id,
        details: { name: newVenue.name, location: newVenue.location }
      });
      
      res.status(201).json({
        success: true,
        message: 'Venue created successfully.',
        data: newVenue
      });
    } catch (error) {
      next(error);
    }
  },

  async updateVenue(req, res, next) {
    try {
      const { id } = req.params;
      const updatedVenue = await venueService.updateVenue(id, req.body);
      
      auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'UPDATE_VENUE',
        entityType: 'VENUE',
        entityId: updatedVenue.id,
        details: { updates: Object.keys(req.body) }
      });
      
      res.status(200).json({
        success: true,
        message: 'Venue updated successfully.',
        data: updatedVenue
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteVenue(req, res, next) {
    try {
      const { id } = req.params;
      const deletedVenue = await venueService.deleteVenue(id);
      
      auditService.logAction({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'DELETE_VENUE',
        entityType: 'VENUE',
        entityId: deletedVenue.id,
        details: { name: deletedVenue.name }
      });
      
      res.status(200).json({
        success: true,
        message: 'Venue deleted successfully.',
        data: deletedVenue
      });
    } catch (error) {
      next(error);
    }
  }
};
