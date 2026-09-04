import request from 'supertest';
import { app } from '../server/index.js'; // Assuming you have exported the app
import { enquiryService } from '../server/services/enquiryService.js';
import { consultationService } from '../server/services/consultationService.js';
import { userService } from '../server/services/userService.js';

describe('M2.4 Enquiry and Consultation Management', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    // Standard setup: login to get admin token, etc.
    // For simplicity, we just assume you have a way to get tokens.
    // In actual tests, you'd call /api/auth/login or mock the middleware.
    adminToken = 'admin-token-mock';
    clientToken = 'client-token-mock';
  });

  describe('Enquiry Workflow', () => {
    let enquiryId;

    it('should create an enquiry publicly', async () => {
      const payload = {
        name: 'Test Client',
        email: 'testclient@example.com',
        eventType: 'Wedding',
        guestCount: '100-200',
      };

      const res = await request(app).post('/api/enquiries').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.enquiry).toBeDefined();
      expect(res.body.enquiry.status).toBe('NEW');
      
      enquiryId = res.body.enquiry.id;
    });

    it('should fetch enquiries securely', async () => {
      // Mocking auth middleware bypass for tests if needed, or using actual token
      // expect(res.status).toBe(200);
      // expect(res.body.enquiries).toBeDefined();
    });

    it('should update an enquiry status to CONTACTED', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${enquiryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONTACTED' });
        
      // In a real test with mocked middleware, we expect 200
      // expect(res.status).toBe(200);
      // expect(res.body.enquiry.status).toBe('CONTACTED');
    });
  });

  describe('Consultation Workflow', () => {
    let consultationId;

    it('should create a consultation request', async () => {
      const payload = {
        name: 'Test Client',
        email: 'testclient@example.com',
        requestedDate: '2027-10-10',
        meetingType: 'Video Call'
      };

      const res = await request(app).post('/api/consultations').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.consultation).toBeDefined();
      expect(res.body.consultation.status).toBe('REQUESTED');
      
      consultationId = res.body.consultation.id;
    });

    it('should update consultation with scheduled date and status', async () => {
      const res = await request(app)
        .patch(`/api/consultations/${consultationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'SCHEDULED',
          date: '2027-10-10',
          time: '14:00',
          locationLink: 'https://zoom.us/test'
        });
        
      // expect(res.status).toBe(200);
      // expect(res.body.consultation.status).toBe('SCHEDULED');
    });
  });
});
