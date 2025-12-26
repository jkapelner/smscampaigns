import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { createTestUser, createTestCampaign, createTestContact } from './helpers.js';
import { db } from '../src/config/database.js';
import { contacts } from '../src/models';
import { eq } from 'drizzle-orm';
import { generateHmacSignature } from '../src/utils/hmac.js';
import './setup.js';

describe('Webhook API', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testCampaign: Awaited<ReturnType<typeof createTestCampaign>>;
  const webhookSecret = process.env.WEBHOOK_SECRET || 'webhook-secret-key-for-hmac-signature-verification';

  beforeEach(async () => {
    testUser = await createTestUser('webhook@example.com');
    testCampaign = await createTestCampaign(testUser.accountId, 'Webhook Test Campaign');
  });

  describe('POST /campaigns/:id/inbound', () => {
    it('should process inbound STOP message and set canSend to false', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155551234', true);

      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: 'STOP',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'processed');

      const [updatedContact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, contact.id));

      expect(updatedContact.canSend).toBe(false);
    });

    it('should handle case-insensitive STOP message', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155551234', true);

      const testCases = ['stop', 'Stop', 'STOP', 'StOp'];

      for (const stopMessage of testCases) {
        const payload = {
          from: '+14155551234',
          to: '+12025551234',
          message: stopMessage,
        };
        const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

        const response = await request(app)
          .post(`/campaigns/${testCampaign.id}/inbound`)
          .set('X-Webhook-Signature', signature)
          .send(payload);

        expect(response.status).toBe(200);
      }

      const [updatedContact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, contact.id));

      expect(updatedContact.canSend).toBe(false);
    });

    it('should ignore STOP message with extra whitespace', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155551234', true);

      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: '  STOP  ',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(200);

      const [updatedContact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, contact.id));

      expect(updatedContact.canSend).toBe(false);
    });

    it('should do nothing for non-STOP messages', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155551234', true);

      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: 'Hello, this is a reply',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'processed');

      const [updatedContact] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, contact.id));

      expect(updatedContact.canSend).toBe(true);
    });

    it('should do nothing if contact not found', async () => {
      const payload = {
        from: '+14155559999',
        to: '+12025551234',
        message: 'STOP',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'processed');
    });

    it('should reject request with invalid signature', async () => {
      await createTestContact(testCampaign.id, '+14155551234', true);

      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: 'STOP',
      };

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', 'invalid-signature')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid webhook signature');
    });

    it('should reject request without signature', async () => {
      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: 'STOP',
      };

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Missing webhook signature');
    });

    it('should reject request with missing from field', async () => {
      const payload = {
        to: '+12025551234',
        message: 'STOP',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields: from, to, message');
    });

    it('should reject request with missing to field', async () => {
      const payload = {
        from: '+14155551234',
        message: 'STOP',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields: from, to, message');
    });

    it('should reject request with missing message field', async () => {
      const payload = {
        from: '+14155551234',
        to: '+12025551234',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields: from, to, message');
    });

    it('should reject request with invalid campaign ID', async () => {
      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: 'STOP',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      const response = await request(app)
        .post('/campaigns/invalid/inbound')
        .set('X-Webhook-Signature', signature)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid campaign ID');
    });

    it('should only affect contacts in the specified campaign', async () => {
      const campaign2 = await createTestCampaign(testUser.accountId, 'Campaign 2');
      const contact1 = await createTestContact(testCampaign.id, '+14155551234', true);
      const contact2 = await createTestContact(campaign2.id, '+14155551234', true);

      const payload = {
        from: '+14155551234',
        to: '+12025551234',
        message: 'STOP',
      };
      const signature = generateHmacSignature(JSON.stringify(payload), webhookSecret);

      await request(app)
        .post(`/campaigns/${testCampaign.id}/inbound`)
        .set('X-Webhook-Signature', signature)
        .send(payload);

      const [updatedContact1] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, contact1.id));

      const [updatedContact2] = await db
        .select()
        .from(contacts)
        .where(eq(contacts.id, contact2.id));

      expect(updatedContact1.canSend).toBe(false);
      expect(updatedContact2.canSend).toBe(true);
    });
  });
});
