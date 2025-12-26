import { Request, Response } from 'express';
import { verifyHmacSignature } from '../utils/hmac.js';
import { findByCampaignAndPhone, updateContact } from '../models';

export async function handleInboundMessage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const signature = req.headers['x-webhook-signature'] as string | undefined;

    if (!signature) {
      res.status(401).json({ error: 'Missing webhook signature' });
      return;
    }

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET not configured');
      res.status(500).json({ error: 'Webhook not configured' });
      return;
    }

    const payload = JSON.stringify(req.body);
    const isValid = verifyHmacSignature(payload, signature, webhookSecret);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const { from, to, message } = req.body;

    if (!from || !to || message === undefined) {
      res.status(400).json({ error: 'Missing required fields: from, to, message' });
      return;
    }

    const campaignId = parseInt(id);
    if (isNaN(campaignId)) {
      res.status(400).json({ error: 'Invalid campaign ID' });
      return;
    }

    const contact = await findByCampaignAndPhone(campaignId, from);

    if (contact && message.trim().toLowerCase() === 'stop') {
      await updateContact(contact.id, { canSend: false });
    }

    res.status(200).json({ status: 'processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
