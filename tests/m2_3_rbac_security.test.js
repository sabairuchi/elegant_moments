import { test, expect } from 'vitest';
import request from 'supertest';
import app from '../server/index.js'; // Assuming you export app from server/index.js
import { userService } from '../server/services/userService.js';

let superAdminToken = '';
let superAdminId = '';
let regularUserToken = '';

test('Seed Super Admin Login', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'saba@elegantmoments.com', password: 'Password123!' });
    
  expect(res.status).toBe(200);
  superAdminToken = res.body.token;
  superAdminId = res.body.user.id;
});

test('Regular User Login', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'john@example.com', password: 'Password123!' });
    
  expect(res.status).toBe(200);
  regularUserToken = res.body.token;
});

test('Super Admin can list users', async () => {
  const res = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${superAdminToken}`);
    
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test('Regular User cannot list users', async () => {
  const res = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${regularUserToken}`);
    
  expect(res.status).toBe(403);
});

test('Super Admin cannot suspend last super admin', async () => {
  const res = await request(app)
    .patch(`/api/users/${superAdminId}/status`)
    .set('Authorization', `Bearer ${superAdminToken}`)
    .send({ status: 'SUSPENDED' });
    
  expect(res.status).toBe(403);
});

test('Rate limiting works for sensitive endpoints', async () => {
  for (let i = 0; i < 20; i++) {
    await request(app).post('/api/auth/login').send({ email: 'wrong', password: 'wrong' });
  }
  
  const res = await request(app).post('/api/auth/login').send({ email: 'wrong', password: 'wrong' });
  expect(res.status).toBe(429);
});
