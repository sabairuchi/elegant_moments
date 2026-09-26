import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';
import { userService } from './userService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VENDORS_FILE = path.join(__dirname, '..', 'data', 'vendor_assignments.json');

let memoryVendorAssignments = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(VENDORS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(VENDORS_FILE)) fs.writeFileSync(VENDORS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem
  }
};

const readAssignments = () => {
  if (memoryVendorAssignments) return memoryVendorAssignments;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(VENDORS_FILE)) {
      const raw = fs.readFileSync(VENDORS_FILE, 'utf-8');
      memoryVendorAssignments = JSON.parse(raw);
    } else {
      memoryVendorAssignments = [];
    }
  } catch (err) {
    memoryVendorAssignments = [];
  }
  return memoryVendorAssignments;
};

const writeAssignments = (data) => {
  memoryVendorAssignments = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(VENDORS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

export const vendorManagementService = {
  async getVendorAssignments(vendorUserId) {
    const assignments = readAssignments();
    return assignments.filter((a) => a.vendorUserId === vendorUserId);
  },

  async getAllVendorsWithStats() {
    const usersResult = await userService.listUsers({ role: 'vendor', limit: 100 });
    const vendors = usersResult.data || [];
    const assignments = readAssignments();

    return vendors.map((v) => {
      const vAssignments = assignments.filter((a) => a.vendorUserId === v.id);
      return {
        ...v,
        assignedWeddingsCount: vAssignments.length,
        assignments: vAssignments,
      };
    });
  },

  async assignVendorToWedding({ vendorUserId, weddingId, serviceTitle, customPrice }) {
    const id = `vas-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newAssignment = {
      id,
      vendorUserId,
      weddingId,
      serviceTitle: serviceTitle || 'Vendor Service',
      customPrice: Number(customPrice) || 0,
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
    };

    const list = readAssignments();
    list.unshift(newAssignment);
    writeAssignments(list);

    return newAssignment;
  },
};
