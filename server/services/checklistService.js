import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';
import { weddingService } from './weddingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHECKLIST_FILE = path.join(__dirname, '..', 'data', 'checklists.json');

let memoryChecklists = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(CHECKLIST_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(CHECKLIST_FILE)) fs.writeFileSync(CHECKLIST_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem
  }
};

const readChecklists = () => {
  if (memoryChecklists) return memoryChecklists;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(CHECKLIST_FILE)) {
      const raw = fs.readFileSync(CHECKLIST_FILE, 'utf-8');
      memoryChecklists = JSON.parse(raw);
    } else {
      memoryChecklists = [];
    }
  } catch (err) {
    memoryChecklists = [];
  }
  return memoryChecklists;
};

const writeChecklists = (data) => {
  memoryChecklists = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(CHECKLIST_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const DEFAULT_TASKS = [
  { task: 'Venue booked', category: 'Venue', priority: 'HIGH' },
  { task: 'Catering confirmed', category: 'Catering', priority: 'HIGH' },
  { task: 'Photography confirmed', category: 'Media', priority: 'HIGH' },
  { task: 'Decor confirmed', category: 'Design', priority: 'MEDIUM' },
  { task: 'Invitations sent', category: 'Guests', priority: 'MEDIUM' },
  { task: 'Guest list finalized', category: 'Guests', priority: 'HIGH' },
  { task: 'Outfits finalized', category: 'Attire', priority: 'MEDIUM' },
  { task: 'Final consultation completed', category: 'Planning', priority: 'HIGH' },
  { task: 'Payment completed', category: 'Finance', priority: 'HIGH' },
  { task: 'Wedding day preparation', category: 'Operations', priority: 'HIGH' },
];

export const checklistService = {
  async getWeddingChecklist(weddingId, currentUser) {
    // Verify permission & ownership
    await this.verifyWeddingAccess(weddingId, currentUser);

    let list = readChecklists();
    let weddingItems = list.filter((item) => item.weddingId === weddingId);

    // Generate default checklist items if empty for this wedding
    if (weddingItems.length === 0) {
      const newItems = DEFAULT_TASKS.map((t, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        weddingId,
        task: t.task,
        category: t.category,
        status: 'PENDING',
        priority: t.priority,
        dueDate: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      list.push(...newItems);
      writeChecklists(list);
      weddingItems = newItems;
    }

    return weddingItems;
  },

  async addChecklistItem(weddingId, payload, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const { task, category = 'General', priority = 'MEDIUM', dueDate, notes } = payload;
    if (!task) {
      const err = new Error('Task description is required.');
      err.statusCode = 400;
      throw err;
    }

    const newItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      weddingId,
      task: task.trim(),
      category: category.trim(),
      status: 'PENDING',
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = readChecklists();
    list.unshift(newItem);
    writeChecklists(list);

    return newItem;
  },

  async updateChecklistItem(weddingId, taskId, updates, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const list = readChecklists();
    const itemIndex = list.findIndex((i) => i.id === taskId && i.weddingId === weddingId);
    if (itemIndex === -1) {
      const err = new Error('Checklist item not found.');
      err.statusCode = 404;
      throw err;
    }

    const item = list[itemIndex];
    if (updates.status) {
      if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(updates.status)) {
        const err = new Error('Invalid status. Must be PENDING, IN_PROGRESS, or COMPLETED.');
        err.statusCode = 400;
        throw err;
      }
      item.status = updates.status;
    }
    if (updates.task !== undefined) item.task = updates.task.trim();
    if (updates.priority !== undefined) item.priority = updates.priority;
    if (updates.dueDate !== undefined) item.dueDate = updates.dueDate;
    if (updates.notes !== undefined) item.notes = updates.notes;
    item.updatedAt = new Date().toISOString();

    list[itemIndex] = item;
    writeChecklists(list);

    return item;
  },

  async deleteChecklistItem(weddingId, taskId, currentUser) {
    await this.verifyWeddingAccess(weddingId, currentUser);

    const list = readChecklists();
    const filtered = list.filter((i) => !(i.id === taskId && i.weddingId === weddingId));
    writeChecklists(filtered);
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

    // Client isolation check
    const isClientOwner = wedding.clientProfileId === currentUser.id || wedding.clientId === currentUser.id || wedding.clientProfileId === currentUser.email;
    const isPlannerAssigned = wedding.plannerProfileId === currentUser.id || wedding.assignedPlannerId === currentUser.id;

    if (!isClientOwner && !isPlannerAssigned) {
      const err = new Error('Access denied. You do not have permission to access this wedding checklist.');
      err.statusCode = 403;
      throw err;
    }
  },
};
