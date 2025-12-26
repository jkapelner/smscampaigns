import { Router } from 'express';
import { handleInboundMessage } from '../controllers/webhookController.js';

const router = Router();

router.post('/campaigns/:id/inbound', handleInboundMessage);

export default router;
