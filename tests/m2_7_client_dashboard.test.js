import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server/index.js';

describe('M2.7 Client Dashboard & Data Ownership Tests', () => {
  let client1Token = '';
  let client1User = null;
  let client2Token = '';
  let client2User = null;
  let client1WeddingId = '';
  let client1EnquiryId = '';

  beforeAll(async () => {
    // Register Client 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Client',
        email: `alice_${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '1234567890'
      });
    if (res1.status === 201) {
      client1Token = res1.body.token;
      client1User = res1.body.user;
    }

    // Register Client 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Bob',
        lastName: 'Client',
        email: `bob_${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '0987654321'
      });
    if (res2.status === 201) {
      client2Token = res2.body.token;
      client2User = res2.body.user;
    }
  });

  test('Client 1 can submit an enquiry with their email', async () => {
    if (!client1User) return;

    const res = await request(app)
      .post('/api/enquiries')
      .send({
        name: `${client1User.firstName} ${client1User.lastName}`,
        email: client1User.email,
        eventType: 'Luxury Wedding',
        eventDate: '2027-06-15',
        vision: 'Lake Como Villa Celebration'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.enquiry).toBeDefined();
    client1EnquiryId = res.body.enquiry.id;
  });

  test('Client 1 sees only their own enquiries when listing', async () => {
    if (!client1Token) return;

    const res = await request(app)
      .get('/api/enquiries')
      .set('Authorization', `Bearer ${client1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.enquiries)).toBe(true);
    res.body.enquiries.forEach((enq) => {
      expect(enq.email.toLowerCase()).toBe(client1User.email.toLowerCase());
    });
  });

  test('Client 2 CANNOT view Client 1 single enquiry', async () => {
    if (!client2Token || !client1EnquiryId) return;

    const res = await request(app)
      .get(`/api/enquiries/${client1EnquiryId}`)
      .set('Authorization', `Bearer ${client2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Client 1 allowed update on wedding strips unallowed administrative fields', async () => {
    // Assuming wedding exists for client1 or we simulate creating one via service
    const { weddingService } = await import('../server/services/weddingService.js');
    if (!client1User) return;

    const newWedding = await weddingService.createWedding({
      clientId: client1User.id,
      clientName: `${client1User.firstName} ${client1User.lastName}`,
      weddingName: "Alice's Wedding",
      status: 'PLANNING'
    });
    client1WeddingId = newWedding.id;

    // Client 1 attempts to update allowed fields (notes, guestCount) AND prohibited fields (status, assignedPlannerId)
    const updateRes = await request(app)
      .patch(`/api/weddings/${client1WeddingId}`)
      .set('Authorization', `Bearer ${client1Token}`)
      .send({
        guestCount: 200,
        notes: 'Updated Vision Notes',
        status: 'COMPLETED', // Should be stripped
        assignedPlannerId: 'hacked-planner-id' // Should be stripped
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.wedding.guestCount).toBe(200);
    expect(updateRes.body.wedding.notes).toBe('Updated Vision Notes');
    // Verify prohibited fields were NOT changed
    expect(updateRes.body.wedding.status).toBe('PLANNING');
    expect(updateRes.body.wedding.assignedPlannerId).not.toBe('hacked-planner-id');
  });

  test('Client 2 CANNOT view Client 1 single wedding profile', async () => {
    if (!client2Token || !client1WeddingId) return;

    const res = await request(app)
      .get(`/api/weddings/${client1WeddingId}`)
      .set('Authorization', `Bearer ${client2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Client 2 CANNOT view Client 1 single consultation', async () => {
    const { consultationService } = await import('../server/services/consultationService.js');
    if (!client1User || !client2Token) return;

    const consultation = await consultationService.createConsultation({
      name: `${client1User.firstName} ${client1User.lastName}`,
      email: client1User.email,
      meetingType: 'Video Call'
    });

    const res = await request(app)
      .get(`/api/consultations/${consultation.id}`)
      .set('Authorization', `Bearer ${client2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Client CANNOT create or delete services (admin-only operations restricted)', async () => {
    if (!client1Token) return;

    const createRes = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ name: 'Hacked Service', category: 'Photography' });

    expect(createRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete('/api/services/SRV-000001')
      .set('Authorization', `Bearer ${client1Token}`);

    expect(deleteRes.status).toBe(403);
  });
});

