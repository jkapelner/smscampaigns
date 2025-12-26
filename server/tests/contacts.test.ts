import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { createTestUser, createTestCampaign, createTestContact } from './helpers.js';
import './setup.js';

describe('Contact API', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let anotherUser: Awaited<ReturnType<typeof createTestUser>>;
  let testCampaign: Awaited<ReturnType<typeof createTestCampaign>>;

  beforeEach(async () => {
    testUser = await createTestUser('contact@example.com', 'TestPass123');
    anotherUser = await createTestUser('other@example.com', 'TestPass123');
    testCampaign = await createTestCampaign(testUser.accountId, 'Contact Test Campaign');
  });

  describe('POST /campaigns/:id/contacts', () => {
    it('should add a new contact to a campaign', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'Jane',
          lastName: 'Smith',
          canSend: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('phoneNumber', '+14155552671');
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Smith');
      expect(response.body).toHaveProperty('canSend', true);
      expect(response.body).toHaveProperty('campaignId', testCampaign.id);
    });

    it('should add contact with canSend defaulting to true', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('canSend', true);
    });

    it('should add contact with canSend set to false', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'John',
          lastName: 'Doe',
          canSend: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('canSend', false);
    });

    it('should reject contact without authentication', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(401);
    });

    it('should reject contact with missing phoneNumber', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phoneNumber');
    });

    it('should reject contact with missing firstName', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          lastName: 'Doe',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('firstName');
    });

    it('should reject contact with missing lastName', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'John',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('lastName');
    });

    it('should reject contact with invalid phone number', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: 'invalid-phone',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phone number');
    });

    it('should accept various international phone numbers', async () => {
      const phoneNumbers = [
        '+14155552671',
        '+442071838750',
        '+61291234567',
        '+81312345678',
      ];

      for (const phoneNumber of phoneNumbers) {
        const response = await request(app)
          .post(`/campaigns/${testCampaign.id}/contacts`)
          .set('Authorization', `Bearer ${testUser.token}`)
          .send({
            phoneNumber,
            firstName: 'Test',
            lastName: 'User',
          });

        expect(response.status).toBe(201);
        expect(response.body.phoneNumber).toBe(phoneNumber);
      }
    });

    it('should not allow adding contacts to other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');

      const response = await request(app)
        .post(`/campaigns/${otherCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .post('/campaigns/99999/contacts')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+14155552671',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });
  });

  describe('GET /campaigns/:id/contacts', () => {
    it('should return all contacts for a campaign', async () => {
      await createTestContact(testCampaign.id, '+14155552671');
      await createTestContact(testCampaign.id, '+14155552672');

      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when campaign has no contacts', async () => {
      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should not allow getting contacts from other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');

      const response = await request(app)
        .get(`/campaigns/${otherCampaign.id}/contacts`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/campaigns/${testCampaign.id}/contacts`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /contacts/:id', () => {
    it('should return specific contact by id', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app)
        .get(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', contact.id);
      expect(response.body).toHaveProperty('phoneNumber', '+14155552671');
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .get('/contacts/99999')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });

    it('should not allow access to contacts from other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');
      const contact = await createTestContact(otherCampaign.id, '+14155552671');

      const response = await request(app)
        .get(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });

    it('should require authentication', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app).get(`/contacts/${contact.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /contacts/:id', () => {
    it('should update contact phone number', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app)
        .put(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: '+442071838750',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('phoneNumber', '+442071838750');
      expect(response.body).toHaveProperty('firstName', contact.firstName); // Unchanged
    });

    it('should update contact firstName', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app)
        .put(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          firstName: 'UpdatedName',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'UpdatedName');
    });

    it('should update contact lastName', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app)
        .put(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          lastName: 'UpdatedLast',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lastName', 'UpdatedLast');
    });

    it('should update contact canSend flag', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671', true);

      const response = await request(app)
        .put(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          canSend: false,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('canSend', false);
    });

    it('should reject update with invalid phone number', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app)
        .put(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          phoneNumber: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phone number');
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .put('/contacts/99999')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          firstName: 'Test',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });

    it('should not allow updating contacts from other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');
      const contact = await createTestContact(otherCampaign.id, '+14155552671');

      const response = await request(app)
        .put(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({
          firstName: 'Attempted Update',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });
  });

  describe('DELETE /contacts/:id', () => {
    it('should delete contact successfully', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671');

      const response = await request(app)
        .delete(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Contact deleted successfully');

      // Verify contact is deleted
      const getResponse = await request(app)
        .get(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent contact', async () => {
      const response = await request(app)
        .delete('/contacts/99999')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });

    it('should not allow deleting contacts from other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');
      const contact = await createTestContact(otherCampaign.id, '+14155552671');

      const response = await request(app)
        .delete(`/contacts/${contact.id}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Contact not found');
    });
  });
});
