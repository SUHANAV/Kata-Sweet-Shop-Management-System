import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const result = await authService.register(parse.data.email, parse.data.password);
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

export async function login(req: Request, res: Response) {
  const parse = credentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const result = await authService.login(parse.data.email, parse.data.password);
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
