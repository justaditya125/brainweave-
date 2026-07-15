import { Request, Response } from 'express';
import { NoteVersion, Note } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getNoteVersions = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const versions = await NoteVersion.findAll({
      where: { noteId, userId: req.userId },
      order: [['version', 'DESC']],
      limit: 50
    });

    return res.status(200).json(versions);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving versions' });
  }
};

export const createNoteVersion = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const lastVersion = await NoteVersion.findOne({
      where: { noteId, userId: req.userId },
      order: [['version', 'DESC']]
    });

    const newVersion = await NoteVersion.create({
      noteId,
      userId: req.userId!,
      title: note.title,
      content: note.content,
      version: (lastVersion?.version || 0) + 1
    });

    return res.status(201).json(newVersion);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating version' });
  }
};

export const restoreNoteVersion = async (req: AuthRequest, res: Response) => {
  const { noteId, versionId } = req.params;

  try {
    const version = await NoteVersion.findOne({
      where: { id: versionId, noteId, userId: req.userId }
    });

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.title = version.title;
    note.content = version.content;
    await note.save();

    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error restoring version' });
  }
};
