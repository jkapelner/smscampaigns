import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { db } from '../src/config/database.js';
import { messages, MessageStatus } from '../src/models';
import { eq } from 'drizzle-orm';
import { createTestUser, createTestCampaign, createTestContact } from './helpers.js';
import './setup.js';

describe('Message API', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let anotherUser: Awaited<ReturnType<typeof createTestUser>>;
  let testCampaign: Awaited<ReturnType<typeof createTestCampaign>>;

  beforeEach(async () => {
    testUser = await createTestUser('message@example.com', 'TestPass123');
    anotherUser = await createTestUser('other@example.com', 'TestPass123');
    testCampaign = await createTestCampaign(testUser.accountId, 'Message Test Campaign');
  });

  describe('POST /campaigns/:id/send', () => {
    it('should queue messages for sending to all contacts', async () => {
      // Add contacts to campaign
      await createTestContact(testCampaign.id, '+14155552671', true);
      await createTestContact(testCampaign.id, '+14155552672', true);
      await createTestContact(testCampaign.id, '+14155552673', false); // canSend = false

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/send`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message', 'Messages queued for sending');

      // Wait a bit for queue processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify messages were created
      const allMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, testCampaign.id));

      // Only contacts with canSend = true should have messages
      expect(allMessages.length).toBe(2);
      expect(allMessages.every((msg) => msg.status === MessageStatus.PENDING)).toBe(true);
    });

    it('should not create messages for contacts with canSend = false', async () => {
      await createTestContact(testCampaign.id, '+14155552671', false);
      await createTestContact(testCampaign.id, '+14155552672', false);

      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/send`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(202);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const allMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, testCampaign.id));

      expect(allMessages.length).toBe(0);
    });

    it('should handle campaign with no contacts', async () => {
      const response = await request(app)
        .post(`/campaigns/${testCampaign.id}/send`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message', 'Messages queued for sending');
    });

    it('should require authentication', async () => {
      const response = await request(app).post(`/campaigns/${testCampaign.id}/send`);

      expect(response.status).toBe(401);
    });

    it('should not allow sending messages for other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');

      const response = await request(app)
        .post(`/campaigns/${otherCampaign.id}/send`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .post('/campaigns/99999/send')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should create unique message IDs for each message', async () => {
      await createTestContact(testCampaign.id, '+14155552671', true);
      await createTestContact(testCampaign.id, '+14155552672', true);

      await request(app)
        .post(`/campaigns/${testCampaign.id}/send`)
        .set('Authorization', `Bearer ${testUser.token}`);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const allMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, testCampaign.id));

      const messageIds = allMessages.map((msg) => msg.messageId);
      const uniqueIds = new Set(messageIds);

      expect(uniqueIds.size).toBe(messageIds.length);
    });
  });

  describe('GET /campaigns/:id/stats', () => {
    it('should return stats with all zeros when no messages sent', async () => {
      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/stats`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 0,
        pending: 0,
        success: 0,
        failed: 0,
        undeliverable: 0,
        blocked: 0,
      });
    });

    it('should return correct stats after sending messages', async () => {
      // Add contacts and send messages
      const contact1 = await createTestContact(testCampaign.id, '+14155552671', true);
      const contact2 = await createTestContact(testCampaign.id, '+14155552672', true);

      // Manually insert messages with known statuses for testing
      await db.insert(messages).values([
        {
          messageId: 'test-msg-1',
          campaignId: testCampaign.id,
          contactId: contact1.id,
          message: 'Test message 1',
          status: MessageStatus.PENDING,
        },
        {
          messageId: 'test-msg-2',
          campaignId: testCampaign.id,
          contactId: contact2.id,
          message: 'Test message 2',
          status: MessageStatus.PENDING,
        },
      ]);

      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/stats`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('pending', 2);
      expect(response.body).toHaveProperty('success', 0);
      expect(response.body).toHaveProperty('failed', 0);
    });

    it('should correctly aggregate different message statuses', async () => {
      const contact1 = await createTestContact(testCampaign.id, '+14155552671', true);
      const contact2 = await createTestContact(testCampaign.id, '+14155552672', true);
      const contact3 = await createTestContact(testCampaign.id, '+14155552673', true);
      const contact4 = await createTestContact(testCampaign.id, '+14155552674', true);

      await db.insert(messages).values([
        {
          messageId: 'msg-1',
          campaignId: testCampaign.id,
          contactId: contact1.id,
          message: 'Test message 1',
          status: MessageStatus.SUCCESS,
        },
        {
          messageId: 'msg-2',
          campaignId: testCampaign.id,
          contactId: contact2.id,
          message: 'Test message 2',
          status: MessageStatus.SUCCESS,
        },
        {
          messageId: 'msg-3',
          campaignId: testCampaign.id,
          contactId: contact3.id,
          message: 'Test message 3',
          status: MessageStatus.UNDELIVERABLE,
        },
        {
          messageId: 'msg-4',
          campaignId: testCampaign.id,
          contactId: contact4.id,
          message: 'Test message 4',
          status: MessageStatus.PENDING,
        },
      ]);

      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/stats`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(4);
      expect(response.body.success).toBe(2);
      expect(response.body.pending).toBe(1);
      expect(response.body.undeliverable).toBe(1);
      expect(response.body.failed).toBe(1); // undeliverable + blocked
    });

    it('should include blocked messages in failed count', async () => {
      const contact1 = await createTestContact(testCampaign.id, '+14155552671', true);
      const contact2 = await createTestContact(testCampaign.id, '+14155552672', true);

      await db.insert(messages).values([
        {
          messageId: 'msg-1',
          campaignId: testCampaign.id,
          contactId: contact1.id,
          message: 'Test message 1',
          status: MessageStatus.BLOCKED,
        },
        {
          messageId: 'msg-2',
          campaignId: testCampaign.id,
          contactId: contact2.id,
          message: 'Test message 2',
          status: MessageStatus.UNDELIVERABLE,
        },
      ]);

      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/stats`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.blocked).toBe(1);
      expect(response.body.undeliverable).toBe(1);
      expect(response.body.failed).toBe(2); // blocked + undeliverable
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/campaigns/${testCampaign.id}/stats`);

      expect(response.status).toBe(401);
    });

    it('should not allow viewing stats for other users campaigns', async () => {
      const otherCampaign = await createTestCampaign(anotherUser.accountId, 'Other Campaign');

      const response = await request(app)
        .get(`/campaigns/${otherCampaign.id}/stats`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/campaigns/99999/stats')
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Campaign not found');
    });

    it('should only count messages from specified campaign', async () => {
      const campaign2 = await createTestCampaign(testUser.accountId, 'Campaign 2');
      const contact1 = await createTestContact(testCampaign.id, '+14155552671', true);
      const contact2 = await createTestContact(campaign2.id, '+14155552672', true);

      await db.insert(messages).values([
        {
          messageId: 'msg-1',
          campaignId: testCampaign.id,
          contactId: contact1.id,
          message: 'Test message 1',
          status: MessageStatus.SUCCESS,
        },
        {
          messageId: 'msg-2',
          campaignId: campaign2.id,
          contactId: contact2.id,
          message: 'Test message 2',
          status: MessageStatus.SUCCESS,
        },
      ]);

      const response = await request(app)
        .get(`/campaigns/${testCampaign.id}/stats`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      expect(response.body.success).toBe(1);
    });
  });

  describe('Message Status Updates (Job Queue)', () => {
    it('should update message status from pending to success/undeliverable', async () => {
      const contact = await createTestContact(testCampaign.id, '+14155552671', true);

      await request(app)
        .post(`/campaigns/${testCampaign.id}/send`)
        .set('Authorization', `Bearer ${testUser.token}`);

      // Wait for initial message creation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const initialMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, testCampaign.id));

      expect(initialMessages.length).toBe(1);
      expect(initialMessages[0].status).toBe(MessageStatus.PENDING);

      // Wait for status update (up to 6 seconds as per messageService.ts)
      await new Promise((resolve) => setTimeout(resolve, 7000));

      const updatedMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.campaignId, testCampaign.id));

      expect(updatedMessages.length).toBe(1);
      expect([MessageStatus.SUCCESS, MessageStatus.UNDELIVERABLE]).toContain(updatedMessages[0].status);
    }, 10000); // Increase timeout for this test
  });
});
