import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('M2.9 Proposals & Bookings Workflows', () => {
  let adminToken = '';
  let plannerToken = '';
  let clientToken = '';
  let vendorToken = '';
  let weddingId = '';
  let proposalId = '';
  let bookingId = '';

  beforeAll(async () => {
    // 1. Login as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@elegantmoments.com', password: 'Password123!' });
    adminToken = adminRes.body.token;

    // 2. Login as Planner
    const plannerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'planner@elegantmoments.com', password: 'Password123!' });
    plannerToken = plannerRes.body.token;

    // 3. Login as Client
    const clientRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@elegantmoments.com', password: 'Password123!' });
    clientToken = clientRes.body.token;

    // 4. Login as Vendor
    const vendorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'vendor@elegantmoments.com', password: 'Password123!' });
    vendorToken = vendorRes.body.token;

    // 5. Fetch or create a test wedding for M2.9 suite
    const weddingsRes = await request(app)
      .get('/api/weddings')
      .set('Authorization', `Bearer ${adminToken}`);
    
    if (weddingsRes.body.weddings && weddingsRes.body.weddings.length > 0) {
      const match = weddingsRes.body.weddings.find(w => w.clientId === clientRes.body.user?.id);
      if (match) weddingId = match.id;
    }

    if (!weddingId) {
      const createRes = await request(app)
        .post('/api/weddings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clientId: clientRes.body.user?.id || 'usr-client-005',
          clientName: 'Eleanor Vanderbilt',
          weddingName: 'Eleanor Vanderbilt Luxury Wedding',
          assignedPlannerId: plannerRes.body.user?.id || 'usr-planner-003',
          status: 'PLANNING'
        });
      if (createRes.body.wedding) {
        weddingId = createRes.body.wedding.id;
      }
    }
  });

  test('Planner can create a proposal with line items and financial totals', async () => {
    if (!plannerToken || !weddingId) return;

    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${plannerToken}`)
      .send({
        weddingId,
        items: [
          { description: 'Full Luxury Planning & Design', quantity: 1, unitPrice: 5000, subtotal: 5000 },
          { description: 'Floral Styling & Artistry', quantity: 2, unitPrice: 1500, subtotal: 3000 }
        ],
        taxAmount: 500,
        discountAmount: 200,
        validUntil: '2026-12-31',
        notes: 'Complimentary champagne welcome toast included.',
        status: 'SENT'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.proposal).toBeDefined();
    expect(res.body.proposal.finalAmount).toBe(8300); // 8000 + 500 - 200
    proposalId = res.body.proposal.id;
  });

  test('Client can view their proposal', async () => {
    if (!clientToken || !proposalId) return;

    const res = await request(app)
      .get(`/api/proposals/${proposalId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.proposal.id).toBe(proposalId);
  });

  test('Client can approve proposal', async () => {
    if (!clientToken || !proposalId) return;

    const res = await request(app)
      .patch(`/api/proposals/${proposalId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        status: 'APPROVED',
        clientFeedback: 'Looks exquisite! We are excited to move forward.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.proposal.status).toBe('APPROVED');
  });

  test('Can create booking from approved proposal', async () => {
    if (!plannerToken || !proposalId) return;

    const res = await request(app)
      .post(`/api/bookings/from-proposal/${proposalId}`)
      .set('Authorization', `Bearer ${plannerToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.status).toBe('CONFIRMED');
    bookingId = res.body.booking.id;
  });

  test('Planner can list active bookings', async () => {
    if (!plannerToken) return;

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${plannerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });

  test('Vendor can list assigned service bookings', async () => {
    if (!vendorToken) return;

    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });
});
