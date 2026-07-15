import { Router } from 'express';
import { getTags, createTag, deleteTag } from '../controllers/tagController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTags as any);
router.post('/', createTag as any);
router.delete('/:id', deleteTag as any);

export default router;
