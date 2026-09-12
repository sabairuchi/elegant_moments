import crypto from 'crypto';
import { query } from '../db/index.js';
import { venueService } from './venueService.js';
import { serviceService } from './serviceService.js';

const ALLOWED_STATUSES = ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

let memoryWeddings = [];

const fetchJunctionData = async (weddingId) => {
  let selectedVenueId = null;
  let selectedServices = [];

  try {
    const venueRes = await query('SELECT venue_id FROM wedding_venues WHERE wedding_id = $1 LIMIT 1', [weddingId]);
    if (venueRes.rows.length > 0) {
      selectedVenueId = venueRes.rows[0].venue_id;
    }

    const serviceRes = await query('SELECT service_id FROM wedding_services WHERE wedding_id = $1', [weddingId]);
    selectedServices = serviceRes.rows.map(r => r.service_id);
  } catch (err) {
    // If DB is offline, junction fallback is handled in memory
  }

  return { selectedVenueId, selectedServices };
};

const mapRowToWedding = (row, selectedVenueId = null, selectedServices = []) => ({
  id: row.id,
  clientId: row.client_id || '',
  clientName: row.client_name || '',
  weddingName: row.wedding_title || row.wedding_name || (row.client_name ? `${row.client_name}'s Wedding` : 'Untitled Wedding'),
  weddingDate: row.wedding_date ? new Date(row.wedding_date).toISOString().split('T')[0] : null,
  guestCount: row.guest_count ? Number(row.guest_count) : null,
  budget: row.budget ? Number(row.budget) : (row.estimated_budget ? Number(row.estimated_budget) : null),
  selectedVenueId: selectedVenueId || row.selected_venue_id || null,
  selectedServices: selectedServices.length > 0 ? selectedServices : (row.selected_services || []),
  assignedPlannerId: row.assigned_planner_id || null,
  status: row.status || 'PLANNING',
  notes: row.notes || '',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

class WeddingService {
  async getAllWeddings({ plannerId, clientId, vendorId, search, status } = {}) {
    try {
      let sql = 'SELECT * FROM weddings WHERE deleted_at IS NULL';
      const params = [];
      let paramIdx = 1;

      if (plannerId) {
        sql += ` AND assigned_planner_id = $${paramIdx++}`;
        params.push(plannerId);
      }

      if (clientId) {
        sql += ` AND client_id = $${paramIdx++}`;
        params.push(clientId);
      }

      if (vendorId) {
        sql += ` AND id IN (SELECT wedding_id FROM wedding_services)`;
      }

      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }

      if (search) {
        sql += ` AND (LOWER(wedding_title) LIKE $${paramIdx} OR LOWER(client_name) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY created_at DESC';

      const res = await query(sql, params);
      const weddings = await Promise.all(
        res.rows.map(async (row) => {
          const { selectedVenueId, selectedServices } = await fetchJunctionData(row.id);
          return mapRowToWedding(row, selectedVenueId, selectedServices);
        })
      );

      return { weddings, total: weddings.length };
    } catch (dbErr) {
      let filtered = [...memoryWeddings];
      if (plannerId) filtered = filtered.filter(w => w.assignedPlannerId === plannerId);
      if (clientId) filtered = filtered.filter(w => w.clientId === clientId);
      if (vendorId) filtered = filtered.filter(w => w.selectedServices && w.selectedServices.length > 0);
      if (status) filtered = filtered.filter(w => w.status === status);
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(w => 
          (w.weddingName && w.weddingName.toLowerCase().includes(searchLower)) ||
          (w.clientName && w.clientName.toLowerCase().includes(searchLower))
        );
      }
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { weddings: filtered, total: filtered.length };
    }
  }

  async getWeddingById(id) {
    try {
      const res = await query('SELECT * FROM weddings WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (res.rows.length === 0) {
        const err = new Error('Wedding not found');
        err.status = 404;
        throw err;
      }
      const { selectedVenueId, selectedServices } = await fetchJunctionData(id);
      return mapRowToWedding(res.rows[0], selectedVenueId, selectedServices);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const wedding = memoryWeddings.find(w => w.id === id);
      if (!wedding) {
        const err = new Error('Wedding not found');
        err.status = 404;
        throw err;
      }
      return wedding;
    }
  }

  async createWedding(weddingData) {
    const status = weddingData.status || 'PLANNING';
    if (!ALLOWED_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (weddingData.selectedVenueId) {
      try {
        await venueService.getVenueById(weddingData.selectedVenueId);
      } catch (err) {
        const error = new Error('Invalid venue selected');
        error.status = 400;
        throw error;
      }
    }

    const selectedServices = Array.isArray(weddingData.selectedServices) ? weddingData.selectedServices : [];
    for (const serviceId of selectedServices) {
      try {
        await serviceService.getServiceById(serviceId);
      } catch (err) {
        const error = new Error(`Invalid service selected: ${serviceId}`);
        error.status = 400;
        throw error;
      }
    }

    const id = crypto.randomUUID();
    const clientId = weddingData.clientId || '';
    const clientName = weddingData.clientName || '';
    const weddingName = weddingData.weddingName || (clientName ? `${clientName}'s Wedding` : 'Untitled Wedding');
    const weddingDate = weddingData.weddingDate || null;
    const guestCount = weddingData.guestCount || null;
    const budget = weddingData.budget || null;
    const assignedPlannerId = weddingData.assignedPlannerId || null;
    const notes = weddingData.notes || '';
    const now = new Date().toISOString();

    try {
      const sql = `
        INSERT INTO weddings (id, wedding_title, client_id, client_name, wedding_date, guest_count, budget, estimated_budget, assigned_planner_id, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const params = [
        id, weddingName, clientId, clientName, weddingDate, guestCount, budget, budget, assignedPlannerId, status, notes, now, now
      ];
      const res = await query(sql, params);

      if (weddingData.selectedVenueId) {
        await query(
          'INSERT INTO wedding_venues (id, wedding_id, venue_id) VALUES ($1, $2, $3)',
          [crypto.randomUUID(), id, weddingData.selectedVenueId]
        );
      }

      for (const serviceId of selectedServices) {
        await query(
          'INSERT INTO wedding_services (id, wedding_id, service_id) VALUES ($1, $2, $3)',
          [crypto.randomUUID(), id, serviceId]
        );
      }

      return mapRowToWedding(res.rows[0], weddingData.selectedVenueId || null, selectedServices);
    } catch (dbErr) {
      const newWedding = {
        id,
        clientId,
        clientName,
        weddingName,
        weddingDate,
        guestCount,
        budget,
        selectedVenueId: weddingData.selectedVenueId || null,
        selectedServices,
        assignedPlannerId,
        status,
        notes,
        createdAt: now,
        updatedAt: now
      };
      memoryWeddings.push(newWedding);
      return newWedding;
    }
  }

  async updateWedding(id, updates) {
    let existingWedding;
    try {
      existingWedding = await this.getWeddingById(id);
    } catch (err) {
      const error = new Error('Wedding not found');
      error.status = 404;
      throw error;
    }

    if (updates.status && updates.status !== existingWedding.status) {
      if (!ALLOWED_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        err.status = 400;
        throw err;
      }
    }

    if (updates.selectedVenueId && updates.selectedVenueId !== existingWedding.selectedVenueId) {
      try {
        await venueService.getVenueById(updates.selectedVenueId);
      } catch (err) {
        const error = new Error('Invalid venue selected');
        error.status = 400;
        throw error;
      }
    }

    if (updates.selectedServices !== undefined) {
      if (!Array.isArray(updates.selectedServices)) {
        const error = new Error('selectedServices must be an array');
        error.status = 400;
        throw error;
      }
      for (const serviceId of updates.selectedServices) {
        try {
          await serviceService.getServiceById(serviceId);
        } catch (err) {
          const error = new Error(`Invalid service selected: ${serviceId}`);
          error.status = 400;
          throw error;
        }
      }
    }

    const weddingName = updates.weddingName !== undefined ? updates.weddingName : existingWedding.weddingName;
    const weddingDate = updates.weddingDate !== undefined ? updates.weddingDate : existingWedding.weddingDate;
    const guestCount = updates.guestCount !== undefined ? updates.guestCount : existingWedding.guestCount;
    const budget = updates.budget !== undefined ? updates.budget : existingWedding.budget;
    const assignedPlannerId = updates.assignedPlannerId !== undefined ? updates.assignedPlannerId : existingWedding.assignedPlannerId;
    const status = updates.status !== undefined ? updates.status : existingWedding.status;
    const notes = updates.notes !== undefined ? updates.notes : existingWedding.notes;
    const selectedVenueId = updates.selectedVenueId !== undefined ? updates.selectedVenueId : existingWedding.selectedVenueId;
    const selectedServices = updates.selectedServices !== undefined ? updates.selectedServices : existingWedding.selectedServices;
    const now = new Date().toISOString();

    try {
      const sql = `
        UPDATE weddings
        SET wedding_title = $1, wedding_date = $2, guest_count = $3, budget = $4, estimated_budget = $5, assigned_planner_id = $6, status = $7, notes = $8, updated_at = $9
        WHERE id = $10
        RETURNING *
      `;
      const params = [weddingName, weddingDate, guestCount, budget, budget, assignedPlannerId, status, notes, now, id];
      const res = await query(sql, params);

      if (updates.selectedVenueId !== undefined) {
        await query('DELETE FROM wedding_venues WHERE wedding_id = $1', [id]);
        if (selectedVenueId) {
          await query(
            'INSERT INTO wedding_venues (id, wedding_id, venue_id) VALUES ($1, $2, $3)',
            [crypto.randomUUID(), id, selectedVenueId]
          );
        }
      }

      if (updates.selectedServices !== undefined) {
        await query('DELETE FROM wedding_services WHERE wedding_id = $1', [id]);
        for (const serviceId of selectedServices) {
          await query(
            'INSERT INTO wedding_services (id, wedding_id, service_id) VALUES ($1, $2, $3)',
            [crypto.randomUUID(), id, serviceId]
          );
        }
      }

      return mapRowToWedding(res.rows[0], selectedVenueId, selectedServices);
    } catch (dbErr) {
      const index = memoryWeddings.findIndex(w => w.id === id);
      if (index !== -1) {
        const updated = {
          ...memoryWeddings[index],
          ...updates,
          id,
          selectedVenueId,
          selectedServices,
          updatedAt: now
        };
        memoryWeddings[index] = updated;
        return updated;
      }
      return {
        ...existingWedding,
        ...updates,
        id,
        selectedVenueId,
        selectedServices,
        updatedAt: now
      };
    }
  }

  async deleteWedding(id) {
    try {
      const existingRes = await query('SELECT * FROM weddings WHERE id = $1', [id]);
      if (existingRes.rows.length === 0) {
        const err = new Error('Wedding not found');
        err.status = 404;
        throw err;
      }
      const wedding = mapRowToWedding(existingRes.rows[0]);
      await query('DELETE FROM weddings WHERE id = $1', [id]);
      return wedding;
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const index = memoryWeddings.findIndex(w => w.id === id);
      if (index === -1) {
        const err = new Error('Wedding not found');
        err.status = 404;
        throw err;
      }
      const deleted = memoryWeddings[index];
      memoryWeddings.splice(index, 1);
      return deleted;
    }
  }
}

export const weddingService = new WeddingService();
