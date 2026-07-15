import { Router } from 'express';
import {
  getBoardColumns,
  createBoardColumn,
  updateBoardColumns,
  deleteBoardColumn,
  moveNoteToColumn,
  getBoardNotes
} from '../controllers/boardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/columns', getBoardColumns as any);
router.post('/columns', createBoardColumn as any);
router.put('/columns', updateBoardColumns as any);
router.delete('/columns/:id', deleteBoardColumn as any);
router.put('/notes/:id/move', moveNoteToColumn as any);
router.get('/notes', getBoardNotes as any);

export default router;
