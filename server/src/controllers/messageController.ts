import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  findByIdAndAccountId,
  getCampaignStats as getCampaignStatsModel,
  findByCampaignIdAndCanSend,
  MessageStatus,
} from '../models';
import { addToQueue } from '../services/messageService.js';

async function verifyCampaignOwnership(
  campaignId: number,
  accountId: number
): Promise<boolean> {
  const campaign = await findByIdAndAccountId(campaignId, accountId);
  return !!campaign;
}

export async function sendMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const campaignId = parseInt(id);
    const accountId = req.user!.accountId;

    const isOwner = await verifyCampaignOwnership(campaignId, accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const contacts = await findByCampaignIdAndCanSend(campaignId, true);

    for (const contact of contacts) {
      addToQueue(campaignId, contact.id);
    }

    res.status(202).json({ message: 'Messages queued for sending' });
  } catch (error) {
    console.error('Send messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCampaignStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const campaignId = parseInt(id);
    const accountId = req.user!.accountId;

    const isOwner = await verifyCampaignOwnership(campaignId, accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const stats = await getCampaignStatsModel(campaignId);

    const statsMap: Record<MessageStatus, number> = {
      [MessageStatus.PENDING]: 0,
      [MessageStatus.SUCCESS]: 0,
      [MessageStatus.UNDELIVERABLE]: 0,
      [MessageStatus.BLOCKED]: 0,
    };

    stats.forEach((stat) => {
      statsMap[stat.status] = stat.count;
    });

    const total = Object.values(statsMap).reduce((sum, count) => sum + count, 0);

    res.status(200).json({
      total,
      pending: statsMap[MessageStatus.PENDING],
      success: statsMap[MessageStatus.SUCCESS],
      failed: statsMap[MessageStatus.UNDELIVERABLE] + statsMap[MessageStatus.BLOCKED],
      undeliverable: statsMap[MessageStatus.UNDELIVERABLE],
      blocked: statsMap[MessageStatus.BLOCKED],
    });
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
