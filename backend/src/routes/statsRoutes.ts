import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getDashboardStats as any);

export default router;
