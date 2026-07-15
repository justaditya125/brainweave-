import { Router } from 'express';
import { register, login, getMe, updateProfile, refreshToken, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe as any);
router.put('/profile', authMiddleware, updateProfile as any);

export default router;
