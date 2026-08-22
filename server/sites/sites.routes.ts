import { Router } from 'express';
import * as sitesController from './sites.controller';
import * as productsController from './products.controller';
import * as ordersController from './orders.controller';
import * as customersController from './customers.controller';
import * as analyticsController from './analytics.controller';
import * as deploymentsController from './deployments.controller';
import credentialsRoutes from '../credentials/credentials.routes';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Base routes (list/create) only require authentication
router.get('/', authenticate, sitesController.listSites);
router.post('/', authenticate, sitesController.createSite);

// PUBLIC: Live Site endpoint (must be BEFORE /:siteId to avoid conflict)
router.get('/live/:subdomain', deploymentsController.getLiveSite);
router.get('/:siteId/live', deploymentsController.getLiveSiteById);

// CRITICAL: /search MUST be defined before /:siteId to prevent the parameter from swallowing it
router.get('/search', authenticate, sitesController.searchSites);

// Parameterized routes require BOTH authenticate and authorize
router.get('/:siteId', authenticate, authorize(['owner', 'editor', 'viewer']), sitesController.getSite);
router.patch('/:siteId', authenticate, authorize(['owner', 'editor']), sitesController.updateSite);
router.patch('/:siteId/schema', authenticate, authorize(['owner', 'editor']), sitesController.updateSchema);
router.patch('/:siteId/domain', authenticate, authorize(['owner']), sitesController.updateDomain);
router.delete('/:siteId', authenticate, authorize(['owner']), sitesController.deleteSite);
router.post('/:siteId/roles', authenticate, authorize(['owner']), sitesController.inviteRole);

// Deployments Routes
router.post('/:siteId/deploy', authenticate, authorize(['owner', 'editor']), deploymentsController.triggerDeployment);
router.patch('/:siteId/deployments/:deploymentId/status', authenticate, authorize(['owner', 'editor']), deploymentsController.updateDeploymentStatus);

// Products Routes
router.get('/:siteId/products', authenticate, authorize(['owner', 'editor', 'viewer']), productsController.listProducts);
router.post('/:siteId/products', authenticate, authorize(['owner', 'editor']), productsController.createProduct);
router.patch('/:siteId/products/:productId', authenticate, authorize(['owner', 'editor']), productsController.updateProduct);
router.delete('/:siteId/products/:productId', authenticate, authorize(['owner', 'editor']), productsController.deleteProduct);

// Orders Routes
router.get('/:siteId/orders', authenticate, authorize(['owner', 'editor', 'viewer']), ordersController.listOrders);
router.get('/:siteId/orders/:orderId', authenticate, authorize(['owner', 'editor', 'viewer']), ordersController.getOrder);
router.patch('/:siteId/orders/:orderId/status', authenticate, authorize(['owner', 'editor']), ordersController.updateOrderStatus);
router.patch('/:siteId/orders/:orderId/tracking', authenticate, authorize(['owner', 'editor']), ordersController.updateTracking);

// Customers Routes
router.get('/:siteId/customers', authenticate, authorize(['owner', 'editor', 'viewer']), customersController.listCustomers);
router.get('/:siteId/customers/:customerId', authenticate, authorize(['owner', 'editor', 'viewer']), customersController.getCustomer);

// Analytics Route
router.get('/:siteId/analytics', authenticate, authorize(['owner', 'editor', 'viewer']), analyticsController.getAnalytics);

// Test endpoint
router.get('/:siteId/test-auth', authenticate, authorize(['owner', 'editor', 'viewer']), sitesController.testAuth);

// Admin Login (public for the site's admins)
router.post('/:siteId/admin/login', sitesController.adminLogin);

// Nested credentials routes
router.use('/:siteId/credentials', credentialsRoutes);

export default router;
