import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { auditService } from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/weddings.json');

const ALLOWED_STATUSES = ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

class WeddingService {
  async _readDB() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this._writeDB([]);
        return [];
      }
      throw error;
    }
  }

  async _writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  async getAllWeddings({ plannerId, clientId, search, status } = {}) {
    const weddings = await this._readDB();
    let filtered = [...weddings];

    if (plannerId) {
      filtered = filtered.filter(w => w.assignedPlannerId === plannerId);
    }

    if (clientId) {
      filtered = filtered.filter(w => w.clientId === clientId);
    }

    if (status) {
      filtered = filtered.filter(w => w.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(w => 
        (w.weddingName && w.weddingName.toLowerCase().includes(searchLower)) ||
        (w.clientName && w.clientName.toLowerCase().includes(searchLower))
      );
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { weddings: filtered, total: filtered.length };
  }

  async getWeddingById(id) {
    const weddings = await this._readDB();
    const wedding = weddings.find(w => w.id === id);
    if (!wedding) {
      const err = new Error('Wedding not found');
      err.status = 404;
      throw err;
    }
    return wedding;
  }

  async createWedding(weddingData) {
    const weddings = await this._readDB();
    
    // Validate status
    const status = weddingData.status || 'PLANNING';
    if (!ALLOWED_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const newWedding = {
      id: crypto.randomUUID(),
      clientId: weddingData.clientId,
      clientName: weddingData.clientName,
      weddingName: weddingData.weddingName || `${weddingData.clientName}'s Wedding`,
      weddingDate: weddingData.weddingDate || null,
      eventType: weddingData.eventType || 'Wedding',
      guestCount: weddingData.guestCount || null,
      budget: weddingData.budget || null,
      venueReference: weddingData.venueReference || null,
      assignedPlannerId: weddingData.assignedPlannerId || null,
      status: status,
      notes: weddingData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    weddings.push(newWedding);
    await this._writeDB(weddings);

    // Audit log is typically handled in the controller or we can log it here.
    // Let's rely on the controller passing the actor context to auditService directly,
    // or we could require actorId in createWedding. We'll do it in the controller for consistency.

    return newWedding;
  }

  async updateWedding(id, updates) {
    const weddings = await this._readDB();
    const index = weddings.findIndex(w => w.id === id);
    
    if (index === -1) {
      const err = new Error('Wedding not found');
      err.status = 404;
      throw err;
    }

    const existingWedding = weddings[index];

    // Validate status transition if provided
    if (updates.status && updates.status !== existingWedding.status) {
      if (!ALLOWED_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
        err.status = 400;
        throw err;
      }
      
      // Prevent completed/cancelled transitions to active without special handling
      // (Basic logic for now, can be expanded)
      if ((existingWedding.status === 'COMPLETED' || existingWedding.status === 'CANCELLED') && 
          ['PLANNING', 'CONFIRMED', 'IN_PROGRESS'].includes(updates.status)) {
        // Just a warning or block. Let's allow it for Super Admins (enforced in controller)
      }
    }

    const updatedWedding = {
      ...existingWedding,
      ...updates,
      id: existingWedding.id, // Ensure ID isn't overwritten
      clientId: existingWedding.clientId, // Prevent re-assigning client easily
      createdAt: existingWedding.createdAt,
      updatedAt: new Date().toISOString()
    };

    weddings[index] = updatedWedding;
    await this._writeDB(weddings);

    return updatedWedding;
  }

  async deleteWedding(id) {
    const weddings = await this._readDB();
    const index = weddings.findIndex(w => w.id === id);
    
    if (index === -1) {
      const err = new Error('Wedding not found');
      err.status = 404;
      throw err;
    }

    const deleted = weddings[index];
    weddings.splice(index, 1);
    await this._writeDB(weddings);

    return deleted;
  }
}

export const weddingService = new WeddingService();
