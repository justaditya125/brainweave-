import { Router } from 'express';
import { getNoteVersions, createNoteVersion, restoreNoteVersion } from '../controllers/versionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/:noteId/versions', getNoteVersions as any);
router.post('/:noteId/versions', createNoteVersion as any);
router.put('/:noteId/versions/:versionId/restore', restoreNoteVersion as any);

export default router;
