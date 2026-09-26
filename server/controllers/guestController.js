import { guestService } from '../services/guestService.js';

export const guestController = {
  async getGuests(req, res, next) {
    try {
      const { weddingId } = req.params;
      const { search, rsvpStatus } = req.query;
      const data = await guestService.getWeddingGuests(weddingId, { search, rsvpStatus }, req.user);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async addGuest(req, res, next) {
    try {
      const { weddingId } = req.params;
      const guest = await guestService.addGuest(weddingId, req.body, req.user);
      res.status(201).json({ success: true, guest });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async updateGuest(req, res, next) {
    try {
      const { weddingId, guestId } = req.params;
      const guest = await guestService.updateGuest(weddingId, guestId, req.body, req.user);
      res.status(200).json({ success: true, guest });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  async deleteGuest(req, res, next) {
    try {
      const { weddingId, guestId } = req.params;
      await guestService.deleteGuest(weddingId, guestId, req.user);
      res.status(200).json({ success: true, message: 'Guest record deleted.' });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      next(error);
    }
  },
};
