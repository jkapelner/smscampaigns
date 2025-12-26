import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { createTestUser, createTestCampaign } from './helpers.js';
import './setup.js';

describe('Campaign API', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let anotherUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser('campaign@example.com', 'TestPass123');
    anotherUser = await createTestUser('other@example.com', 'TestPass123');
  });

  describe('POST /campaigns', () => {
    it('should create a new campaign with valid data', async () => {
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Summer Sale',
          message: 'Get 50% off this summer!',
          phoneNumber: '+14155552671',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Summer Sale');
      expect(response.body).toHaveProperty('message', 'Get 50% off this summer!');
      expect(response.body).toHaveProperty('phoneNumber', '+14155552671');
      expect(response.body).toHaveProperty('accountId', testUser.accountId);
    });

    it('should reject campaign creation without authentication', async () => {
      const response = await request(app).post('/campaigns').send({
        name: 'Test Campaign',
        message: 'Test message',
        phoneNumber: '+14155552671',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject campaign with missing name', async () => {
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          message: 'Test message',
          phoneNumber: '+14155552671',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Name');
    });

    it('should reject campaign with missing message', async () => {
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Test Campaign',
          phoneNumber: '+14155552671',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('message');
    });

    it('should reject campaign with missing phoneNumber', async () => {
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Test Campaign',
          message: 'Test message',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phoneNumber');
    });

    it('should reject campaign with invalid phone number', async () => {
      const response = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Test Campaign',
          message: 'Test message',
          phoneNumber: 'invalid-phone',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phone number');
    });

    it('should accept various international phone number formats', async () => {
      const phoneNumbers = [
        '+14155552671', // US
        '+442071838750', // UK
        '+61291234567', // Australia
        '+81312345678', // Japan
      ];

      for (const phoneNumber of phoneNumbers) {
        const response = await request(app)
          .post('/campaigns')
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            name: `Test ${phoneNumber}`,
            message: 'Test message',
            phoneNumber,
          });

        expect(response.status).toBe(201);
        expect(response.body.phoneNumber).toBe(phoneNumber);
      }
    });
  });

  describe('GET /campaigns', () => {
    it('should return all campaigns for authenticated user', async () => {
      // Create test campaigns
      await createTestCampaign(testUser.accountId, 'Campaign 1');
      await createTestCampaign(testUser.accountId, 'Campaign 2');

      const response = await request(app)
        .get('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('Campaign 1');
      expect(response.body[1].name).toBe('Campaign 2');
    });

    it('should return empty array when user has no campaigns', async () => {
      const response = await request(app)
        .get('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should not return campaigns from other users', async () => {
      // Create campaigns for both users
      await createTestCampaign(testUser.accountId, 'User 1 Campaign');
      await createTestCampaign(anotherUser.accountId, 'User 2 Campaign');

      const response = await request(app)
        .get('/campaigns')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('User 1 Campaign');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/campaigns');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /campaigns/:id', () => {
    it('should return specific campaign by id', async () => {
      const campaign = await createTestCampaign(testUser.accountId, 'Specific Campaign');

      const response = await request(app)
        .get(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', campaign.id);
      expect(response.body).toHaveProperty('name', 'Specific Campaign');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/campaigns/99999')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should not allow access to campaigns from other users', async () => {
      const campaign = await createTestCampaign(anotherUser.accountId, 'Other User Campaign');

      const response = await request(app)
        .get(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });
  });

  describe('PUT /campaigns/:id', () => {
    it('should update campaign name', async () => {
      const campaign = await createTestCampaign(testUser.accountId, 'Original Name');

      const response = await request(app)
        .put(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('message', campaign.message); // Unchanged
    });

    it('should update campaign message', async () => {
      const campaign = await createTestCampaign(testUser.accountId, 'Test Campaign');

      const response = await request(app)
        .put(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          message: 'Updated message content',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Updated message content');
      expect(response.body).toHaveProperty('name', campaign.name); // Unchanged
    });

    it('should update campaign phone number', async () => {
      const campaign = await createTestCampaign(testUser.accountId, 'Test Campaign');

      const response = await request(app)
        .put(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+442071838750',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('phoneNumber', '+442071838750');
    });

    it('should reject update with invalid phone number', async () => {
      const campaign = await createTestCampaign(testUser.accountId, 'Test Campaign');

      const response = await request(app)
        .put(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phone number');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .put('/campaigns/99999')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Updated Name',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should not allow updating campaigns from other users', async () => {
      const campaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');

      const response = await request(app)
        .put(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          name: 'Attempted Update',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });
  });

  describe('DELETE /campaigns/:id', () => {
    it('should delete campaign successfully', async () => {
      const campaign = await createTestCampaign(testUser.accountId, 'To Delete');

      const response = await request(app)
        .delete(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Campaign deleted successfully');

      // Verify campaign is deleted
      const getResponse = await request(app)
        .get(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .delete('/campaigns/99999')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should not allow deleting campaigns from other users', async () => {
      const campaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');

      const response = await request(app)
        .delete(`/campaigns/${campaign.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });
  });
});
