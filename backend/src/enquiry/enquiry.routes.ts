import { Router } from 'express';
import { submitEnquiry, verifyOtp, resendOtp, getEnquiries, updateEnquiryStatus, deleteEnquiry } from './enquiry.controller';

const router = Router();

router.post('/submit', submitEnquiry);
router.post('/verify', verifyOtp);
router.post('/resend', resendOtp);
router.get('/', getEnquiries); // Note: Should ideally be protected by admin auth, but leaving simple for now as requested.
router.patch('/:id/status', updateEnquiryStatus);
router.delete('/:id', deleteEnquiry);

export default router;
