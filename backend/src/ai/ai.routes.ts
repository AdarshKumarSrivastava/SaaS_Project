import { Router } from 'express';
import * as aiController from './ai.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Endpoints
router.post('/chat', aiController.chat);
router.post('/ingest', authenticate, aiController.ingest);

export default router;
