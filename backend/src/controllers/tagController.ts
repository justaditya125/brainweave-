import { Response } from 'express';
import { z } from 'zod';
import { Tag, NoteTag } from '../models';
import { AuthRequest } from '../middleware/auth';

const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50)
});

export const getTags = async (req: AuthRequest, res: Response) => {
  try {
    const tags = await Tag.findAll({
      where: { userId: req.userId },
      order: [['name', 'ASC']]
    });
    return res.status(200).json(tags);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving tags' });
  }
};

export const createTag = async (req: AuthRequest, res: Response) => {
  const result = tagSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name } = result.data;

  try {
    const existing = await Tag.findOne({
      where: { userId: req.userId, name }
    });

    if (existing) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    const tag = await Tag.create({
      userId: req.userId!,
      name
    });

    return res.status(201).json(tag);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating tag' });
  }
};

export const deleteTag = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findOne({
      where: { id, userId: req.userId }
    });

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found or access denied' });
    }

    // Remove all NoteTag associations for this tag
    await NoteTag.destroy({ where: { tagId: id } });

    await tag.destroy();
    return res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting tag' });
  }
};
