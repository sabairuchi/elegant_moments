import crypto from 'crypto';
import { query } from '../db/index.js';
import { auditService } from './auditService.js';
import { weddingService } from './weddingService.js';
import { proposalService } from './proposalService.js';
import { serviceService } from './serviceService.js';

export const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

let memoryBookings = [];

const mapRowToBooking = (row, serviceDetails = []) => ({
  id: row.id,
  bookingNumber: row.booking_number || row.bookingNumber,
  weddingId: row.wedding_id || row.weddingId,
  proposalId: row.proposal_id || row.proposalId || null,
  weddingTitle: row.wedding_title || row.weddingTitle || '',
  clientName: row.client_name || row.clientName || '',
  weddingDate: row.wedding_date ? new Date(row.wedding_date).toISOString().split('T')[0] : null,
  venueId: row.venue_id || row.venueId || null,
  venueName: row.venue_name || row.venueName || '',
  services: serviceDetails.length > 0 ? serviceDetails : (row.services || []),
  serviceIds: row.service_ids || row.serviceIds || [],
  vendorIds: row.vendor_ids || row.vendorIds || [],
  totalAmount: Number(row.total_amount || row.totalAmount) || 0,
  depositAmount: Number(row.deposit_amount || row.depositAmount) || 0,
  status: row.status || 'PENDING',
  contractNotes: row.contract_notes || row.contractNotes || '',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

class BookingService {
  async getAllBookings({ weddingId, clientId, plannerId, vendorId, status, search } = {}) {
    try {
      let sql = 'SELECT b.*, w.wedding_title, w.client_name, w.wedding_date FROM bookings b LEFT JOIN weddings w ON b.wedding_id = w.id WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (weddingId) {
        sql += ` AND b.wedding_id = $${paramIdx++}`;
        params.push(weddingId);
      }
      if (clientId) {
        sql += ` AND w.client_id = $${paramIdx++}`;
        params.push(clientId);
      }
      if (plannerId) {
        sql += ` AND w.assigned_planner_id = $${paramIdx++}`;
        params.push(plannerId);
      }
      if (status) {
        sql += ` AND b.status = $${paramIdx++}`;
        params.push(status);
      }
      if (search) {
        sql += ` AND (LOWER(b.booking_number) LIKE $${paramIdx} OR LOWER(w.wedding_title) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY b.created_at DESC';
      const res = await query(sql, params);

      let bookings = res.rows.map(row => mapRowToBooking(row));

      if (vendorId) {
        // Retrieve vendor catalog service IDs to scope bookings
        try {
          const { services } = await serviceService.getAllServices({ vendorId });
          const vendorServiceIds = services.map(s => s.id);
          bookings = bookings.filter(b => 
            (b.serviceIds && b.serviceIds.some(sId => vendorServiceIds.includes(sId))) ||
            (b.vendorIds && b.vendorIds.includes(vendorId))
          );
        } catch {
          bookings = bookings.filter(b => b.vendorIds && b.vendorIds.includes(vendorId));
        }
      }

      return { bookings, total: bookings.length };
    } catch (dbErr) {
      let filtered = [...memoryBookings];

      if (weddingId) filtered = filtered.filter(b => b.weddingId === weddingId);
      if (status) filtered = filtered.filter(b => b.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(b => 
          (b.bookingNumber && b.bookingNumber.toLowerCase().includes(s)) ||
          (b.weddingTitle && b.weddingTitle.toLowerCase().includes(s))
        );
      }

      if (plannerId || clientId) {
        try {
          const { weddings } = await weddingService.getAllWeddings({ plannerId, clientId });
          const allowedWeddingIds = weddings.map(w => w.id);
          filtered = filtered.filter(b => allowedWeddingIds.includes(b.weddingId));
        } catch {
          // Fallback if wedding fetch error
        }
      }

      if (vendorId) {
        try {
          const { services } = await serviceService.getAllServices({ vendorId });
          const vendorServiceIds = services.map(s => s.id);
          filtered = filtered.filter(b => 
            (b.serviceIds && b.serviceIds.some(sId => vendorServiceIds.includes(sId))) ||
            (b.vendorIds && b.vendorIds.includes(vendorId)) ||
            (b.services && b.services.some(srv => vendorServiceIds.includes(srv.id || srv.serviceId)))
          );
        } catch {
          filtered = filtered.filter(b => b.vendorIds && b.vendorIds.includes(vendorId));
        }
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { bookings: filtered, total: filtered.length };
    }
  }

  async getBookingById(id) {
    try {
      const res = await query(
        'SELECT b.*, w.wedding_title, w.client_name, w.wedding_date FROM bookings b LEFT JOIN weddings w ON b.wedding_id = w.id WHERE b.id = $1',
        [id]
      );
      if (res.rows.length === 0) {
        const err = new Error('Booking not found');
        err.status = 404;
        throw err;
      }
      return mapRowToBooking(res.rows[0]);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const found = memoryBookings.find(b => b.id === id);
      if (!found) {
        const err = new Error('Booking not found');
        err.status = 404;
        throw err;
      }
      return found;
    }
  }

  async createBooking(bookingData, user = {}) {
    if (!bookingData.weddingId) {
      const err = new Error('weddingId is required for creating a booking');
      err.status = 400;
      throw err;
    }

    const wedding = await weddingService.getWeddingById(bookingData.weddingId);

    const id = crypto.randomUUID();
    const bookingNumber = bookingData.bookingNumber || `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = bookingData.status || 'CONFIRMED';
    const totalAmount = Number(bookingData.totalAmount) || 0;
    const depositAmount = Number(bookingData.depositAmount) || (totalAmount * 0.25);
    const venueId = bookingData.venueId || wedding.selectedVenueId || null;
    const serviceIds = Array.isArray(bookingData.serviceIds) ? bookingData.serviceIds : (wedding.selectedServices || []);
    const vendorIds = Array.isArray(bookingData.vendorIds) ? bookingData.vendorIds : [];
    const contractNotes = bookingData.contractNotes || '';
    const now = new Date().toISOString();

    if (!BOOKING_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${BOOKING_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const newBooking = {
      id,
      bookingNumber,
      weddingId: bookingData.weddingId,
      proposalId: bookingData.proposalId || null,
      weddingTitle: wedding.weddingName || 'Luxury Wedding',
      clientName: wedding.clientName || 'Valued Client',
      weddingDate: wedding.weddingDate || null,
      venueId,
      services: bookingData.services || [],
      serviceIds,
      vendorIds,
      totalAmount,
      depositAmount,
      status,
      contractNotes,
      createdAt: now,
      updatedAt: now
    };

    try {
      const sql = `
        INSERT INTO bookings (id, booking_number, wedding_id, proposal_id, total_amount, deposit_amount, status, contract_notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      await query(sql, [id, bookingNumber, bookingData.weddingId, bookingData.proposalId || null, totalAmount, depositAmount, status, contractNotes, now, now]);
    } catch (dbErr) {
      memoryBookings.push(newBooking);
    }

    // Automatically update wedding status to CONFIRMED or IN_PROGRESS if appropriate
    try {
      if (wedding.status === 'PLANNING') {
        await weddingService.updateWedding(wedding.id, { status: 'CONFIRMED' });
      }
    } catch {}

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'BOOKING_CREATED',
      entityType: 'BOOKING',
      entityId: id,
      details: { bookingNumber, weddingId: bookingData.weddingId, totalAmount, status }
    });

    return newBooking;
  }

  async createBookingFromProposal(proposalId, user = {}) {
    const proposal = await proposalService.getProposalById(proposalId);

    if (proposal.status !== 'APPROVED') {
      const err = new Error('Bookings can only be created from APPROVED proposals');
      err.status = 400;
      throw err;
    }

    const wedding = await weddingService.getWeddingById(proposal.weddingId);

    // Extract services and venue from proposal items
    const serviceIds = proposal.items
      .filter(i => i.serviceId)
      .map(i => i.serviceId);

    const newBooking = await this.createBooking({
      weddingId: proposal.weddingId,
      proposalId: proposal.id,
      totalAmount: proposal.finalAmount,
      depositAmount: proposal.finalAmount * 0.25,
      venueId: wedding.selectedVenueId,
      serviceIds: serviceIds.length > 0 ? serviceIds : (wedding.selectedServices || []),
      services: proposal.items,
      status: 'CONFIRMED',
      contractNotes: `Generated from Approved Proposal ${proposal.proposalNumber}. ${proposal.notes || ''}`
    }, user);

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'BOOKING_CREATED_FROM_PROPOSAL',
      entityType: 'BOOKING',
      entityId: newBooking.id,
      details: { proposalId: proposal.id, proposalNumber: proposal.proposalNumber }
    });

    return newBooking;
  }

  async updateBooking(id, updates, user = {}) {
    const existing = await this.getBookingById(id);

    if (updates.status && !BOOKING_STATUSES.includes(updates.status)) {
      const err = new Error(`Invalid status. Must be one of: ${BOOKING_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const status = updates.status !== undefined ? updates.status : existing.status;
    const contractNotes = updates.contractNotes !== undefined ? updates.contractNotes : existing.contractNotes;
    const totalAmount = updates.totalAmount !== undefined ? Number(updates.totalAmount) : existing.totalAmount;
    const depositAmount = updates.depositAmount !== undefined ? Number(updates.depositAmount) : existing.depositAmount;
    const now = new Date().toISOString();

    const updatedBooking = {
      ...existing,
      status,
      contractNotes,
      totalAmount,
      depositAmount,
      updatedAt: now
    };

    try {
      const sql = `
        UPDATE bookings
        SET status = $1, contract_notes = $2, total_amount = $3, deposit_amount = $4, updated_at = $5
        WHERE id = $6
      `;
      await query(sql, [status, contractNotes, totalAmount, depositAmount, now, id]);
    } catch (dbErr) {
      const idx = memoryBookings.findIndex(b => b.id === id);
      if (idx !== -1) {
        memoryBookings[idx] = updatedBooking;
      }
    }

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'BOOKING_UPDATED',
      entityType: 'BOOKING',
      entityId: id,
      details: { previousStatus: existing.status, newStatus: status, totalAmount }
    });

    return updatedBooking;
  }

  async deleteBooking(id, user = {}) {
    const existing = await this.getBookingById(id);
    try {
      await query('DELETE FROM bookings WHERE id = $1', [id]);
    } catch (dbErr) {
      const idx = memoryBookings.findIndex(b => b.id === id);
      if (idx !== -1) memoryBookings.splice(idx, 1);
    }

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'BOOKING_CANCELLED',
      entityType: 'BOOKING',
      entityId: id,
      details: { bookingNumber: existing.bookingNumber }
    });

    return existing;
  }
}

export const bookingService = new BookingService();
