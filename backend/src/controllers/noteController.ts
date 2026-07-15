import { Request, Response } from 'express';
import { z } from 'zod';
import { Note, Category, Tag, NoteVersion, sequelize } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import crypto from 'crypto';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().optional(),
  categoryId: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
  starred: z.boolean().optional(),
  archived: z.boolean().optional(),
  isPublic: z.boolean().optional()
});

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.userId, archived: false, deletedAt: null },
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
      order: [
        ['starred', 'DESC'],
        ['pinned', 'DESC'],
        ['sortOrder', 'ASC'],
        ['updatedAt', 'DESC']
      ]
    });
    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving notes' });
  }
};

export const searchNotes = async (req: AuthRequest, res: Response) => {
  const { q, category, tag, dateFrom, dateTo, page = '1', limit = '50' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters' });
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
  const offset = (pageNum - 1) * limitNum;
  const searchTerm = (q as string).trim();
  const safeSearch = searchTerm.replace(/'/g, "''");

  try {
    let whereConditions = `n.user_id = :userId AND n.deleted_at IS NULL AND n.archived = false`;
    const replacements: any = { userId: req.userId, searchTerm: safeSearch, limitNum, offset };

    if (category && category !== 'all') {
      whereConditions += ` AND n.category_id = :categoryId`;
      replacements.categoryId = parseInt(category as string, 10);
    }

    if (dateFrom) {
      whereConditions += ` AND n.updated_at >= :dateFrom`;
      replacements.dateFrom = dateFrom;
    }

    if (dateTo) {
      whereConditions += ` AND n.updated_at <= :dateTo`;
      replacements.dateTo = dateTo;
    }

    let tagJoin = '';
    if (tag && tag !== 'all') {
      tagJoin = `INNER JOIN note_tags nt ON nt.note_id = n.id INNER JOIN tags t ON t.id = nt.tag_id AND t.name = :tagName`;
      replacements.tagName = tag;
    }

    const countQuery = `
      SELECT COUNT(DISTINCT n.id) as total
      FROM notes n
      ${tagJoin}
      WHERE ${whereConditions}
    `;

    const [countResult] = await sequelize.query(countQuery, { replacements });
    const totalCount = (countResult as any)[0]?.total || 0;

    const searchQuery = `
      SELECT DISTINCT n.*,
        MATCH(n.title, n.content) AGAINST(:searchTerm IN BOOLEAN MODE) AS relevance
      FROM notes n
      ${tagJoin}
      WHERE ${whereConditions}
        AND MATCH(n.title, n.content) AGAINST(:searchTerm IN BOOLEAN MODE)
      ORDER BY relevance DESC, n.updated_at DESC
      LIMIT :limitNum OFFSET :offset
    `;

    const [notes] = await sequelize.query(searchQuery, { replacements });

    return res.status(200).json({
      notes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error searching notes' });
  }
};

export const getArchivedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.userId, archived: true, deletedAt: null },
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
      order: [['updatedAt', 'DESC']]
    });
    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving archived notes' });
  }
};

export const getTrashedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.userId, deletedAt: { [require('sequelize').Op.ne]: null } },
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
      order: [['deletedAt', 'DESC']]
    });
    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving trashed notes' });
  }
};

export const getNoteById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const note = await Note.findOne({
      where: { id, userId: req.userId },
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
      ]
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving note' });
  }
};

export const createNote = async (req: AuthRequest, res: Response) => {
  const result = noteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { title, content, categoryId, tags, pinned, starred, isPublic } = result.data;

  try {
    if (categoryId) {
      const category = await Category.findOne({ where: { id: categoryId, userId: req.userId } });
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const note = await Note.create({
      userId: req.userId!,
      title,
      content: content || '',
      categoryId: categoryId || null,
      pinned: pinned || false,
      starred: starred || false,
      isPublic: isPublic || false,
      shareToken: crypto.randomUUID()
    });

    if (tags && tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map(async (tagName) => {
          const trimmed = tagName.trim();
          const [tag] = await Tag.findOrCreate({
            where: { userId: req.userId!, name: trimmed }
          });
          return tag;
        })
      );
      await (note as any).setTags(tagInstances);
    }

    const noteWithAssociations = await Note.findOne({
      where: { id: note.id },
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
      ]
    });

    return res.status(201).json(noteWithAssociations);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating note' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  const result = noteSchema.partial().safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { id } = req.params;
  const { title, content, categoryId, tags, pinned, starred, isPublic } = result.data;

  try {
    const note = await Note.findOne({
      where: { id, userId: req.userId }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    if (categoryId) {
      const category = await Category.findOne({ where: { id: categoryId, userId: req.userId } });
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      note.categoryId = categoryId;
    } else if (categoryId === null) {
      note.categoryId = null;
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (pinned !== undefined) note.pinned = pinned;
    if (starred !== undefined) note.starred = starred;
    if (isPublic !== undefined) note.isPublic = isPublic;

    // Create version before saving
    const lastVersion = await NoteVersion.findOne({
      where: { noteId: note.id, userId: req.userId },
      order: [['version', 'DESC']]
    });
    await NoteVersion.create({
      noteId: note.id,
      userId: req.userId!,
      title: note.title,
      content: note.content,
      version: (lastVersion?.version || 0) + 1
    });

    // Guarantee note has a shareToken even if it was created before the schema update
    if (!note.shareToken) {
      note.shareToken = crypto.randomUUID();
    }

    await note.save();

    if (tags !== undefined) {
      if (tags.length === 0) {
        await (note as any).setTags([]);
      } else {
        const tagInstances = await Promise.all(
          tags.map(async (tagName) => {
            const trimmed = tagName.trim();
            const [tag] = await Tag.findOrCreate({
              where: { userId: req.userId!, name: trimmed }
            });
            return tag;
          })
        );
        await (note as any).setTags(tagInstances);
      }
    }

    const noteWithAssociations = await Note.findOne({
      where: { id: note.id },
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
      ]
    });

    return res.status(200).json(noteWithAssociations);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating note' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const note = await Note.findOne({
      where: { id, userId: req.userId }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    // Soft delete - set deletedAt timestamp
    note.deletedAt = new Date();
    await note.save();
    return res.status(200).json({ message: 'Note moved to trash' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting note' });
  }
};

export const restoreNote = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const note = await Note.findOne({
      where: { id, userId: req.userId }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    // Create version entry for restore
    const lastVersion = await NoteVersion.findOne({
      where: { noteId: note.id, userId: req.userId },
      order: [['version', 'DESC']]
    });
    await NoteVersion.create({
      noteId: note.id,
      userId: req.userId!,
      title: note.title,
      content: note.content,
      version: (lastVersion?.version || 0) + 1
    });

    note.deletedAt = null;
    await note.save();
    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error restoring note' });
  }
};

export const permanentDeleteNote = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const note = await Note.findOne({
      where: { id, userId: req.userId }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    await note.destroy();
    return res.status(200).json({ message: 'Note permanently deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error permanently deleting note' });
  }
};

export const emptyTrash = async (req: AuthRequest, res: Response) => {
  try {
    await Note.destroy({
      where: { userId: req.userId, deletedAt: { [require('sequelize').Op.ne]: null } }
    });
    return res.status(200).json({ message: 'Trash emptied' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error emptying trash' });
  }
};

export const toggleArchiveNote = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const note = await Note.findOne({
      where: { id, userId: req.userId }
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied' });
    }

    note.archived = !note.archived;
    await note.save();
    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error toggling archive status' });
  }
};

const reorderSchema = z.object({
  orderedIds: z.array(z.number().int().positive()).min(1, 'At least one ID is required')
});

export const reorderNotes = async (req: AuthRequest, res: Response) => {
  const result = reorderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { orderedIds } = result.data;

  try {
    const transaction = await require('sequelize').transaction();

    try {
      await Promise.all(
        orderedIds.map(async (id: number, index: number) => {
          await Note.update(
            { sortOrder: index },
            { where: { id, userId: req.userId }, transaction }
          );
        })
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    return res.status(200).json({ message: 'Notes reordered successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error reordering notes' });
  }
};

export const getPublicNoteByToken = async (req: Request, res: Response) => {
  const { shareToken } = req.params;
  try {
    const note = await Note.findOne({
      where: { shareToken, isPublic: true },
      attributes: { exclude: ['shareToken', 'userId', 'deletedAt'] },
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
      ]
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or sharing has been disabled' });
    }

    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving public note' });
  }
};
