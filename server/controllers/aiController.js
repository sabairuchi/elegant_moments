import { aiService } from '../services/aiService.js';

export const aiController = {
  async getRecommendations(req, res, next) {
    try {
      const recommendations = await aiService.generateRecommendations(req.body || {});
      res.status(200).json(recommendations);
    } catch (error) {
      next(error);
    }
  },

  async handleChat(req, res, next) {
    try {
      const { message, history } = req.body;
      const result = await aiService.handleChatbotMessage({ message, history });
      res.status(200).json(result);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
