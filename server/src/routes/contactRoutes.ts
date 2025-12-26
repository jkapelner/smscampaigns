import { Router } from 'express';
import {
  getCampaignContacts,
  addContactToCampaign,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/campaigns/:id/contacts', getCampaignContacts);
router.post('/campaigns/:id/contacts', addContactToCampaign);
router.get('/contacts/:id', getContactById);
router.put('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);

export default router;
