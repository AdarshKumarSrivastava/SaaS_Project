"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sitesController = __importStar(require("./sites.controller"));
const credentials_routes_1 = __importDefault(require("../credentials/credentials.routes"));
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
// Base routes (list/create) only require authentication
router.get('/', authenticate_1.authenticate, sitesController.listSites);
router.post('/', authenticate_1.authenticate, sitesController.createSite);
// CRITICAL: /search MUST be defined before /:siteId to prevent the parameter from swallowing it
router.get('/search', authenticate_1.authenticate, sitesController.searchSites);
// Parameterized routes require BOTH authenticate and authorize
router.get('/:siteId', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner', 'editor', 'viewer']), sitesController.getSite);
router.patch('/:siteId', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner', 'editor']), sitesController.updateSite);
router.patch('/:siteId/schema', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner', 'editor']), sitesController.updateSchema);
router.patch('/:siteId/domain', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner']), sitesController.updateDomain);
router.delete('/:siteId', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner']), sitesController.deleteSite);
router.post('/:siteId/roles', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner']), sitesController.inviteRole);
// Test endpoint
router.get('/:siteId/test-auth', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner', 'editor', 'viewer']), sitesController.testAuth);
// Admin Login (public for the site's admins)
router.post('/:siteId/admin/login', sitesController.adminLogin);
// Nested credentials routes
router.use('/:siteId/credentials', credentials_routes_1.default);
exports.default = router;
