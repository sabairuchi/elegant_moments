import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSULTATIONS_FILE = path.join(__dirname, '..', 'data', 'consultations.json');

let memoryConsultations = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(CONSULTATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(CONSULTATIONS_FILE)) fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only environment
  }
};

const readData = () => {
  if (memoryConsultations) return memoryConsultations;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(CONSULTATIONS_FILE)) {
      const raw = fs.readFileSync(CONSULTATIONS_FILE, 'utf-8');
      memoryConsultations = JSON.parse(raw);
    } else {
      memoryConsultations = [];
    }
  } catch (err) {
    memoryConsultations = [];
  }
  return memoryConsultations;
};

const writeData = (data) => {
  memoryConsultations = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const mapRowToConsultation = (row) => ({
  id: row.id,
  consultationNumber: row.consultation_number || row.id,
  enquiryId: row.enquiry_id || null,
  name: row.name,
  email: row.email,
  phone: row.phone || '',
  requestedDate: row.scheduled_at ? new Date(row.scheduled_at).toISOString().split('T')[0] : '',
  date: row.scheduled_at ? new Date(row.scheduled_at).toISOString().split('T')[0] : '',
  time: row.preferred_time || '',
  duration: '30 mins',
  meetingType: 'Video Call',
  locationLink: '',
  notes: row.note || '',
  internalNotes: '',
  assignedTo: null,
  status: row.status || 'REQUESTED',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
});

export const CONSULTATION_STATUSES = [
  'REQUESTED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
];

export const consultationService = {
  async getAllConsultations(options = {}) {
    const { page = 1, limit = 10, search = '', status = '', email = '' } = options;

    try {
      let sql = 'SELECT * FROM consultations WHERE 1=1';
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
      const consultations = res.rows.map(mapRowToConsultation);

      const total = consultations.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedConsultations = consultations.slice(offset, offset + limit);

      return {
        consultations: paginatedConsultations,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        }
      };
    } catch (dbErr) {
      let consultations = readData();

      if (email) {
        const lowerEmail = email.toLowerCase();
        consultations = consultations.filter((c) => c.email && c.email.toLowerCase() === lowerEmail);
      }

      if (search) {
        const lowerSearch = search.toLowerCase();
        consultations = consultations.filter(
          (c) => c.name.toLowerCase().includes(lowerSearch) || c.email.toLowerCase().includes(lowerSearch)
        );
      }

      if (status) {
        consultations = consultations.filter((c) => c.status === status);
      }

      const total = consultations.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedConsultations = consultations.slice(offset, offset + limit);

      return {
        consultations: paginatedConsultations,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        }
      };
    }
  },

  async getConsultationById(id) {
    try {
      const res = await query('SELECT * FROM consultations WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        return mapRowToConsultation(res.rows[0]);
      }
    } catch (dbErr) {
      // Fallback
    }

    const consultations = readData();
    const consultation = consultations.find((c) => c.id === id);
    if (!consultation) {
      const err = new Error('Consultation not found');
      err.statusCode = 404;
      throw err;
    }
    return consultation;
  },

  async createConsultation(payload) {
    const { enquiryId, name, email, phone, requestedDate, meetingType, notes } = payload;

    const id = `CON-${Date.now().toString().slice(-6)}`;
    const newConsultation = {
      id,
      consultationNumber: id,
      enquiryId: enquiryId || null,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      requestedDate: requestedDate || '',
      date: '',
      time: '',
      duration: '',
      meetingType: meetingType ? meetingType.trim() : 'Video Call',
      locationLink: '',
      notes: notes ? notes.trim() : '',
      internalNotes: '',
      assignedTo: null,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await query(
        `INSERT INTO consultations (id, consultation_number, enquiry_id, name, email, phone, preferred_time, note, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          id,
          enquiryId || null,
          name.trim(),
          email.trim(),
          phone ? phone.trim() : '',
          meetingType ? meetingType.trim() : 'Video Call',
          notes ? notes.trim() : '',
          'REQUESTED'
        ]
      );
    } catch (dbErr) {
      // Fallback
    }

    const consultations = readData();
    consultations.unshift(newConsultation);
    writeData(consultations);
    return newConsultation;
  },

  async updateConsultation(id, updates) {
    let consultation;
    try {
      consultation = await this.getConsultationById(id);
    } catch {
      const err = new Error('Consultation not found');
      err.statusCode = 404;
      throw err;
    }

    if (updates.status) {
      if (!CONSULTATION_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${CONSULTATION_STATUSES.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }
      consultation.status = updates.status;
    }

    if (updates.date !== undefined) consultation.date = updates.date;
    if (updates.time !== undefined) consultation.time = updates.time;
    if (updates.duration !== undefined) consultation.duration = updates.duration;
    if (updates.meetingType !== undefined) consultation.meetingType = updates.meetingType;
    if (updates.locationLink !== undefined) consultation.locationLink = updates.locationLink;
    if (updates.notes !== undefined) consultation.notes = updates.notes;
    if (updates.internalNotes !== undefined) consultation.internalNotes = updates.internalNotes;
    if (updates.assignedTo !== undefined) consultation.assignedTo = updates.assignedTo;

    consultation.updatedAt = new Date().toISOString();

    try {
      await query(
        `UPDATE consultations SET status = $1, note = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [consultation.status, consultation.notes, id]
      );
    } catch (dbErr) {
      // Fallback
    }

    const consultations = readData();
    const index = consultations.findIndex((c) => c.id === id);
    if (index !== -1) {
      consultations[index] = consultation;
      writeData(consultations);
    }

    return consultation;
  }
};
