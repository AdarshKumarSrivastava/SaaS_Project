import { Router } from 'express';
import * as sitesController from './sites.controller';
import credentialsRoutes from '../credentials/credentials.routes';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Base routes (list/create) only require authentication
router.get('/', authenticate, sitesController.listSites);
router.post('/', authenticate, sitesController.createSite);

// CRITICAL: /search MUST be defined before /:siteId to prevent the parameter from swallowing it
router.get('/search', authenticate, sitesController.searchSites);

// Parameterized routes require BOTH authenticate and authorize
router.get('/:siteId', authenticate, authorize(['owner', 'editor', 'viewer']), sitesController.getSite);
router.patch('/:siteId', authenticate, authorize(['owner', 'editor']), sitesController.updateSite);
router.patch('/:siteId/schema', authenticate, authorize(['owner', 'editor']), sitesController.updateSchema);
router.patch('/:siteId/domain', authenticate, authorize(['owner']), sitesController.updateDomain);
router.delete('/:siteId', authenticate, authorize(['owner']), sitesController.deleteSite);
router.post('/:siteId/roles', authenticate, authorize(['owner']), sitesController.inviteRole);

// Test endpoint
router.get('/:siteId/test-auth', authenticate, authorize(['owner', 'editor', 'viewer']), sitesController.testAuth);

// Admin Login (public for the site's admins)
router.post('/:siteId/admin/login', sitesController.adminLogin);

// Nested credentials routes
router.use('/:siteId/credentials', credentialsRoutes);

export default router;
