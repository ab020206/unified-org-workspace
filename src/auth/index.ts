import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '@/src/config/env';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: (env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): any {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token: string): any {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
