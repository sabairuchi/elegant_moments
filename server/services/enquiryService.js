import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENQUIRIES_FILE = path.join(__dirname, '..', 'data', 'enquiries.json');

const ensureFileExists = () => {
  const dir = path.dirname(ENQUIRIES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ENQUIRIES_FILE)) fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
};

const readData = () => {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading enquiries file:', err);
    return [];
  }
};

const writeData = (data) => {
  ensureFileExists();
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing enquiries file:', err);
    return false;
  }
};

export const ENQUIRY_STATUSES = [
  'NEW', 'CONTACTED', 'CONSULTATION_SCHEDULED',
  'CONSULTATION_COMPLETED', 'QUALIFIED', 'CONVERTED',
  'CLOSED', 'LOST'
];

export const enquiryService = {
  async getAllEnquiries(options = {}) {
    const { page = 1, limit = 10, search = '', status = '' } = options;
    let enquiries = readData();

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
  },

  async getEnquiryById(id) {
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

    const enquiries = readData();
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      eventType: eventType.trim(),
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

    enquiries.unshift(newEnquiry);
    const saved = writeData(enquiries);
    if (!saved) {
      throw new Error('Failed to persist enquiry.');
    }
    return newEnquiry;
  },

  async updateEnquiry(id, updates) {
    const enquiries = readData();
    const index = enquiries.findIndex((eq) => eq.id === id);
    if (index === -1) {
      const err = new Error('Enquiry not found');
      err.statusCode = 404;
      throw err;
    }

    const enquiry = enquiries[index];

    if (updates.status) {
      if (!ENQUIRY_STATUSES.includes(updates.status)) {
        const err = new Error(`Invalid status. Must be one of: ${ENQUIRY_STATUSES.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }
      
      // Prevent reverting from terminal states unless super admin (simplified for now: just don't allow reverting from CONVERTED)
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

    enquiries[index] = enquiry;
    const saved = writeData(enquiries);
    if (!saved) {
      throw new Error('Failed to update enquiry.');
    }
    
    return enquiry;
  }
};
