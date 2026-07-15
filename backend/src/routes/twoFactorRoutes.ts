import { Router } from 'express';
import {
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
  requestTwoFactorCode,
  verifyLoginTwoFactor
} from '../controllers/twoFactorController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/request-code', requestTwoFactorCode as any);
router.post('/verify-login', verifyLoginTwoFactor as any);

// Protected routes
router.use(authMiddleware);

router.post('/setup', setupTwoFactor as any);
router.post('/verify', verifyTwoFactor as any);
router.post('/disable', disableTwoFactor as any);
router.get('/status', getTwoFactorStatus as any);

export default router;
