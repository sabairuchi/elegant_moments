import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  async getMyNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      const notifications = await notificationService.getUserNotifications(userId, userEmail);
      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await notificationService.markAsRead(id, userId);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllAdmin(req, res, next) {
    try {
      const { page, limit, search, type, status } = req.query;
      const result = await notificationService.getAllNotificationsAdmin({ page, limit, search, type, status });
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async triggerReminders(req, res, next) {
    try {
      const result = await notificationService.checkAndSendReminders();
      res.status(200).json({
        success: true,
        message: 'Appointment reminder check executed successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
