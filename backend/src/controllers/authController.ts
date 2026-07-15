import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, Category, Tag, Note } from '../models';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  avatar: z.string().url('Invalid avatar URL').optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').optional()
});

const generateToken = (userId: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

const generateRefreshToken = (userId: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name, email, password, avatar } = result.data;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || null
    });

    try {
      const catWork = await Category.create({ userId: newUser.id, name: 'Work' });
      const catPersonal = await Category.create({ userId: newUser.id, name: 'Personal' });
      const catIdeas = await Category.create({ userId: newUser.id, name: 'Ideas' });

      const tagReact = await Tag.create({ userId: newUser.id, name: 'react' });
      const tagTodo = await Tag.create({ userId: newUser.id, name: 'todo' });
      const tagInspiration = await Tag.create({ userId: newUser.id, name: 'inspiration' });

      const note1 = await Note.create({
        userId: newUser.id,
        title: '💼 Daily Standup Notes',
        content: `Yesterday:\n- Set up Node.js Express API and React Next.js frontend in separate folders.\n- Structured database migrations for users, categories, tags, and notes.\n- Confirmed Sequelize tables synchronized.\n\nToday:\n- Add beautiful layout transitions.\n- Verify responsive mobile breakpoints.\n- Complete manual layout audits.`,
        categoryId: catWork.id,
        pinned: true
      });
      await (note1 as any).setTags([tagReact, tagTodo]);

      const note2 = await Note.create({
        userId: newUser.id,
        title: '💡 Side Project Concepts',
        content: `A list of prospective designs to work on:\n\n1. NotionNotes: A minimalist, clean note-taking application using Tailwind CSS v4, Zustand, and Express + MySQL.\n2. CulinaryAI: An edge-hosted recipe generator.\n3. Antigravity CLI: A developers' terminal prompt orchestrator.`,
        categoryId: catIdeas.id,
        pinned: false
      });
      await (note2 as any).setTags([tagInspiration]);

      const note3 = await Note.create({
        userId: newUser.id,
        title: '🛒 Weekend Grocery List',
        content: `- Whole milk (2 gallons)\n- Organic sourdough bread\n- Avocados (x5)\n- Fresh basil leaves\n- Coffee beans (light roast, whole bean)\n- Greek yogurt`,
        categoryId: catPersonal.id,
        pinned: false
      });
      await (note3 as any).setTags([tagTodo]);
    } catch (seedError) {
      console.error('Registration warning: Failed to seed default user notes:', seedError);
    }

    const token = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { email, password } = result.data;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { name, avatar, currentPassword, newPassword } = result.data;

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully' });
};
