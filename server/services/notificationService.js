import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';
import { emailService } from './emailService.js';
import { whatsAppService } from './whatsAppService.js';
import { consultationService } from './consultationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NOTIFICATIONS_FILE = path.join(__dirname, '..', 'data', 'notifications.json');

let memoryNotifications = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(NOTIFICATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(NOTIFICATIONS_FILE)) {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    // Read-only environment
  }
};

const readNotifications = () => {
  if (memoryNotifications) return memoryNotifications;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(NOTIFICATIONS_FILE)) {
      const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      memoryNotifications = JSON.parse(raw);
    } else {
      memoryNotifications = [];
    }
  } catch (err) {
    memoryNotifications = [];
  }
  return memoryNotifications;
};

const writeNotifications = (data) => {
  memoryNotifications = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const mapRowToNotification = (row) => ({
  id: row.id,
  userId: row.user_id || row.userId || null,
  type: row.type || 'SYSTEM',
  channel: row.channel || 'IN_APP',
  title: row.title,
  message: row.message,
  reference: row.reference || row.link_url || '',
  status: row.status || 'SENT',
  isRead: row.is_read ?? false,
  sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : new Date().toISOString(),
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
});

export const notificationService = {
  async createAndSendNotification(payload) {
    const { userId, email, phone, type, channel = 'EMAIL', title, message, reference } = payload;

    // Check duplicate notification within last 1 hour for same reference and type
    const isDuplicate = await this.checkDuplicate(userId, email, type, reference, channel);
    if (isDuplicate) {
      console.log(`[NOTIFICATION SERVICE] Skipped duplicate notification type=${type}, ref=${reference}`);
      return { success: false, reason: 'DUPLICATE_PREVENTED' };
    }

    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    let dispatchStatus = 'SENT';
    let extraDetails = {};

    try {
      if (channel === 'EMAIL' && email) {
        const emailResult = await emailService.sendEmail({ to: email, subject: title, html: message, text: message });
        extraDetails.emailMode = emailResult.mode;
      } else if (channel === 'WHATSAPP' && phone) {
        const waResult = await whatsAppService.sendWhatsAppMessage({ phone, message, reference });
        extraDetails.whatsAppMode = waResult.mode;
        if (waResult.deepLink) extraDetails.deepLink = waResult.deepLink;
      }
    } catch (err) {
      console.error('[NOTIFICATION SERVICE] Dispatch failed:', err.message);
      dispatchStatus = 'FAILED';
    }

    const notificationRecord = {
      id,
      userId: userId || null,
      email: email || '',
      type: type || 'GENERAL',
      channel: channel || 'EMAIL',
      title: title || 'Notification',
      message: message || '',
      reference: reference || '',
      status: dispatchStatus,
      isRead: false,
      extraDetails,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      await query(
        `INSERT INTO notifications (id, user_id, title, message, is_read, link_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [id, userId || null, title, message, false, reference || '']
      );
    } catch (dbErr) {
      // Fallback
    }

    const list = readNotifications();
    list.unshift(notificationRecord);
    writeNotifications(list);

    return notificationRecord;
  },

  async checkDuplicate(userId, email, type, reference, channel) {
    if (!reference || !type) return false;
    const list = readNotifications();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const match = list.find((n) => {
      const matchUser = (userId && n.userId === userId) || (email && n.email === email);
      const matchTypeRef = n.type === type && n.reference === reference && n.channel === channel;
      const recent = new Date(n.createdAt) > oneHourAgo;
      return matchUser && matchTypeRef && recent;
    });

    return !!match;
  },

  async getUserNotifications(userId, userEmail) {
    try {
      const res = await query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );
      if (res.rows.length > 0) {
        return res.rows.map(mapRowToNotification);
      }
    } catch (dbErr) {
      // Fallback
    }

    const list = readNotifications();
    return list
      .filter((n) => (userId && n.userId === userId) || (userEmail && n.email === userEmail))
      .slice(0, 50);
  },

  async markAsRead(id, userId) {
    try {
      await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND (user_id = $2 OR $2 IS NULL)`, [id, userId]);
    } catch (dbErr) {
      // Fallback
    }

    const list = readNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      writeNotifications(list);
    }
    return true;
  },

  async getAllNotificationsAdmin({ page = 1, limit = 20, search = '', type = '', status = '' }) {
    let list = readNotifications();

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.message.toLowerCase().includes(s) ||
          (n.email && n.email.toLowerCase().includes(s)) ||
          (n.reference && n.reference.toLowerCase().includes(s))
      );
    }

    if (type) {
      list = list.filter((n) => n.type === type);
    }

    if (status) {
      list = list.filter((n) => n.status === status);
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const data = list.slice(offset, offset + limit);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  },

  async checkAndSendReminders() {
    console.log('[REMINDER SERVICE] Scanning upcoming consultations for reminder dispatch...');
    const result = await consultationService.getAllConsultations({ limit: 100, status: 'SCHEDULED' });
    const consultations = result.consultations || [];
    let sentCount = 0;

    const now = new Date();
    for (const c of consultations) {
      const dateTimeStr = `${c.requestedDate || c.date} ${c.time}`;
      const schedDate = new Date(dateTimeStr);
      if (isNaN(schedDate.getTime())) continue;

      const diffHours = (schedDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Trigger 24h reminder if between 20h and 26h ahead
      if (diffHours >= 0 && diffHours <= 26) {
        const reminderTpl = emailService.getReminderTemplate(c, 24);
        const res = await this.createAndSendNotification({
          userId: c.userId,
          email: c.email,
          phone: c.phone,
          type: 'APPOINTMENT_REMINDER',
          channel: 'EMAIL',
          title: reminderTpl.subject,
          message: reminderTpl.html,
          reference: c.consultationNumber || c.id,
        });

        if (res.success !== false) sentCount++;
      }
    }

    return { scannedCount: consultations.length, remindersSent: sentCount };
  },
};
