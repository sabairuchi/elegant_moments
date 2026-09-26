import { test, expect, describe } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('M3.5 Wedding Operations Suite (Vendors, Checklist, Guest Management)', () => {

  let clientAToken = '';
  let clientBToken = '';
  let adminToken = '';
  let weddingAId = '';

  test('SETUP: Register Client A and Client B for operations testing', async () => {
    const timestamp = Date.now();

    // Client A
    const regA = await request(app).post('/api/auth/register').send({
      firstName: 'OpClientA',
      lastName: 'User',
      email: `opclienta.${timestamp}@test.com`,
      password: 'ClientAPass@123!',
      confirmPassword: 'ClientAPass@123!',
    });
    expect(regA.status).toBe(201);
    clientAToken = regA.body.token;

    // Client B
    const regB = await request(app).post('/api/auth/register').send({
      firstName: 'OpClientB',
      lastName: 'User',
      email: `opclientb.${timestamp}@test.com`,
      password: 'ClientBPass@456!',
      confirmPassword: 'ClientBPass@456!',
    });
    expect(regB.status).toBe(201);
    clientBToken = regB.body.token;

    // Admin
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@elegantmoments.com',
      password: 'Password123!',
    });
    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.token;

    // Create a wedding for Client A
    const createWeddingRes = await request(app)
      .post('/api/weddings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        weddingName: 'OpClientA Grand Gala',
        clientName: 'OpClientA User',
        clientProfileId: regA.body.user.id,
        clientId: regA.body.user.id,
        weddingDate: '2026-11-20',
        guestCount: 150,
        budget: 45000,
        status: 'PLANNING',
      });

    expect(createWeddingRes.status).toBe(201);
    weddingAId = createWeddingRes.body.wedding.id;
  });

  test('TEST 1: Wedding Checklist generates default tasks and supports CRUD', async () => {
    // Get checklist as admin
    const getRes = await request(app)
      .get(`/api/weddings/${weddingAId}/checklist`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(Array.isArray(getRes.body.items)).toBe(true);
    expect(getRes.body.items.length).toBeGreaterThan(0);

    // Add new custom task
    const addRes = await request(app)
      .post(`/api/weddings/${weddingAId}/checklist`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        task: 'Finalize ice sculpture centerpiece',
        priority: 'HIGH',
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.item.task).toBe('Finalize ice sculpture centerpiece');
    const taskId = addRes.body.item.id;

    // Update task status to COMPLETED
    const updateRes = await request(app)
      .put(`/api/weddings/${weddingAId}/checklist/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'COMPLETED',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.item.status).toBe('COMPLETED');
  });

  test('TEST 2: Guest Management supports RSVP tracking and guest counts', async () => {
    // Add guest
    const addRes = await request(app)
      .post(`/api/weddings/${weddingAId}/guests`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Lord & Lady Harrington',
        email: 'harrington@vip.com',
        relationship: 'VIP Guest',
        rsvpStatus: 'ATTENDING',
        guestCount: 2,
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.guest.name).toBe('Lord & Lady Harrington');
    const guestId = addRes.body.guest.id;

    // Get guests
    const getRes = await request(app)
      .get(`/api/weddings/${weddingAId}/guests`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.stats.attendingCount).toBeGreaterThan(0);

    // Update RSVP
    const updateRes = await request(app)
      .put(`/api/weddings/${weddingAId}/guests/${guestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rsvpStatus: 'NOT_ATTENDING',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.guest.rsvpStatus).toBe('NOT_ATTENDING');
  });

  test('TEST 3: Client Isolation - Client B cannot access Client A wedding checklist', async () => {
    // Client B tries to fetch Client A's wedding checklist
    const res = await request(app)
      .get(`/api/weddings/${weddingAId}/checklist`)
      .set('Authorization', `Bearer ${clientBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access denied');
  });

  test('TEST 4: Vendor Management assignment and listing', async () => {
    const res = await request(app)
      .get('/api/vendors/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.vendors)).toBe(true);
  });
});
