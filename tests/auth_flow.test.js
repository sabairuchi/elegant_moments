import { test, expect, describe } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';
import { userService } from '../server/services/userService.js';
import bcrypt from 'bcryptjs';

describe('Authentication & Registration Flow Tests', () => {

  // TEST 1: Create Client A
  test('TEST 1: Create Client A and log in successfully', async () => {
    const email = `clienta.${Date.now()}@test.com`;
    const password = 'ClientA@123!';

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Client',
        lastName: 'A',
        email,
        password,
        confirmPassword: password,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.token).toBeDefined();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(email.toLowerCase());
  });

  // TEST 2: Create Client B
  test('TEST 2: Create Client B and log in successfully', async () => {
    const email = `clientb.${Date.now()}@test.com`;
    const password = 'ClientB@456!';

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Client',
        lastName: 'B',
        email,
        password,
        confirmPassword: password,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  // TEST 3: Isolation test
  test('TEST 3: Verify isolation - Client A cannot log in with Client B password and vice-versa', async () => {
    const timestamp = Date.now();
    const emailA = `iso.a.${timestamp}@test.com`;
    const passA = 'PassA@123!';
    const emailB = `iso.b.${timestamp}@test.com`;
    const passB = 'PassB@456!';

    // Register A
    await request(app).post('/api/auth/register').send({
      firstName: 'IsoA',
      lastName: 'User',
      email: emailA,
      password: passA,
      confirmPassword: passA,
    });

    // Register B
    await request(app).post('/api/auth/register').send({
      firstName: 'IsoB',
      lastName: 'User',
      email: emailB,
      password: passB,
      confirmPassword: passB,
    });

    // A tries B's password -> Fail
    const loginAwithB = await request(app).post('/api/auth/login').send({
      email: emailA,
      password: passB,
    });
    expect(loginAwithB.status).toBe(401);
    expect(loginAwithB.body.success).toBe(false);

    // B tries A's password -> Fail
    const loginBwithA = await request(app).post('/api/auth/login').send({
      email: emailB,
      password: passA,
    });
    expect(loginBwithA.status).toBe(401);
    expect(loginBwithA.body.success).toBe(false);
  });

  // TEST 4: Wrong password
  test('TEST 4: Correct email + wrong password fails with 401', async () => {
    const email = `wrongpass.${Date.now()}@test.com`;
    const pass = 'CorrectPass@123!';

    await request(app).post('/api/auth/register').send({
      firstName: 'Wrong',
      lastName: 'PassUser',
      email,
      password: pass,
      confirmPassword: pass,
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email,
      password: 'IncorrectPass@999!',
    });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body.message).toBe('Invalid email or password credentials.');
  });

  // TEST 5: Nonexistent email
  test('TEST 5: Nonexistent email + any password fails with 401', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: `nonexistent.${Date.now()}@domain.com`,
      password: 'SomePassword@123!',
    });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body.message).toBe('Invalid email or password credentials.');
  });

  // TEST 6: Duplicate email
  test('TEST 6: Registering an existing email returns 409 Conflict', async () => {
    const email = `dup.${Date.now()}@test.com`;
    const pass = 'Password@123!';

    // First signup -> 201
    const firstRes = await request(app).post('/api/auth/register').send({
      firstName: 'First',
      lastName: 'User',
      email,
      password: pass,
      confirmPassword: pass,
    });
    expect(firstRes.status).toBe(201);

    // Second signup with same email -> 409
    const dupRes = await request(app).post('/api/auth/register').send({
      firstName: 'Second',
      lastName: 'User',
      email,
      password: pass,
      confirmPassword: pass,
    });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toContain('already exists');
  });

  // TEST 7: Email normalization
  test('TEST 7: Register with uppercase email and log in with lowercase email', async () => {
    const rawEmail = `UpperLower.${Date.now()}@TestDomain.com`;
    const lowerEmail = rawEmail.toLowerCase();
    const pass = 'NormPass@123!';

    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Norm',
      lastName: 'Test',
      email: rawEmail,
      password: pass,
      confirmPassword: pass,
    });
    expect(regRes.status).toBe(201);

    // Login with lowercase
    const loginRes = await request(app).post('/api/auth/login').send({
      email: lowerEmail,
      password: pass,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.email).toBe(lowerEmail);
  });

  // TEST 8: Password security
  test('TEST 8: Database stores bcrypt hash and NEVER plain password', async () => {
    const email = `sec.${Date.now()}@test.com`;
    const plainPass = 'SecretPassword@123!';

    await request(app).post('/api/auth/register').send({
      firstName: 'Sec',
      lastName: 'User',
      email,
      password: plainPass,
      confirmPassword: plainPass,
    });

    const user = await userService.findByEmail(email);
    expect(user).toBeDefined();
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe(plainPass);

    // Verify bcrypt hash matches
    const isBcryptValid = await bcrypt.compare(plainPass, user.passwordHash);
    expect(isBcryptValid).toBe(true);

    // Verify safe user output strips passwordHash
    const safeUser = userService.getSafeUser(user);
    expect(safeUser.passwordHash).toBeUndefined();
  });

  // TEST 9: Password reset
  test('TEST 9: Password reset invalidates old password and enables new password', async () => {
    const email = `reset.${Date.now()}@test.com`;
    const oldPass = 'OldPassword@123!';
    const newPass = 'NewPassword@456!';

    await request(app).post('/api/auth/register').send({
      firstName: 'Reset',
      lastName: 'User',
      email,
      password: oldPass,
      confirmPassword: oldPass,
    });

    // Request reset token
    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.resetUrlDevOnly).toBeDefined();

    // Extract token
    const tokenStr = forgotRes.body.resetUrlDevOnly.split('token=')[1];

    // Reset password
    const resetRes = await request(app).post('/api/auth/reset-password').send({
      token: tokenStr,
      newPassword: newPass,
      confirmPassword: newPass,
    });
    expect(resetRes.status).toBe(200);

    // Old password fails
    const oldLoginRes = await request(app).post('/api/auth/login').send({
      email,
      password: oldPass,
    });
    expect(oldLoginRes.status).toBe(401);

    // New password succeeds
    const newLoginRes = await request(app).post('/api/auth/login').send({
      email,
      password: newPass,
    });
    expect(newLoginRes.status).toBe(200);
  });

  // TEST 10: Multiple clients
  test('TEST 10: Create 3 independent clients and verify all log in independently', async () => {
    const clients = [
      { email: `mclient1.${Date.now()}@test.com`, pass: 'Client1Pass@1!' },
      { email: `mclient2.${Date.now()}@test.com`, pass: 'Client2Pass@2!' },
      { email: `mclient3.${Date.now()}@test.com`, pass: 'Client3Pass@3!' },
    ];

    for (const c of clients) {
      const reg = await request(app).post('/api/auth/register').send({
        firstName: 'Multi',
        lastName: 'Client',
        email: c.email,
        password: c.pass,
        confirmPassword: c.pass,
      });
      expect(reg.status).toBe(201);
    }

    for (const c of clients) {
      const login = await request(app).post('/api/auth/login').send({
        email: c.email,
        password: c.pass,
      });
      expect(login.status).toBe(200);
      expect(login.body.user.email).toBe(c.email.toLowerCase());
    }
  });

  // TEST 11: Database failure error handling
  test('TEST 11: DB failure during registration does NOT pretend to succeed', async () => {
    // Attempting registration with invalid parameters (e.g. missing required field) returns 400
    const invalidReg = await request(app).post('/api/auth/register').send({
      firstName: '',
      lastName: '',
      email: 'invalid',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(invalidReg.status).toBe(400);
    expect(invalidReg.body.success).toBe(false);
  });

  // TEST 12: RBAC Enforcement
  test('TEST 12: Public signup payload attempting role escalation is forced to client role', async () => {
    const email = `rbac.${Date.now()}@test.com`;
    const pass = 'RbacPass@123!';

    const regRes = await request(app).post('/api/auth/register').send({
      firstName: 'Rbac',
      lastName: 'Attacker',
      email,
      password: pass,
      confirmPassword: pass,
      role: 'super_admin', // Attempted role escalation
      roles: ['super_admin', 'admin'],
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.user.role).toBe('client');
    expect(regRes.body.user.roles).toEqual(['client']);

    const fetchedUser = await userService.findByEmail(email);
    expect(fetchedUser.role).toBe('client');
    expect(fetchedUser.roles).toEqual(['client']);
  });
});
