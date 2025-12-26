import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  findAllByAccountId,
  findByIdAndAccountId,
  createCampaign as createCampaignModel,
  updateCampaign as updateCampaignModel,
  deleteCampaign as deleteCampaignModel,
} from '../models';
import { validatePhoneNumber } from '../utils/validation.js';

export async function getAllCampaigns(req: AuthRequest, res: Response): Promise<void> {
  try {
    const accountId = req.user!.accountId;
    const allCampaigns = await findAllByAccountId(accountId);
    res.status(200).json(allCampaigns);
  } catch (error) {
    console.error('Get all campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCampaignById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const accountId = req.user!.accountId;

    const campaign = await findByIdAndAccountId(parseInt(id), accountId);

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createCampaign(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, message, phoneNumber } = req.body;
    const accountId = req.user!.accountId;

    if (!name || !message || !phoneNumber) {
      res.status(400).json({ error: 'Name, message, and phoneNumber are required' });
      return;
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      res.status(400).json({ error: phoneValidation.error });
      return;
    }

    const newCampaign = await createCampaignModel({
      accountId,
      name,
      message,
      phoneNumber,
    });

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateCampaign(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, message, phoneNumber } = req.body;
    const accountId = req.user!.accountId;

    const existingCampaign = await findByIdAndAccountId(parseInt(id), accountId);

    if (!existingCampaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const updates: { name?: string; message?: string; phoneNumber?: string } = {};

    if (name !== undefined) {
      updates.name = name;
    }
    if (message !== undefined) {
      updates.message = message;
    }
    if (phoneNumber !== undefined) {
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.valid) {
        res.status(400).json({ error: phoneValidation.error });
        return;
      }
      updates.phoneNumber = phoneNumber;
    }

    const updatedCampaign = await updateCampaignModel(parseInt(id), updates);

    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteCampaign(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const accountId = req.user!.accountId;

    const existingCampaign = await findByIdAndAccountId(parseInt(id), accountId);

    if (!existingCampaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    await deleteCampaignModel(parseInt(id));

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
