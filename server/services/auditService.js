import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_LOGS_FILE = path.join(__dirname, '..', 'data', 'activity_logs.json');

let memoryLogs = null;

const ensureFilesExist = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(AUDIT_LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(AUDIT_LOGS_FILE)) fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch {
    // Read-only filesystem
  }
};

const readLogs = () => {
  if (memoryLogs) return memoryLogs;
  ensureFilesExist();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(AUDIT_LOGS_FILE)) {
      const raw = fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8');
      memoryLogs = JSON.parse(raw);
    } else {
      memoryLogs = [];
    }
  } catch (err) {
    memoryLogs = [];
  }
  return memoryLogs;
};

const writeLogs = (logs) => {
  memoryLogs = logs;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFilesExist();
  try {
    fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

export const auditService = {
  /**
   * Log a security or administrative action
   */
  logAction({ userId, userEmail, action, entityType, entityId, details, ipAddress = 'unknown' }) {
    const newLog = {
      id: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      userId: userId || null,
      userEmail: userEmail || 'system',
      action,
      entityType,
      entityId,
      metadata: details || {},
      ipAddress,
      createdAt: new Date().toISOString()
    };

    try {
      query(
        `INSERT INTO activity_logs (id, user_id, user_email, action, entity_type, entity_id, ip_address, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newLog.id, newLog.userId, newLog.userEmail, newLog.action, newLog.entityType, newLog.entityId, newLog.ipAddress, JSON.stringify(newLog.metadata)]
      ).catch(() => {});
    } catch (err) {
      // Fallback
    }

    const logs = readLogs();
    logs.push(newLog);
    writeLogs(logs);
    return newLog;
  },

  async getAllLogs() {
    try {
      const res = await query('SELECT * FROM activity_logs ORDER BY created_at DESC');
      return res.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        metadata: row.metadata || {},
        ipAddress: row.ip_address,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      }));
    } catch (dbErr) {
      return readLogs();
    }
  }
};
