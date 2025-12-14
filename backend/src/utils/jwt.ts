import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';

export type JwtPayload = { id: number; email: string; role: 'USER' | 'ADMIN' };

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
