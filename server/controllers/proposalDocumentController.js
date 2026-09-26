import { proposalDocumentService } from '../services/proposalDocumentService.js';

export const proposalDocumentController = {
  async getProposalDocument(req, res, next) {
    try {
      const { id } = req.params;
      const html = await proposalDocumentService.generateProposalHTML(id);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
