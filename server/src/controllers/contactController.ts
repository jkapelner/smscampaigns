import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  findByIdAndAccountId,
  findByCampaignId,
  findById,
  findByIdWithCampaign,
  createContact as createContactModel,
  updateContact as updateContactModel,
  deleteContact as deleteContactModel,
} from '../models';
import { validatePhoneNumber } from '../utils/validation.js';

async function verifyCampaignOwnership(
  campaignId: number,
  accountId: number
): Promise<boolean> {
  const campaign = await findByIdAndAccountId(campaignId, accountId);
  return !!campaign;
}

async function verifyContactOwnership(
  contactId: number,
  accountId: number
): Promise<boolean> {
  const contact = await findByIdWithCampaign(contactId, accountId);
  return !!contact;
}

export async function getCampaignContacts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const accountId = req.user!.accountId;

    const isOwner = await verifyCampaignOwnership(parseInt(id), accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const campaignContacts = await findByCampaignId(parseInt(id));

    res.status(200).json(campaignContacts);
  } catch (error) {
    console.error('Get campaign contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addContactToCampaign(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { phoneNumber, firstName, lastName, canSend } = req.body;
    const accountId = req.user!.accountId;

    if (!phoneNumber || !firstName || !lastName) {
      res.status(400).json({ error: 'phoneNumber, firstName, and lastName are required' });
      return;
    }

    const isOwner = await verifyCampaignOwnership(parseInt(id), accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      res.status(400).json({ error: phoneValidation.error });
      return;
    }

    const newContact = await createContactModel({
      campaignId: parseInt(id),
      phoneNumber,
      firstName,
      lastName,
      canSend: canSend !== undefined ? canSend : true,
    });

    res.status(201).json(newContact);
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getContactById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const accountId = req.user!.accountId;

    const isOwner = await verifyContactOwnership(parseInt(id), accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    const contact = await findById(parseInt(id));

    res.status(200).json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateContact(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { phoneNumber, firstName, lastName, canSend } = req.body;
    const accountId = req.user!.accountId;

    const isOwner = await verifyContactOwnership(parseInt(id), accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    const updates: { phoneNumber?: string; firstName?: string; lastName?: string; canSend?: boolean } = {};

    if (phoneNumber !== undefined) {
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.valid) {
        res.status(400).json({ error: phoneValidation.error });
        return;
      }
      updates.phoneNumber = phoneNumber;
    }

    if (firstName !== undefined) {
      updates.firstName = firstName;
    }
    if (lastName !== undefined) {
      updates.lastName = lastName;
    }
    if (canSend !== undefined) {
      updates.canSend = canSend;
    }

    const updatedContact = await updateContactModel(parseInt(id), updates);

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteContact(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const accountId = req.user!.accountId;

    const isOwner = await verifyContactOwnership(parseInt(id), accountId);
    if (!isOwner) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    await deleteContactModel(parseInt(id));

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
