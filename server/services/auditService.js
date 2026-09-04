import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_LOGS_FILE = path.join(__dirname, '..', 'data', 'activity_logs.json');

let memoryLogs = null;

const ensureFilesExist = () => {
  try {
    const dir = path.dirname(AUDIT_LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(AUDIT_LOGS_FILE)) fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch {
    // Read-only filesystem (e.g. Vercel serverless lambda)
  }
};

const readLogs = () => {
  if (memoryLogs) return memoryLogs;
  ensureFilesExist();
  try {
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
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
    const logs = readLogs();
    
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
    
    logs.push(newLog);
    writeLogs(logs);
    return newLog;
  },

  getAllLogs() {
    return readLogs();
  }
};
