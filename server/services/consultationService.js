import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSULTATIONS_FILE = path.join(__dirname, '..', 'data', 'consultations.json');

let memoryConsultations = null;

const ensureFileExists = () => {
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
    if (fs.existsSync(CONSULTATIONS_FILE)) {
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
  ensureFileExists();
  try {
    fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

export const CONSULTATION_STATUSES = [
  'REQUESTED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
];

export const consultationService = {
  async getAllConsultations(options = {}) {
    const { page = 1, limit = 10, search = '', status = '', email = '' } = options;
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
  },

  async getConsultationById(id) {
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

    const consultations = readData();
    const newConsultation = {
      id: `CON-${Date.now().toString().slice(-6)}`,
      enquiryId: enquiryId || null,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      requestedDate: requestedDate || '',
      date: '', // confirmed date
      time: '', // confirmed time
      duration: '', // duration e.g. '30 mins'
      meetingType: meetingType ? meetingType.trim() : 'Video Call',
      locationLink: '', // zoom link, address, etc.
      notes: notes ? notes.trim() : '',
      internalNotes: '', // admin only notes
      assignedTo: null,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    consultations.unshift(newConsultation);
    const saved = writeData(consultations);
    if (!saved) {
      throw new Error('Failed to persist consultation.');
    }
    return newConsultation;
  },

  async updateConsultation(id, updates) {
    const consultations = readData();
    const index = consultations.findIndex((c) => c.id === id);
    if (index === -1) {
      const err = new Error('Consultation not found');
      err.statusCode = 404;
      throw err;
    }

    const consultation = consultations[index];

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

    consultations[index] = consultation;
    const saved = writeData(consultations);
    if (!saved) {
      throw new Error('Failed to update consultation.');
    }
    
    return consultation;
  }
};
