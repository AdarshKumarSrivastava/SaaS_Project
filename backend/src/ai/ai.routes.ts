import { Router } from 'express';
import * as aiController from './ai.controller';
import { authenticate } from '../middleware/authenticate';
import { aiChatLimiter } from '../middleware/rateLimit';

const router = Router();

// Endpoints
router.post('/chat', aiChatLimiter, aiController.chat);
router.post('/ingest', authenticate, aiController.ingest);

export default router;
