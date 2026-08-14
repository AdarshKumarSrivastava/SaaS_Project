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
const credentialsController = __importStar(require("./credentials.controller"));
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)({ mergeParams: true });
// Routes are mounted under /api/sites/:siteId/credentials
// We use the authorize middleware to ensure ONLY site owners can read/write keys
router.get('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner']), credentialsController.listCredentials);
router.post('/', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner']), credentialsController.saveCredentials);
router.post('/test', authenticate_1.authenticate, (0, authorize_1.authorize)(['owner']), credentialsController.testCredential);
// Global BYOK PIN Routes
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pinLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many attempts, please try again after 15 minutes' }
});
router.get('/pin/status', authenticate_1.authenticate, credentialsController.getPinStatus);
router.post('/pin/setup', authenticate_1.authenticate, credentialsController.setupPin);
router.post('/pin/verify', authenticate_1.authenticate, pinLimiter, credentialsController.verifyPin);
router.post('/pin/forgot', authenticate_1.authenticate, credentialsController.forgotPin);
router.post('/pin/reset', authenticate_1.authenticate, credentialsController.resetPin);
exports.default = router;
