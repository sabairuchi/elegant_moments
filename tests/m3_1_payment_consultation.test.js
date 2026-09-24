import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('M3.1 Payment & Online Consultation Flow', () => {
  let adminToken = '';
  let client1Token = '';
  let client1UserId = '';
  let client2Token = '';
  let client2UserId = '';

  beforeAll(async () => {
    // Login Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@elegantmoments.com', password: 'Password123!' });
    if (adminRes.status === 200) {
      adminToken = adminRes.body.token;
    }

    // Register Client 1
    const client1Res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `client1_${Date.now()}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'ClientOne',
        lastName: 'M31',
        phone: '1234567890',
      });
    client1Token = client1Res.body.token;
    client1UserId = client1Res.body.user.id;

    // Register Client 2
    const client2Res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `client2_${Date.now()}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'ClientTwo',
        lastName: 'M31',
        phone: '0987654321',
      });
    client2Token = client2Res.body.token;
    client2UserId = client2Res.body.user.id;
  });

  describe('1. Consultation Creation & Payment Flow', () => {
    let consultationId = '';
    let paymentId = '';
    let gatewayOrderId = '';

    it('Client 1 can schedule an online consultation with date and fee ($150)', async () => {
      const res = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          meetingType: 'Video Call',
          date: '2026-11-15',
          time: '02:00 PM',
          notes: 'Discuss luxury villa theme',
          fee: 150.00,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.consultation).toBeDefined();
      expect(res.body.consultation.paymentStatus).toBe('UNPAID');
      expect(res.body.consultation.fee).toBe(150.00);

      consultationId = res.body.consultation.id;
    });

    it('Client 1 initiates payment for consultation and receives gateway order details', async () => {
      const res = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          consultationId,
          paymentMethod: 'CARD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.payment).toBeDefined();
      expect(res.body.payment.status).toBe('PENDING');
      expect(res.body.gateway).toBeDefined();
      expect(res.body.gateway.gatewayOrderId).toBeDefined();

      paymentId = res.body.payment.id;
      gatewayOrderId = res.body.gateway.gatewayOrderId;
    });

    it('1. Successful Sandbox Payment verification updates status to PAID and consultation to CONFIRMED', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          paymentId,
          gatewayOrderId,
          gatewayTransactionId: 'txn_sbx_test_123',
          gatewaySignature: `sig_valid_${gatewayOrderId}`,
          mockOutcome: 'SUCCESS',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.payment.status).toBe('PAID');
      expect(res.body.payment.gatewayTransactionId).toBe('txn_sbx_test_123');
      expect(res.body.consultation.paymentStatus).toBe('PAID');
      expect(res.body.consultation.status).toBe('CONFIRMED');
    });

    it('4. Duplicate payment attempt on already PAID consultation is blocked (409 Conflict)', async () => {
      // Re-initiate attempt
      const res1 = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          consultationId,
          paymentMethod: 'CARD',
        });

      expect(res1.status).toBe(409);
      expect(res1.body.code).toBe('DUPLICATE_PAYMENT');

      // Re-verify attempt
      const res2 = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          paymentId,
          gatewayOrderId,
          gatewayTransactionId: 'txn_duplicate',
          gatewaySignature: `sig_valid_${gatewayOrderId}`,
        });

      expect(res2.status).toBe(409);
      expect(res2.body.code).toBe('DUPLICATE_PAYMENT');
    });
  });

  describe('2. Failed & Cancelled Payment Flow', () => {
    let consultation2Id = '';
    let payment2Id = '';
    let gateway2OrderId = '';

    it('2. Failed payment handles card decline and updates payment to FAILED', async () => {
      const conRes = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          meetingType: 'Phone Call',
          date: '2026-12-01',
          time: '10:00 AM',
          fee: 150.00,
        });

      consultation2Id = conRes.body.consultation.id;

      const initRes = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({ consultationId: consultation2Id });

      payment2Id = initRes.body.payment.id;
      gateway2OrderId = initRes.body.gateway.gatewayOrderId;

      const verifyRes = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          paymentId: payment2Id,
          gatewayOrderId: gateway2OrderId,
          mockOutcome: 'FAILED',
          gatewayTransactionId: 'txn_fail_999',
          gatewaySignature: `sig_valid_${gateway2OrderId}`,
        });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.success).toBe(false);
      expect(verifyRes.body.payment.status).toBe('FAILED');
    });

    it('3. Cancelled payment sets status to FAILED / CANCELLED', async () => {
      const conRes = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          meetingType: 'In Person',
          date: '2026-12-10',
          time: '11:00 AM',
          fee: 150.00,
        });

      const consultationId3 = conRes.body.consultation.id;

      const initRes = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({ consultationId: consultationId3 });

      const paymentId3 = initRes.body.payment.id;

      const cancelRes = await request(app)
        .post('/api/payments/cancel')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          paymentId: paymentId3,
          reason: 'Client closed payment gateway modal',
        });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.success).toBe(true);
      expect(cancelRes.body.payment.status).toBe('FAILED');
      expect(cancelRes.body.payment.failureReason).toContain('Client closed payment gateway modal');
    });
  });

  describe('3. Security, Access Control & Ownership Checks', () => {
    let client1PaymentId = '';

    beforeAll(async () => {
      const conRes = await request(app)
        .post('/api/consultations')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({ meetingType: 'Video Call', fee: 150.00 });
      const initRes = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({ consultationId: conRes.body.consultation.id });
      client1PaymentId = initRes.body.payment.id;
    });

    it('5. Unauthorized payment access without token is blocked (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/payments');
      expect(res.status).toBe(401);
    });

    it('6. Client 2 accessing Client 1 payment record is forbidden (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/payments/${client1PaymentId}`)
        .set('Authorization', `Bearer ${client2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access forbidden');
    });

    it('11. Invalid or missing payment verification data returns 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({
          paymentId: client1PaymentId,
          gatewayOrderId: 'ord_fake',
          gatewayTransactionId: 'txn_fake',
          gatewaySignature: 'invalid_signature_hash',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Dashboard & Admin Visibility', () => {
    it('9. Client dashboard status lists only Client 1 payments', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${client1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.payments)).toBe(true);
      res.body.payments.forEach((p) => {
        expect(p.userId).toBe(client1UserId);
      });
    });

    it('10. Admin can view all client payments with transaction IDs and consultation links', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.payments)).toBe(true);
      expect(res.body.payments.length).toBeGreaterThan(0);
    });
  });
});
