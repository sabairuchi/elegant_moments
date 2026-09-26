import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';
import { weddingService } from './weddingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GUESTS_FILE = path.join(__dirname, '..', 'data', 'guests.json');

let memoryGuests = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(GUESTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(GUESTS_FILE)) fs.writeFileSync(GUESTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only environment
  }
};

const readGuests = () => {
  if (memoryGuests) return memoryGuests;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(GUESTS_FILE)) {
      const raw = fs.readFileSync(GUESTS_FILE, 'utf-8');
      memoryGuests = JSON.parse(raw);
    } else {
      memoryGuests = [];
    }
  } catch (err) {
    memoryGuests = [];
  }
  return memoryGuests;
};

const writeGuests = (data) => {
  memoryGuests = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(GUESTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

export const guestService = {
  async getWeddingGuests(weddingId, options = {}, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const { search = '', rsvpStatus = '' } = options;
    let list = readGuests().filter((g) => g.weddingId === weddingId);

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (g) => g.name.toLowerCase().includes(s) || (g.email && g.email.toLowerCase().includes(s))
      );
    }

    if (rsvpStatus) {
      list = list.filter((g) => g.rsvpStatus === rsvpStatus);
    }

    const attendingCount = list
      .filter((g) => g.rsvpStatus === 'ATTENDING')
      .reduce((sum, g) => sum + (Number(g.guestCount) || 1), 0);

    return {
      guests: list,
      stats: {
        totalRecords: list.length,
        attendingCount,
        pendingCount: list.filter((g) => g.rsvpStatus === 'PENDING').length,
        declinedCount: list.filter((g) => g.rsvpStatus === 'NOT_ATTENDING').length,
      },
    };
  },

  async addGuest(weddingId, payload, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const { name, email, phone, relationship = 'Guest', rsvpStatus = 'PENDING', guestCount = 1, notes } = payload;
    if (!name) {
      const err = new Error('Guest name is required.');
      err.statusCode = 400;
      throw err;
    }

    const newGuest = {
      id: `gst-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      weddingId,
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      relationship: relationship ? relationship.trim() : 'Guest',
      rsvpStatus: ['PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE'].includes(rsvpStatus) ? rsvpStatus : 'PENDING',
      guestCount: Math.max(1, Number(guestCount) || 1),
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = readGuests();
    list.unshift(newGuest);
    writeGuests(list);

    return newGuest;
  },

  async updateGuest(weddingId, guestId, updates, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const list = readGuests();
    const guestIndex = list.findIndex((g) => g.id === guestId && g.weddingId === weddingId);
    if (guestIndex === -1) {
      const err = new Error('Guest record not found.');
      err.statusCode = 404;
      throw err;
    }

    const guest = list[guestIndex];
    if (updates.name !== undefined) guest.name = updates.name.trim();
    if (updates.email !== undefined) guest.email = updates.email.trim();
    if (updates.phone !== undefined) guest.phone = updates.phone.trim();
    if (updates.relationship !== undefined) guest.relationship = updates.relationship.trim();
    if (updates.rsvpStatus !== undefined) {
      if (!['PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE'].includes(updates.rsvpStatus)) {
        const err = new Error('Invalid RSVP status.');
        err.statusCode = 400;
        throw err;
      }
      guest.rsvpStatus = updates.rsvpStatus;
    }
    if (updates.guestCount !== undefined) guest.guestCount = Math.max(1, Number(updates.guestCount) || 1);
    if (updates.notes !== undefined) guest.notes = updates.notes;
    guest.updatedAt = new Date().toISOString();

    list[guestIndex] = guest;
    writeGuests(list);

    return guest;
  },

  async deleteGuest(weddingId, guestId, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const list = readGuests();
    const filtered = list.filter((g) => !(g.id === guestId && g.weddingId === weddingId));
    writeGuests(filtered);
    return true;
  },

  async verifyWeddingAccess(weddingId, currentUser) {
    if (!currentUser) return;
    const isSuperOrAdmin = currentUser.roles?.includes('super_admin') || currentUser.roles?.includes('admin') || currentUser.role === 'super_admin' || currentUser.role === 'admin';
    if (isSuperOrAdmin) return;

    const wedding = await weddingService.getWeddingById(weddingId);
    if (!wedding) {
      const err = new Error('Wedding not found.');
      err.statusCode = 404;
      throw err;
    }

    const isClientOwner = wedding.clientProfileId === currentUser.id || wedding.clientId === currentUser.id || wedding.clientProfileId === currentUser.email;
    const isPlannerAssigned = wedding.plannerProfileId === currentUser.id || wedding.assignedPlannerId === currentUser.id;

    if (!isClientOwner && !isPlannerAssigned) {
      const err = new Error('Access denied. You do not have permission to access this guest list.');
      err.statusCode = 403;
      throw err;
    }
  },
};
