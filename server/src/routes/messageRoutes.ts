import { Router } from 'express';
import { sendMessages, getCampaignStats } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/campaigns/:id/send', sendMessages);
router.get('/campaigns/:id/stats', getCampaignStats);

export default router;
