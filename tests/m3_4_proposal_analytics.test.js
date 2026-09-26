import { test, expect, describe } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('M3.4 Proposal Generation + Analytics Suite', () => {

  test('TEST 1: Admin Analytics API returns KPI dashboard metrics', async () => {
    // Admin login
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@elegantmoments.com',
      password: 'Password123!',
    });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    const res = await request(app)
      .get('/api/analytics/dashboard?dateRange=all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metrics).toBeDefined();
    expect(typeof res.body.metrics.totalEnquiries).toBe('number');
    expect(typeof res.body.metrics.totalRevenue).toBe('number');
    expect(res.body.metrics.consultationConversionRate).toBeDefined();
  });

  test('TEST 2: Proposal document HTML generator outputs valid invoice template', async () => {
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@elegantmoments.com',
      password: 'Password123!',
    });
    const token = adminLogin.body.token;

    // Create a valid wedding first
    const createWeddingRes = await request(app)
      .post('/api/weddings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clientId: 'usr-client-proposal-test',
        clientProfileId: 'usr-client-proposal-test',
        weddingName: 'Proposal Test Gala',
        clientName: 'Test Client',
        weddingDate: '2026-12-10',
        status: 'PLANNING',
      });

    expect(createWeddingRes.status).toBe(201);
    const weddingId = createWeddingRes.body.wedding.id;

    // Create a proposal
    const createRes = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        weddingId,
        totalAmount: 12000,
        subtotal: 12000,
        discountAmount: 500,
        taxAmount: 200,
        finalAmount: 11700,
        items: [
          { description: 'Haute Couture Photography', quantity: 1, unitPrice: 7500, subtotal: 7500 },
          { description: 'Hospitality Concierge', quantity: 1, unitPrice: 4500, subtotal: 4500 }
        ]
      });

    expect(createRes.status).toBe(201);
    const proposalId = createRes.body.proposal.id;

    // Fetch quotation document HTML
    const docRes = await request(app)
      .get(`/api/proposals/${proposalId}/document`)
      .set('Authorization', `Bearer ${token}`);

    expect(docRes.status).toBe(200);
    expect(docRes.headers['content-type']).toContain('text/html');
    expect(docRes.text).toContain('ELEGANT MOMENTS');
    expect(docRes.text).toContain('Haute Couture Photography');
  });
});
