import { Request, Response } from 'express';
import { z } from 'zod';
import { BoardColumn, Note, Category, Tag } from '../models';
import { AuthRequest } from '../middleware/auth';

const createColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(50),
});

const updateColumnsSchema = z.object({
  columns: z.array(z.object({
    id: z.number().int().positive(),
    name: z.string().min(1).max(50).optional(),
    position: z.number().int().min(0),
  })),
});

const moveNoteSchema = z.object({
  columnId: z.number().int().positive().nullable(),
  position: z.number().int().min(0),
});

export const getBoardColumns = async (req: AuthRequest, res: Response) => {
  try {
    const columns = await BoardColumn.findAll({
      where: { userId: req.userId },
      order: [['position', 'ASC']],
    });

    return res.status(200).json(columns);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching board columns' });
  }
};

export const createBoardColumn = async (req: AuthRequest, res: Response) => {
  const result = createColumnSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name } = result.data;

  try {
    const maxPosition = await BoardColumn.max('position', {
      where: { userId: req.userId },
    });

    const column = await BoardColumn.create({
      userId: req.userId!,
      name,
      position: (maxPosition as number || 0) + 1,
    });

    return res.status(201).json(column);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating board column' });
  }
};

export const updateBoardColumns = async (req: AuthRequest, res: Response) => {
  const result = updateColumnsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { columns } = result.data;

  try {
    const transaction = await require('sequelize').transaction();

    try {
      await Promise.all(
        columns.map(async (col) => {
          await BoardColumn.update(
            { name: col.name, position: col.position },
            { where: { id: col.id, userId: req.userId }, transaction }
          );
        })
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    const updatedColumns = await BoardColumn.findAll({
      where: { userId: req.userId },
      order: [['position', 'ASC']],
    });

    return res.status(200).json(updatedColumns);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating board columns' });
  }
};

export const deleteBoardColumn = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const column = await BoardColumn.findOne({
      where: { id, userId: req.userId },
    });

    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    // Move notes in this column to null (no column)
    await Note.update(
      { boardColumnId: null },
      { where: { boardColumnId: id, userId: req.userId } }
    );

    await column.destroy();
    return res.status(200).json({ message: 'Column deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting board column' });
  }
};

export const moveNoteToColumn = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = moveNoteSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { columnId, position } = result.data;
  const noteId = parseInt(id, 10);

  try {
    const note = await Note.findOne({
      where: { id: noteId, userId: req.userId },
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (columnId) {
      const column = await BoardColumn.findOne({
        where: { id: columnId, userId: req.userId },
      });
      if (!column) {
        return res.status(400).json({ message: 'Invalid column' });
      }
    }

    note.boardColumnId = columnId;
    note.sortOrder = position;
    await note.save();

    return res.status(200).json(note);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error moving note' });
  }
};

export const getBoardNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.findAll({
      where: { userId: req.userId, archived: false, deletedAt: null },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
      order: [['sortOrder', 'ASC'], ['updatedAt', 'DESC']],
    });

    return res.status(200).json(notes);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching board notes' });
  }
};
