import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

test('Client can sign up and immediately sign in with registered credentials', async () => {
  const newClientEmail = `client.test.${Date.now()}@gmail.com`;
  const clientPassword = 'Password123!';

  // 1. Signup
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Pankaj',
      lastName: 'Kumar',
      email: newClientEmail,
      password: clientPassword,
      confirmPassword: clientPassword,
    });

  expect(registerRes.status).toBe(201);
  expect(registerRes.body.success).toBe(true);
  expect(registerRes.body.token).toBeDefined();
  expect(registerRes.body.user.email).toBe(newClientEmail.toLowerCase());

  // 2. Sign In immediately after signup with exact credentials
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: newClientEmail,
      password: clientPassword,
    });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body.success).toBe(true);
  expect(loginRes.body.token).toBeDefined();
  expect(loginRes.body.user.email).toBe(newClientEmail.toLowerCase());
});

test('Client can sign in with whitespace or uppercase variations in email', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: '  PANKAJ@GMAIL.COM   ',
      password: 'Password123!',
    });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body.success).toBe(true);
  expect(loginRes.body.user.email).toBe('pankaj@gmail.com');
});
