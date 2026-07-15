import { Response } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import { Category, Note } from '../models';
import { AuthRequest } from '../middleware/auth';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100)
});

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.userId },
      order: [['name', 'ASC']]
    });
    return res.status(200).json(categories);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving categories' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  const result = categorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name } = result.data;

  try {
    const existing = await Category.findOne({
      where: { userId: req.userId, name }
    });

    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      userId: req.userId!,
      name
    });

    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating category' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const result = categorySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name } = result.data;
  const { id } = req.params;

  try {
    const category = await Category.findOne({
      where: { id, userId: req.userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or access denied' });
    }

    const duplicate = await Category.findOne({
      where: {
        userId: req.userId,
        name,
        id: { [Op.ne]: Number(id) }
      }
    });

    if (duplicate) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }

    category.name = name;
    await category.save();

    return res.status(200).json(category);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating category' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({
      where: { id, userId: req.userId }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or access denied' });
    }

    // Set all notes in this category to null categoryId
    await Note.update(
      { categoryId: null },
      { where: { userId: req.userId, categoryId: id } }
    );

    await category.destroy();
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting category' });
  }
};
