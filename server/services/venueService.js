import { query, DEFAULT_VENUES } from '../db/index.js';

export const ALLOWED_VENUE_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

let memoryVenues = [...DEFAULT_VENUES];

const mapRowToVenue = (row) => ({
  id: row.id,
  name: row.name || 'Untitled Venue',
  location: row.location || [row.city, row.country].filter(Boolean).join(', ') || '',
  description: row.description || '',
  capacity: Number(row.capacity || 0),
  pricing: Number(row.pricing ?? row.rental_fee ?? 0),
  imageUrl: row.image_url || (Array.isArray(row.images) ? row.images[0] : ''),
  amenities: Array.isArray(row.amenities)
    ? row.amenities
    : (typeof row.amenities === 'string'
        ? (() => { try { return JSON.parse(row.amenities); } catch { return []; } })()
        : []),
  status: row.status || 'ACTIVE',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

class VenueService {
  async getAllVenues({ status, search } = {}) {
    try {
      let sql = 'SELECT * FROM venues WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (status && status !== 'All') {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }

      if (search) {
        sql += ` AND (LOWER(name) LIKE $${paramIdx} OR LOWER(location) LIKE $${paramIdx} OR LOWER(description) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY created_at DESC';

      const res = await query(sql, params);
      const venues = res.rows.map(mapRowToVenue);
      return { venues, total: venues.length };
    } catch (dbErr) {
      let filtered = [...memoryVenues];
      if (status && status !== 'All') {
        filtered = filtered.filter(v => v.status === status);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(v => 
          (v.name && v.name.toLowerCase().includes(searchLower)) ||
          (v.location && v.location.toLowerCase().includes(searchLower)) ||
          (v.description && v.description.toLowerCase().includes(searchLower))
        );
      }
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { venues: filtered, total: filtered.length };
    }
  }

  async getVenueById(id) {
    try {
      const res = await query('SELECT * FROM venues WHERE id = $1', [id]);
      if (res.rows.length === 0) {
        const err = new Error('Venue not found');
        err.status = 404;
        throw err;
      }
      return mapRowToVenue(res.rows[0]);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const venue = memoryVenues.find(v => v.id === id);
      if (!venue) {
        const err = new Error('Venue not found');
        err.status = 404;
        throw err;
      }
      return venue;
    }
  }

  async createVenue(venueData) {
    const status = venueData.status || 'ACTIVE';
    if (!ALLOWED_VENUE_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_VENUE_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const id = crypto.randomUUID();
    const name = venueData.name || 'Untitled Venue';
    const location = venueData.location || '';
    const description = venueData.description || '';
    const capacity = Number(venueData.capacity) || 0;
    const pricing = Number(venueData.pricing) || 0;
    const imageUrl = venueData.imageUrl || '';
    const amenities = Array.isArray(venueData.amenities) ? venueData.amenities : [];
    const now = new Date().toISOString();

    try {
      const sql = `
        INSERT INTO venues (id, name, location, capacity, pricing, rental_fee, description, image_url, amenities, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const params = [
        id, name, location, capacity, pricing, pricing, description, imageUrl, JSON.stringify(amenities), status, now, now
      ];
      const res = await query(sql, params);
      return mapRowToVenue(res.rows[0]);
    } catch (dbErr) {
      const newVenue = {
        id,
        name,
        location,
        description,
        capacity,
        pricing,
        imageUrl,
        amenities,
        status,
        createdAt: now,
        updatedAt: now
      };
      memoryVenues.push(newVenue);
      return newVenue;
    }
  }

  async updateVenue(id, updates) {
    if (updates.status && !ALLOWED_VENUE_STATUSES.includes(updates.status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_VENUE_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    try {
      const existingRes = await query('SELECT * FROM venues WHERE id = $1', [id]);
      if (existingRes.rows.length === 0) {
        const err = new Error('Venue not found');
        err.status = 404;
        throw err;
      }

      const current = existingRes.rows[0];
      const name = updates.name !== undefined ? updates.name : current.name;
      const location = updates.location !== undefined ? updates.location : current.location;
      const description = updates.description !== undefined ? updates.description : current.description;
      const capacity = updates.capacity !== undefined ? Number(updates.capacity) : Number(current.capacity || 0);
      const pricing = updates.pricing !== undefined ? Number(updates.pricing) : Number(current.pricing || current.rental_fee || 0);
      const imageUrl = updates.imageUrl !== undefined ? updates.imageUrl : current.image_url;
      const amenities = updates.amenities !== undefined ? (Array.isArray(updates.amenities) ? updates.amenities : []) : (Array.isArray(current.amenities) ? current.amenities : []);
      const status = updates.status !== undefined ? updates.status : current.status;
      const now = new Date().toISOString();

      const sql = `
        UPDATE venues
        SET name = $1, location = $2, capacity = $3, pricing = $4, rental_fee = $5, description = $6, image_url = $7, amenities = $8, status = $9, updated_at = $10
        WHERE id = $11
        RETURNING *
      `;
      const params = [name, location, capacity, pricing, pricing, description, imageUrl, JSON.stringify(amenities), status, now, id];
      const res = await query(sql, params);
      return mapRowToVenue(res.rows[0]);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const index = memoryVenues.findIndex(v => v.id === id);
      if (index === -1) {
        const err = new Error('Venue not found');
        err.status = 404;
        throw err;
      }
      const updated = {
        ...memoryVenues[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      };
      if (updates.capacity !== undefined) updated.capacity = Number(updates.capacity) || 0;
      if (updates.pricing !== undefined) updated.pricing = Number(updates.pricing) || 0;
      memoryVenues[index] = updated;
      return updated;
    }
  }

  async deleteVenue(id) {
    try {
      const existingRes = await query('SELECT * FROM venues WHERE id = $1', [id]);
      if (existingRes.rows.length === 0) {
        const err = new Error('Venue not found');
        err.status = 404;
        throw err;
      }
      const venue = mapRowToVenue(existingRes.rows[0]);
      await query('DELETE FROM venues WHERE id = $1', [id]);
      return venue;
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const index = memoryVenues.findIndex(v => v.id === id);
      if (index === -1) {
        const err = new Error('Venue not found');
        err.status = 404;
        throw err;
      }
      const deleted = memoryVenues[index];
      memoryVenues.splice(index, 1);
      return deleted;
    }
  }
}

export const venueService = new VenueService();
