import { Response } from 'express';
import { Note, Category, Tag } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalNotes = await Note.count({
      where: { userId: req.userId, deletedAt: null }
    });
    const totalCategories = await Category.count({ where: { userId: req.userId } });
    const totalTags = await Tag.count({ where: { userId: req.userId } });

    const recentNotes = await Note.findAll({
      where: { userId: req.userId, deletedAt: null },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      totalNotes,
      totalCategories,
      totalTags,
      recentNotes
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving dashboard statistics' });
  }
};
