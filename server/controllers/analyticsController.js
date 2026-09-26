import { analyticsService } from '../services/analyticsService.js';

export const analyticsController = {
  async getDashboard(req, res, next) {
    try {
      const { dateRange, startDate, endDate } = req.query;
      const data = await analyticsService.getDashboardMetrics({ dateRange, startDate, endDate });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  },
};
