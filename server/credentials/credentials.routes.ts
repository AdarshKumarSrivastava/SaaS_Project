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

// Global BYOK PIN Routes
import rateLimit from 'express-rate-limit';

const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Too many attempts, please try again after 15 minutes' }
});

router.get('/pin/status', authenticate, credentialsController.getPinStatus);
router.post('/pin/setup', authenticate, credentialsController.setupPin);
router.post('/pin/verify', authenticate, pinLimiter, credentialsController.verifyPin);
router.post('/pin/forgot', authenticate, credentialsController.forgotPin);
router.post('/pin/reset', authenticate, credentialsController.resetPin);

export default router;
