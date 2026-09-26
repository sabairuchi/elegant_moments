import { checklistService } from '../services/checklistService.js';

export const checklistController = {
  async getChecklist(req, res, next) {
    try {
      const { weddingId } = req.params;
      const items = await checklistService.getWeddingChecklist(weddingId, req.user);
      res.status(200).json({ success: true, items });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async addItem(req, res, next) {
    try {
      const { weddingId } = req.params;
      const item = await checklistService.addChecklistItem(weddingId, req.body, req.user);
      res.status(201).json({ success: true, item });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async updateItem(req, res, next) {
    try {
      const { weddingId, taskId } = req.params;
      const item = await checklistService.updateChecklistItem(weddingId, taskId, req.body, req.user);
      res.status(200).json({ success: true, item });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async deleteItem(req, res, next) {
    try {
      const { weddingId, taskId } = req.params;
      await checklistService.deleteChecklistItem(weddingId, taskId, req.user);
      res.status(200).json({ success: true, message: 'Checklist task deleted.' });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
