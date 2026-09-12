import crypto from 'crypto';
import { query } from '../db/index.js';

export const ALLOWED_SERVICE_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
export const ALLOWED_SERVICE_CATEGORIES = ['Photography', 'Videography', 'Catering', 'Decor', 'Florist', 'Music/Entertainment', 'Cake', 'Makeup & Hair', 'Other'];

let memoryServices = [];

const mapRowToService = (row) => ({
  id: row.id,
  name: row.name || row.title || 'Untitled Service',
  category: row.category || 'Other',
  description: row.description || '',
  startingPrice: Number(row.starting_price ?? row.base_price ?? 0),
  imageUrl: row.image_url || '',
  status: row.status || (row.is_active ? 'ACTIVE' : 'INACTIVE'),
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

class ServiceService {
  async getAllServices({ category, status, search } = {}) {
    try {
      let sql = 'SELECT * FROM services WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (category && category !== 'All') {
        sql += ` AND category = $${paramIdx++}`;
        params.push(category);
      }

      if (status && status !== 'All') {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }

      if (search) {
        sql += ` AND (LOWER(title) LIKE $${paramIdx} OR LOWER(name) LIKE $${paramIdx} OR LOWER(description) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY created_at DESC';

      const res = await query(sql, params);
      const services = res.rows.map(mapRowToService);
      return { services, total: services.length };
    } catch (dbErr) {
      // In-memory fallback if DB pool is unconfigured or in offline test mode
      let filtered = [...memoryServices];
      if (category && category !== 'All') {
        filtered = filtered.filter(s => s.category === category);
      }
      if (status && status !== 'All') {
        filtered = filtered.filter(s => s.status === status);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(s => 
          (s.name && s.name.toLowerCase().includes(searchLower)) ||
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
      }
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { services: filtered, total: filtered.length };
    }
  }

  async getServiceById(id) {
    try {
      const res = await query('SELECT * FROM services WHERE id = $1', [id]);
      if (res.rows.length === 0) {
        const err = new Error('Service not found');
        err.status = 404;
        throw err;
      }
      return mapRowToService(res.rows[0]);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const service = memoryServices.find(s => s.id === id);
      if (!service) {
        const err = new Error('Service not found');
        err.status = 404;
        throw err;
      }
      return service;
    }
  }

  async createService(serviceData) {
    const status = serviceData.status || 'ACTIVE';
    if (!ALLOWED_SERVICE_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_SERVICE_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const category = serviceData.category || 'Other';
    if (!ALLOWED_SERVICE_CATEGORIES.includes(category)) {
      const err = new Error(`Invalid category. Must be one of: ${ALLOWED_SERVICE_CATEGORIES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const id = crypto.randomUUID();
    const name = serviceData.name || 'Untitled Service';
    const description = serviceData.description || '';
    const startingPrice = Number(serviceData.startingPrice) || 0;
    const imageUrl = serviceData.imageUrl || '';
    const now = new Date().toISOString();

    try {
      const sql = `
        INSERT INTO services (id, title, name, category, base_price, starting_price, description, image_url, status, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const params = [
        id, name, name, category, startingPrice, startingPrice, description, imageUrl, status, status === 'ACTIVE', now, now
      ];
      const res = await query(sql, params);
      return mapRowToService(res.rows[0]);
    } catch (dbErr) {
      const newService = {
        id,
        name,
        category,
        description,
        startingPrice,
        imageUrl,
        status,
        createdAt: now,
        updatedAt: now
      };
      memoryServices.push(newService);
      return newService;
    }
  }

  async updateService(id, updates) {
    if (updates.status && !ALLOWED_SERVICE_STATUSES.includes(updates.status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_SERVICE_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (updates.category && !ALLOWED_SERVICE_CATEGORIES.includes(updates.category)) {
      const err = new Error(`Invalid category. Must be one of: ${ALLOWED_SERVICE_CATEGORIES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    try {
      const existingRes = await query('SELECT * FROM services WHERE id = $1', [id]);
      if (existingRes.rows.length === 0) {
        const err = new Error('Service not found');
        err.status = 404;
        throw err;
      }

      const current = existingRes.rows[0];
      const name = updates.name !== undefined ? updates.name : (current.name || current.title);
      const category = updates.category !== undefined ? updates.category : current.category;
      const description = updates.description !== undefined ? updates.description : current.description;
      const startingPrice = updates.startingPrice !== undefined ? Number(updates.startingPrice) : Number(current.starting_price || current.base_price || 0);
      const imageUrl = updates.imageUrl !== undefined ? updates.imageUrl : current.image_url;
      const status = updates.status !== undefined ? updates.status : current.status;
      const now = new Date().toISOString();

      const sql = `
        UPDATE services
        SET title = $1, name = $2, category = $3, base_price = $4, starting_price = $5, description = $6, image_url = $7, status = $8, is_active = $9, updated_at = $10
        WHERE id = $11
        RETURNING *
      `;
      const params = [name, name, category, startingPrice, startingPrice, description, imageUrl, status, status === 'ACTIVE', now, id];
      const res = await query(sql, params);
      return mapRowToService(res.rows[0]);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const index = memoryServices.findIndex(s => s.id === id);
      if (index === -1) {
        const err = new Error('Service not found');
        err.status = 404;
        throw err;
      }
      const updated = {
        ...memoryServices[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString()
      };
      memoryServices[index] = updated;
      return updated;
    }
  }

  async deleteService(id) {
    try {
      const existingRes = await query('SELECT * FROM services WHERE id = $1', [id]);
      if (existingRes.rows.length === 0) {
        const err = new Error('Service not found');
        err.status = 404;
        throw err;
      }
      const service = mapRowToService(existingRes.rows[0]);
      await query('DELETE FROM services WHERE id = $1', [id]);
      return service;
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const index = memoryServices.findIndex(s => s.id === id);
      if (index === -1) {
        const err = new Error('Service not found');
        err.status = 404;
        throw err;
      }
      const deleted = memoryServices[index];
      memoryServices.splice(index, 1);
      return deleted;
    }
  }
}

export const serviceService = new ServiceService();
