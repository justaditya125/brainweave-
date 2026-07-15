import { Router } from 'express';
import {
  createLink,
  deleteLink,
  getNoteLinks,
  searchNotesForLinking
} from '../controllers/noteLinkController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/search', searchNotesForLinking as any);
router.get('/:id', getNoteLinks as any);
router.post('/:id', createLink as any);
router.delete('/:id/:targetId', deleteLink as any);

export default router;
