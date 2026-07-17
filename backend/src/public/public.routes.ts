import { Router } from 'express';
import * as publicController from './public.controller';

const router = Router();

// Unauthenticated endpoint for rendering live sites
router.get('/sites/:siteId', publicController.getPublicSite);

// Unauthenticated endpoint for edge middleware domain lookup
router.get('/domains/lookup', publicController.lookupDomain);

export default router;
