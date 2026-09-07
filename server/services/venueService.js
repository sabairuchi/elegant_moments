import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/venues.json');

export const ALLOWED_VENUE_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];

class VenueService {
  async _readDB() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT' || error instanceof SyntaxError) {
        await this._writeDB([]);
        return [];
      }
      throw error;
    }
  }

  async _writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  async getAllVenues({ status, search } = {}) {
    const venues = await this._readDB();
    let filtered = [...venues];

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

  async getVenueById(id) {
    const venues = await this._readDB();
    const venue = venues.find(v => v.id === id);
    if (!venue) {
      const err = new Error('Venue not found');
      err.status = 404;
      throw err;
    }
    return venue;
  }

  async createVenue(venueData) {
    const venues = await this._readDB();
    
    const status = venueData.status || 'ACTIVE';
    if (!ALLOWED_VENUE_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_VENUE_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const newVenue = {
      id: crypto.randomUUID(),
      name: venueData.name || 'Untitled Venue',
      location: venueData.location || '',
      description: venueData.description || '',
      capacity: Number(venueData.capacity) || 0,
      pricing: Number(venueData.pricing) || 0,
      imageUrl: venueData.imageUrl || '',
      amenities: Array.isArray(venueData.amenities) ? venueData.amenities : [],
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    venues.push(newVenue);
    await this._writeDB(venues);

    return newVenue;
  }

  async updateVenue(id, updates) {
    const venues = await this._readDB();
    const index = venues.findIndex(v => v.id === id);
    
    if (index === -1) {
      const err = new Error('Venue not found');
      err.status = 404;
      throw err;
    }

    const existingVenue = venues[index];

    if (updates.status && !ALLOWED_VENUE_STATUSES.includes(updates.status)) {
      const err = new Error(`Invalid status. Must be one of: ${ALLOWED_VENUE_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (updates.capacity !== undefined) updates.capacity = Number(updates.capacity) || 0;
    if (updates.pricing !== undefined) updates.pricing = Number(updates.pricing) || 0;

    const updatedVenue = {
      ...existingVenue,
      ...updates,
      id: existingVenue.id,
      createdAt: existingVenue.createdAt,
      updatedAt: new Date().toISOString()
    };

    venues[index] = updatedVenue;
    await this._writeDB(venues);

    return updatedVenue;
  }

  async deleteVenue(id) {
    const venues = await this._readDB();
    const index = venues.findIndex(v => v.id === id);
    
    if (index === -1) {
      const err = new Error('Venue not found');
      err.status = 404;
      throw err;
    }

    const deleted = venues[index];
    venues.splice(index, 1);
    await this._writeDB(venues);

    return deleted;
  }
}

export const venueService = new VenueService();
