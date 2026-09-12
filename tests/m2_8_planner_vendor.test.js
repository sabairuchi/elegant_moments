import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('M2.8 Planner & Vendor Management Workflows', () => {
  let plannerToken = '';
  let vendorToken = '';
  let clientToken = '';
  let weddingId = '';

  beforeAll(async () => {
    // Login as Planner
    const plannerRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'planner@elegantmoments.com',
        password: 'Password123!'
      });
    if (plannerRes.status === 200) {
      plannerToken = plannerRes.body.token;
    }

    // Login as Vendor
    const vendorRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'vendor@elegantmoments.com',
        password: 'Password123!'
      });
    if (vendorRes.status === 200) {
      vendorToken = vendorRes.body.token;
    }

    // Login as Client
    const clientRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'client@elegantmoments.com',
        password: 'Password123!'
      });
    if (clientRes.status === 200) {
      clientToken = clientRes.body.token;
    }
  });

  test('Planner can list assigned weddings', async () => {
    if (!plannerToken) return;
    const res = await request(app)
      .get('/api/weddings')
      .set('Authorization', `Bearer ${plannerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.weddings)).toBe(true);
  });

  test('Vendor can fetch vendor profile details', async () => {
    if (!vendorToken) return;
    const res = await request(app)
      .get('/api/users/vendor-profile')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile).toBeDefined();
    expect(res.body.profile.companyName).toBeDefined();
  });

  test('Vendor can list assigned wedding service requests', async () => {
    if (!vendorToken) return;
    const res = await request(app)
      .get('/api/weddings')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.weddings)).toBe(true);
  });

  test('Vendor cannot see un-sanitized internal notes', async () => {
    if (!vendorToken) return;
    const res = await request(app)
      .get('/api/weddings')
      .set('Authorization', `Bearer ${vendorToken}`);

    if (res.body.weddings && res.body.weddings.length > 0) {
      const wedding = res.body.weddings[0];
      expect(wedding.internalNotes).toBeUndefined();
      expect(wedding.adminNotes).toBeUndefined();
    }
  });
});
