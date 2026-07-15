import { Request, Response } from 'express';
import { z } from 'zod';
import { Note, NoteLink, Category, Tag } from '../models';
import { AuthRequest } from '../middleware/auth';

const createLinkSchema = z.object({
  targetNoteId: z.number().int().positive(),
});

export const createLink = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = createLinkSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { targetNoteId } = result.data;
  const sourceNoteId = parseInt(id, 10);

  try {
    const sourceNote = await Note.findOne({ where: { id: sourceNoteId, userId: req.userId } });
    if (!sourceNote) {
      return res.status(404).json({ message: 'Source note not found' });
    }

    const targetNote = await Note.findOne({ where: { id: targetNoteId, userId: req.userId } });
    if (!targetNote) {
      return res.status(404).json({ message: 'Target note not found' });
    }

    if (sourceNoteId === targetNoteId) {
      return res.status(400).json({ message: 'Cannot link a note to itself' });
    }

    const existingLink = await NoteLink.findOne({
      where: { sourceNoteId, targetNoteId },
    });
    if (existingLink) {
      return res.status(400).json({ message: 'Link already exists' });
    }

    const link = await NoteLink.create({ sourceNoteId, targetNoteId });
    return res.status(201).json(link);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating link' });
  }
};

export const deleteLink = async (req: AuthRequest, res: Response) => {
  const { id, targetId } = req.params;
  const sourceNoteId = parseInt(id, 10);
  const targetNoteId = parseInt(targetId, 10);

  if (isNaN(sourceNoteId) || isNaN(targetNoteId)) {
    return res.status(400).json({ message: 'Invalid note IDs' });
  }

  try {
    // Verify user owns at least one of the notes
    const sourceNote = await Note.findOne({ where: { id: sourceNoteId, userId: req.userId } });
    const targetNote = await Note.findOne({ where: { id: targetNoteId, userId: req.userId } });

    if (!sourceNote && !targetNote) {
      return res.status(404).json({ message: 'Link not found or access denied' });
    }

    const link = await NoteLink.findOne({
      where: { sourceNoteId, targetNoteId },
    });

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    await link.destroy();
    return res.status(200).json({ message: 'Link removed' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting link' });
  }
};

export const getNoteLinks = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const noteId = parseInt(id, 10);

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const outgoingLinks = await NoteLink.findAll({
      where: { sourceNoteId: noteId },
      include: [
        {
          model: Note,
          as: 'targetNote',
          attributes: ['id', 'title'],
        },
      ],
    });

    const incomingLinks = await NoteLink.findAll({
      where: { targetNoteId: noteId },
      include: [
        {
          model: Note,
          as: 'sourceNote',
          attributes: ['id', 'title'],
        },
      ],
    });

    return res.status(200).json({
      outgoing: outgoingLinks.map((l) => (l as any).targetNote),
      incoming: incomingLinks.map((l) => (l as any).sourceNote),
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching links' });
  }
};

export const searchNotesForLinking = async (req: AuthRequest, res: Response) => {
  const { q, excludeId } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 1) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const excludeNoteId = excludeId ? parseInt(excludeId as string, 10) : null;

  try {
    const { Op } = require('sequelize');
    const where: any = {
      userId: req.userId,
      deletedAt: null,
      archived: false,
      title: { [Op.like]: `%${q}%` },
    };

    if (excludeNoteId) {
      where.id = { [Op.ne]: excludeNoteId };
    }

    const notes = await Note.findAll({
      where,
      attributes: ['id', 'title'],
      limit: 10,
      order: [['title', 'ASC']],
    });

    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error searching notes' });
  }
};
