import { test, expect, describe } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('Public Client Signup vs Internal Staff Access Enforcement', () => {

  // Test 1: Public Client Self-Registration
  test('Test 1: Public visitor registers -> Account created strictly as CLIENT -> Login succeeds', async () => {
    const email = `public.client.${Date.now()}@example.com`;
    const password = 'ClientPass123!';

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Public',
        lastName: 'Client',
        email,
        password,
        confirmPassword: password,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.user.role).toBe('client');
    expect(regRes.body.user.roles).toEqual(['client']);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.user.role).toBe('client');
  });

  // Test 2: Attempt Public Registration with ADMIN Role
  test('Test 2: Public registration attempt with {"role": "ADMIN"} cannot become ADMIN', async () => {
    const email = `attacker.admin.${Date.now()}@example.com`;
    const password = 'AttackerPass123!';

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Attacker',
        lastName: 'AdminAttempt',
        email,
        password,
        confirmPassword: password,
        role: 'ADMIN',
        roles: ['ADMIN'],
      });

    // Must either reject (400) or force creation as CLIENT
    if (regRes.status === 201) {
      expect(regRes.body.user.role).toBe('client');
      expect(regRes.body.user.roles).toEqual(['client']);
    } else {
      expect(regRes.status).toBe(400);
    }
  });

  // Test 3: Attempt Public Registration with SUPER_ADMIN Role
  test('Test 3: Public registration attempt with {"role": "SUPER_ADMIN"} cannot become SUPER_ADMIN', async () => {
    const email = `attacker.superadmin.${Date.now()}@example.com`;
    const password = 'AttackerPass123!';

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Attacker',
        lastName: 'SuperAdminAttempt',
        email,
        password,
        confirmPassword: password,
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      });

    // Must either reject (400) or force creation as CLIENT
    if (regRes.status === 201) {
      expect(regRes.body.user.role).toBe('client');
      expect(regRes.body.user.roles).toEqual(['client']);
    } else {
      expect(regRes.status).toBe(400);
    }
  });

  // Test 4: Existing Admin creates Planner/Vendor through Authorized Internal Management
  test('Test 4: Authorized Admin creates Planner and Vendor internal accounts', async () => {
    // 1. Admin login
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@elegantmoments.com', password: 'Password123!' });

    expect(adminLoginRes.status).toBe(200);
    const adminToken = adminLoginRes.body.token;

    // 2. Admin creates Planner account
    const plannerEmail = `internal.planner.${Date.now()}@elegantmoments.com`;
    const createPlannerRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Sarah',
        lastName: 'Planner',
        email: plannerEmail,
        password: 'PlannerPass123!',
        role: 'planner',
      });

    expect(createPlannerRes.status).toBe(201);
    expect(createPlannerRes.body.user.role).toBe('planner');

    // 3. Admin creates Vendor account
    const vendorEmail = `internal.vendor.${Date.now()}@elegantmoments.com`;
    const createVendorRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'David',
        lastName: 'Vendor',
        email: vendorEmail,
        password: 'VendorPass123!',
        role: 'vendor',
      });

    expect(createVendorRes.status).toBe(201);
    expect(createVendorRes.body.user.role).toBe('vendor');
  });

  // Test 5: Internal users log in and receive correct roles
  test('Test 5: Internal users (Super Admin, Admin, Planner, Vendor) log in with correct roles', async () => {
    // Super Admin
    const saRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@elegantmoments.com', password: 'Password123!' });
    expect(saRes.status).toBe(200);
    expect(saRes.body.user.role).toBe('super_admin');

    // Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@elegantmoments.com', password: 'Password123!' });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.user.role).toBe('admin');

    // Planner
    const plannerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'planner@elegantmoments.com', password: 'Password123!' });
    expect(plannerRes.status).toBe(200);
    expect(plannerRes.body.user.role).toBe('planner');

    // Vendor
    const vendorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'vendor@elegantmoments.com', password: 'Password123!' });
    expect(vendorRes.status).toBe(200);
    expect(vendorRes.body.user.role).toBe('vendor');
  });

  // Test 6: Route protection - Unauthenticated & Client access control on internal endpoints
  test('Test 6: Protected internal user management endpoints block unauthenticated & client users', async () => {
    // 1. Unauthenticated request to GET /api/users
    const unauthRes = await request(app).get('/api/users');
    expect(unauthRes.status).toBe(401);

    // 2. Client user token request to POST /api/users
    const clientLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@elegantmoments.com', password: 'Password123!' });
    const clientToken = clientLogin.body.token;

    const forbiddenRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        firstName: 'Rogue',
        lastName: 'User',
        email: `rogue.${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'admin',
      });

    expect(forbiddenRes.status).toBe(403);
  });
});
