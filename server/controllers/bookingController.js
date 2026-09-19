import { bookingService } from '../services/bookingService.js';
import { weddingService } from '../services/weddingService.js';

export const getBookings = async (req, res, next) => {
  try {
    const { weddingId, status, search } = req.query;
    const { role, id } = req.user;

    const filterOptions = { weddingId, status, search };

    if (role === 'client') {
      filterOptions.clientId = id;
    } else if (role === 'planner') {
      filterOptions.plannerId = id;
    } else if (role === 'vendor') {
      filterOptions.vendorId = id;
    }

    const result = await bookingService.getAllBookings(filterOptions);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    // Ownership & Access Scoping Checks
    if (req.user.role === 'client') {
      const wedding = await weddingService.getWeddingById(booking.weddingId);
      if (wedding.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this booking.' });
      }
    } else if (req.user.role === 'planner') {
      const wedding = await weddingService.getWeddingById(booking.weddingId);
      if (wedding.assignedPlannerId && wedding.assignedPlannerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. Booking belongs to an unassigned wedding.' });
      }
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { weddingId } = req.body;
    if (!weddingId) {
      return res.status(400).json({ success: false, message: 'weddingId is required' });
    }

    if (req.user.role === 'planner') {
      const wedding = await weddingService.getWeddingById(weddingId);
      if (wedding.assignedPlannerId && wedding.assignedPlannerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. Cannot create booking for an unassigned wedding.' });
      }
    }

    const booking = await bookingService.createBooking(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

export const createBookingFromProposal = async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    if (!proposalId) {
      return res.status(400).json({ success: false, message: 'proposalId is required' });
    }

    const booking = await bookingService.createBookingFromProposal(proposalId, req.user);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully from proposal.',
      booking
    });
  } catch (err) {
    next(err);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    if (req.user.role === 'planner') {
      const wedding = await weddingService.getWeddingById(booking.weddingId);
      if (wedding.assignedPlannerId && wedding.assignedPlannerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not assigned to this wedding.' });
      }
    }

    const updated = await bookingService.updateBooking(id, req.body, req.user);
    res.json({
      success: true,
      message: 'Booking updated successfully.',
      booking: updated
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await bookingService.deleteBooking(id, req.user);
    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: deleted
    });
  } catch (err) {
    next(err);
  }
};
