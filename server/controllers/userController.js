import { userService } from '../services/userService.js';

export const userController = {
  async listUsers(req, res, next) {
    try {
      const { page, limit, search, role, status } = req.query;
      const result = await userService.listUsers({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search,
        role,
        status,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
      }

      const updatedUser = await userService.updateUserStatus(
        id,
        status,
        req.user,
        req.ip || req.connection.remoteAddress
      );

      res.status(200).json({
        success: true,
        message: 'User status updated successfully.',
        user: updatedUser,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required.' });
      }

      const updatedUser = await userService.updateUserRole(
        id,
        role,
        req.user,
        req.ip || req.connection.remoteAddress
      );

      res.status(200).json({
        success: true,
        message: 'User role updated successfully.',
        user: updatedUser,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
