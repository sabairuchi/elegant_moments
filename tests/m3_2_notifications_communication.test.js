import { test, expect, describe } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { notificationService } from '../server/services/notificationService.js';
import { emailService } from '../server/services/emailService.js';

describe('M3.2 Communication + Notifications Suite', () => {

  test('TEST 1: Enquiry creation triggers automated ENQUIRY_RECEIVED notification', async () => {
    const email = `notif.enquiry.${Date.now()}@test.com`;

    const res = await request(app)
      .post('/api/enquiries')
      .send({
        name: 'Notification Test User',
        email,
        phone: '+15550199',
        eventType: 'Wedding',
        vision: 'Lake Como Villa Gala',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const userNotifs = await notificationService.getUserNotifications(null, email);
    expect(userNotifs.length).toBeGreaterThan(0);
    const enquiryNotif = userNotifs.find((n) => n.type === 'ENQUIRY_RECEIVED');
    expect(enquiryNotif).toBeDefined();
    expect(enquiryNotif.email).toBe(email);
  });

  test('TEST 2: Consultation booking triggers CONSULTATION_CONFIRMED notification', async () => {
    const email = `notif.consult.${Date.now()}@test.com`;

    const res = await request(app)
      .post('/api/consultations')
      .send({
        name: 'Consultation Notif User',
        email,
        phone: '+15550188',
        requestedDate: '2026-10-15',
        time: '02:00 PM',
        meetingType: 'Video Call',
      });

    expect(res.status).toBe(201);

    const userNotifs = await notificationService.getUserNotifications(null, email);
    const consultNotif = userNotifs.find((n) => n.type === 'CONSULTATION_CONFIRMED');
    expect(consultNotif).toBeDefined();
    expect(consultNotif.email).toBe(email);
  });

  test('TEST 3: Duplicate notification prevention within window', async () => {
    const email = `dup.notif.${Date.now()}@test.com`;
    const ref = `REF-TEST-${Date.now()}`;

    const first = await notificationService.createAndSendNotification({
      email,
      type: 'ENQUIRY_RECEIVED',
      channel: 'EMAIL',
      title: 'First Test Notif',
      message: 'Hello',
      reference: ref,
    });

    expect(first.success).not.toBe(false);

    const duplicate = await notificationService.createAndSendNotification({
      email,
      type: 'ENQUIRY_RECEIVED',
      channel: 'EMAIL',
      title: 'Second Test Notif',
      message: 'Hello again',
      reference: ref,
    });

    expect(duplicate.success).toBe(false);
    expect(duplicate.reason).toBe('DUPLICATE_PREVENTED');
  });

  test('TEST 4: Reminder generator scan returns scanned and sent metrics', async () => {
    const result = await notificationService.checkAndSendReminders();
    expect(result).toBeDefined();
    expect(typeof result.scannedCount).toBe('number');
    expect(typeof result.remindersSent).toBe('number');
  });
});
