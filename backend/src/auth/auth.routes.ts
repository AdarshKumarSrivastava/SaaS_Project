import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/signup', authLimiter, authController.signup);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/resend-otp', authLimiter, authController.resendOtp);
router.post('/login', authLimiter, authController.login);
router.post('/oauth/google', authController.oauthGoogle);
router.get('/oauth/google/callback', authController.oauthGoogleCallback);
router.post('/oauth/github', authController.oauthGithub);
router.get('/oauth/github/callback', authController.oauthGithubCallback);
router.post('/mfa/enable', authenticate, authController.enableMfa);
router.post('/mfa/verify', authController.verifyMfa); // if validating mfa during login
router.get('/me', authenticate, authController.me);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
