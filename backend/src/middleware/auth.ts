import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
}
