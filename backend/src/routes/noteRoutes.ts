import { Router } from 'express';
import {
  getNotes,
  searchNotes,
  getArchivedNotes,
  getTrashedNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  permanentDeleteNote,
  emptyTrash,
  toggleArchiveNote,
  reorderNotes,
  getPublicNoteByToken
} from '../controllers/noteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes (No authentication required)
router.get('/share/:shareToken', getPublicNoteByToken as any);

router.use(authMiddleware);

router.get('/search', searchNotes as any);
router.get('/', getNotes as any);
router.get('/archived', getArchivedNotes as any);
router.get('/trashed', getTrashedNotes as any);
router.get('/:id', getNoteById as any);
router.post('/', createNote as any);
router.put('/:id', updateNote as any);
router.delete('/:id', deleteNote as any);
router.put('/:id/restore', restoreNote as any);
router.delete('/:id/permanent', permanentDeleteNote as any);
router.put('/:id/archive', toggleArchiveNote as any);
router.put('/reorder/batch', reorderNotes as any);
router.delete('/trash/empty', emptyTrash as any);

export default router;
