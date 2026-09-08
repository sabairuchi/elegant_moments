import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/services.json');

export const ALLOWED_SERVICE_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
export const ALLOWED_SERVICE_CATEGORIES = ['Photography', 'Videography', 'Catering', 'Decor', 'Florist', 'Music/Entertainment', 'Cake', 'Makeup & Hair', 'Other'];

class ServiceService {
  async _readDB() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT' || error instanceof SyntaxError) {
        return [];
      }
      throw error;
    }
  }

  async _writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  async getAllServices({ category, status, search } = {}) {
    const services = await this._readDB();
    let filtered = [...services];

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

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { services: filtered, total: filtered.length };
  }

  async getServiceById(id) {
    const services = await this._readDB();
    const service = services.find(s => s.id === id);
    if (!service) {
      const err = new Error('Service not found');
      err.status = 404;
      throw err;
    }
    return service;
  }

  async createService(serviceData) {
    const services = await this._readDB();
    
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

    const newService = {
      id: crypto.randomUUID(),
      name: serviceData.name || 'Untitled Service',
      category: category,
      description: serviceData.description || '',
      startingPrice: Number(serviceData.startingPrice) || 0,
      imageUrl: serviceData.imageUrl || '',
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    services.push(newService);
    await this._writeDB(services);

    return newService;
  }

  async updateService(id, updates) {
    const services = await this._readDB();
    const index = services.findIndex(s => s.id === id);
    
    if (index === -1) {
      const err = new Error('Service not found');
      err.status = 404;
      throw err;
    }

    const existingService = services[index];

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

    if (updates.startingPrice !== undefined) {
      updates.startingPrice = Number(updates.startingPrice) || 0;
    }

    const updatedService = {
      ...existingService,
      ...updates,
      id: existingService.id,
      createdAt: existingService.createdAt,
      updatedAt: new Date().toISOString()
    };

    services[index] = updatedService;
    await this._writeDB(services);

    return updatedService;
  }

  async deleteService(id) {
    const services = await this._readDB();
    const index = services.findIndex(s => s.id === id);
    
    if (index === -1) {
      const err = new Error('Service not found');
      err.status = 404;
      throw err;
    }

    const deleted = services[index];
    services.splice(index, 1);
    await this._writeDB(services);

    return deleted;
  }
}

export const serviceService = new ServiceService();
