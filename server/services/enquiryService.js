import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENQUIRIES_FILE = path.join(__dirname, '..', 'data', 'enquiries.json');

let memoryEnquiries = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(ENQUIRIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(ENQUIRIES_FILE)) fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only environment
  }
};

const readData = () => {
  if (memoryEnquiries) return memoryEnquiries;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
      memoryEnquiries = JSON.parse(raw);
    } else {
      memoryEnquiries = [];
    }
  } catch (err) {
    memoryEnquiries = [];
  }
  return memoryEnquiries;
};

const writeData = (data) => {
  memoryEnquiries = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const mapRowToEnquiry = (row) => ({
  id: row.id,
  enquiryNumber: row.enquiry_number || row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  eventType: row.event_type || 'Wedding',
  eventDate: row.event_date ? new Date(row.event_date).toISOString().split('T')[0] : '',
  location: row.location || '',
  guestCount: row.guest_count || '',
  estimatedBudget: row.estimated_budget || '',
  servicesRequired: Array.isArray(row.services_required) ? row.services_required : (row.services_required ? (typeof row.services_required === 'string' ? JSON.parse(row.services_required) : []) : []),
  vision: row.vision || '',
  status: row.status || 'NEW',
  internalNotes: row.internal_notes || '',
  assignedTo: row.assigned_to || null,
  convertedUserId: row.converted_user_id || null,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
});

export const ENQUIRY_STATUSES = [
  'NEW', 'CONTACTED', 'CONSULTATION_SCHEDULED',
  'CONSULTATION_COMPLETED', 'QUALIFIED', 'CONVERTED',
  'CLOSED', 'LOST'
];

export const enquiryService = {
  async getAllEnquiries(options = {}) {
    const { page = 1, limit = 10, search = '', status = '', email = '' } = options;

    try {
      let sql = 'SELECT * FROM enquiries WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (email) {
        sql += ` AND LOWER(email) = $${paramIdx++}`;
        params.push(email.toLowerCase());
      }
      if (search) {
        sql += ` AND (LOWER(name) LIKE $${paramIdx} OR LOWER(email) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }
      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }

      sql += ' ORDER BY created_at DESC';
      const res = await query(sql, params);
      const enquiries = res.rows.map(mapRowToEnquiry);

      const total = enquiries.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedEnquiries = enquiries.slice(offset, offset + limit);

      return {
        enquiries: paginatedEnquiries,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        }
      };
    } catch (dbErr) {
      let enquiries = readData();

      if (email) {
        const lowerEmail = email.toLowerCase();
        enquiries = enquiries.filter((eq) => eq.email && eq.email.toLowerCase() === lowerEmail);
      }

      if (search) {
        const lowerSearch = search.toLowerCase();
        enquiries = enquiries.filter(
          (eq) => eq.name.toLowerCase().includes(lowerSearch) || eq.email.toLowerCase().includes(lowerSearch)
        );
      }

      if (status) {
        enquiries = enquiries.filter((eq) => eq.status === status);
      }

      const total = enquiries.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedEnquiries = enquiries.slice(offset, offset + limit);

      return {
        enquiries: paginatedEnquiries,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        }
      };
    }
  },

  async getEnquiryById(id) {
    try {
      const res = await query('SELECT * FROM enquiries WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        return mapRowToEnquiry(res.rows[0]);
      }
    } catch (dbErr) {
      // Fallback
    }

    const enquiries = readData();
    const enquiry = enquiries.find((eq) => eq.id === id);
    if (!enquiry) {
      const err = new Error('Enquiry not found');
      err.statusCode = 404;
      throw err;
    }
    return enquiry;
  },

  async createEnquiry(payload) {
    const { name, email, phone, eventType, eventDate, location, guestCount, estimatedBudget, servicesRequired, vision } = payload;

    const id = `ENQ-${Date.now().toString().slice(-6)}`;
    const newEnquiry = {
      id,
      enquiryNumber: id,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      eventType: eventType ? eventType.trim() : 'Wedding',
      eventDate: eventDate || '',
      location: location ? location.trim() : '',
      guestCount: guestCount || '',
      estimatedBudget: estimatedBudget || '',
      servicesRequired: Array.isArray(servicesRequired) ? servicesRequired : [],
      vision: vision ? vision.trim() : '',
      status: 'NEW',
      internalNotes: '',
      assignedTo: null,
      convertedUserId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await query(
        `INSERT INTO enquiries (id, enquiry_number, name, email, phone, event_type, event_date, location, guest_count, estimated_budget, services_required, vision, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          id,
          id,
          name.trim(),
          email.trim(),
          phone ? phone.trim() : '',
          eventType ? eventType.trim() : 'Wedding',
          eventDate || null,
          location ? location.trim() : '',
          guestCount || '',
          estimatedBudget || '',
          JSON.stringify(Array.isArray(servicesRequired) ? servicesRequired : []),
          vision ? vision.trim() : '',
          'NEW'
        ]
      );
    } catch (dbErr) {
      // Fallback
    }

    const enquiries = readData();
    enquiries.unshift(newEnquiry);
    writeData(enquiries);
    return newEnquiry;
  },

  async updateEnquiry(id, updates) {
    let enquiry;
    try {
      enquiry = await this.getEnquiryById(id);
    } catch {
      const err = new Error('Enquiry not found');
      err.statusCode = 404;
      throw err;
    }

    if (updates.status) {
      if (!ENQUIRY_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${ENQUIRY_STATUSES.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }

      if (enquiry.status === 'CONVERTED' && updates.status !== 'CONVERTED') {
         const err = new Error('Cannot change status of a converted enquiry.');
         err.statusCode = 400;
         throw err;
      }

      enquiry.status = updates.status;
    }

    if (updates.internalNotes !== undefined) enquiry.internalNotes = updates.internalNotes;
    if (updates.assignedTo !== undefined) enquiry.assignedTo = updates.assignedTo;
    if (updates.convertedUserId !== undefined) enquiry.convertedUserId = updates.convertedUserId;

    enquiry.updatedAt = new Date().toISOString();

    try {
      await query(
        `UPDATE enquiries SET status = $1, vision = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [enquiry.status, enquiry.vision, id]
      );
    } catch (dbErr) {
      // Fallback
    }

    const enquiries = readData();
    const index = enquiries.findIndex((eq) => eq.id === id);
    if (index !== -1) {
      enquiries[index] = enquiry;
      writeData(enquiries);
    }

    return enquiry;
  }
};
