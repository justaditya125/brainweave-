import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

// In-memory store for 2FA codes (in production, use Redis)
const twoFactorCodes = new Map<string, { code: string; expires: number }>();

// Clean up expired codes every 5 minutes
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of twoFactorCodes.entries()) {
    if (now > value.expires) {
      twoFactorCodes.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Prevent the interval from keeping the process alive in test/CI
if (process.env.NODE_ENV === 'test') {
  clearInterval(cleanupInterval);
}

const generateTwoFactorCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateToken = (userId: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

// Constant-time string comparison to prevent timing attacks
const safeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

export const setupTwoFactor = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a secret key
    const secret = crypto.randomBytes(20).toString('hex');
    
    // Store secret temporarily
    user.twoFactorSecret = secret;
    await user.save();

    // Generate a verification code
    const code = generateTwoFactorCode();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    twoFactorCodes.set(user.email, { code, expires });

    // In production, send email with code
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[2FA] Verification code for ${user.email}: ${code}`);
    }

    return res.status(200).json({
      message: '2FA setup initiated. Please verify with the code sent to your email.'
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error setting up 2FA' });
  }
};

export const verifyTwoFactor = async (req: AuthRequest, res: Response) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Verification code is required' });
  }

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up' });
    }

    const storedData = twoFactorCodes.get(user.email);
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    if (Date.now() > storedData.expires) {
      twoFactorCodes.delete(user.email);
      return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    if (!safeCompare(storedData.code, code)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();
    twoFactorCodes.delete(user.email);

    return res.status(200).json({ message: '2FA enabled successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying 2FA' });
  }
};

export const disableTwoFactor = async (req: AuthRequest, res: Response) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required to disable 2FA' });
  }

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Always verify password before disabling
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    return res.status(200).json({ message: '2FA disabled successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error disabling 2FA' });
  }
};

export const getTwoFactorStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      enabled: user.twoFactorEnabled,
      configured: !!user.twoFactorSecret
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting 2FA status' });
  }
};

export const requestTwoFactorCode = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    const code = generateTwoFactorCode();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    twoFactorCodes.set(email, { code, expires });

    // In production, send email with code
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[2FA] Login verification code for ${email}: ${code}`);
    }

    return res.status(200).json({
      message: 'Verification code sent'
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error requesting 2FA code' });
  }
};

export const verifyLoginTwoFactor = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const storedData = twoFactorCodes.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found' });
    }

    if (Date.now() > storedData.expires) {
      twoFactorCodes.delete(email);
      return res.status(400).json({ message: 'Verification code expired' });
    }

    if (!safeCompare(storedData.code, code)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    twoFactorCodes.delete(email);

    // Generate a fresh token server-side
    const token = generateToken(user.id);

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
    return res.status(500).json({ message: 'Error verifying 2FA' });
  }
};
