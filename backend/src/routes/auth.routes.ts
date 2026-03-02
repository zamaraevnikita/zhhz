import { Router } from 'express';
import { requestOtp, verifyOtp, login, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/request-otp', requestOtp); // Send OTP (for registration phone verification)
router.post('/verify-otp', verifyOtp);   // Verify OTP → creates account or logs in
router.post('/login', login);            // Password-based login (no SMS)
router.get('/me', authenticate, me);     // Get current user from token

export default router;
