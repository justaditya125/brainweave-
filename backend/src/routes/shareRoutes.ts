import { Router } from 'express';
import { shareNote, getNoteShares, removeShare, getSharedWithMe } from '../controllers/shareController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/shared-with-me', getSharedWithMe as any);
router.post('/:noteId/share', shareNote as any);
router.get('/:noteId/shares', getNoteShares as any);
router.delete('/:noteId/shares/:shareId', removeShare as any);

export default router;
