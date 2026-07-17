import { Router } from 'express';
import * as credentialsController from './credentials.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router({ mergeParams: true });

// Routes are mounted under /api/sites/:siteId/credentials
// We use the authorize middleware to ensure ONLY site owners can read/write keys
router.get('/', authenticate, authorize(['owner']), credentialsController.listCredentials);
router.post('/', authenticate, authorize(['owner']), credentialsController.saveCredentials);
router.post('/test', authenticate, authorize(['owner']), credentialsController.testCredential);

export default router;
