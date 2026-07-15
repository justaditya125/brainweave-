import { Request, Response } from 'express';
import { z } from 'zod';
import { NoteShare, Note, User } from '../models';
import { AuthRequest } from '../middleware/auth';

const shareSchema = z.object({
  email: z.string().email('Invalid email address'),
  permission: z.enum(['view', 'edit']).default('view')
});

export const shareNote = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;
  const result = shareSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { email, permission } = result.data;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const userToShare = await User.findOne({ where: { email } });
    if (!userToShare) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToShare.id === req.userId) {
      return res.status(400).json({ message: 'Cannot share with yourself' });
    }

    const existingShare = await NoteShare.findOne({
      where: { noteId, userId: userToShare.id }
    });

    if (existingShare) {
      existingShare.permission = permission;
      await existingShare.save();
      return res.status(200).json(existingShare);
    }

    const share = await NoteShare.create({
      noteId: Number(noteId),
      ownerId: req.userId!,
      userId: userToShare.id,
      permission
    });

    return res.status(201).json(share);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error sharing note' });
  }
};

export const getNoteShares = async (req: AuthRequest, res: Response) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const shares = await NoteShare.findAll({
      where: { noteId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
    });

    return res.status(200).json(shares);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving shares' });
  }
};

export const removeShare = async (req: AuthRequest, res: Response) => {
  const { noteId, shareId } = req.params;

  try {
    const note = await Note.findOne({ where: { id: noteId, userId: req.userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const share = await NoteShare.findOne({ where: { id: shareId, noteId } });
    if (!share) {
      return res.status(404).json({ message: 'Share not found' });
    }

    await share.destroy();
    return res.status(200).json({ message: 'Share removed' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error removing share' });
  }
};

export const getSharedWithMe = async (req: AuthRequest, res: Response) => {
  try {
    const shares = await NoteShare.findAll({
      where: { userId: req.userId },
      include: [
        {
          model: Note,
          include: [
            { model: User, attributes: ['id', 'name', 'email'] }
          ]
        }
      ]
    });

    return res.status(200).json(shares);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving shared notes' });
  }
};
