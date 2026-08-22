import { Router } from 'express';
import { sendOtp, submitOffer } from './hire.controller';

const router = Router();

router.post('/otp', sendOtp);
router.post('/submit', submitOffer);

export default router;
