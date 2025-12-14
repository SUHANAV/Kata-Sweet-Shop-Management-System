import { Request, Response } from 'express';
import { z } from 'zod';
import * as sweetsService from '../services/sweetsService';

const imageUrlSchema = z
  .string()
  .url()
  .or(z.string().regex(/^\/uploads\//))
  .optional()
  .nullable();

const sweetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().nonnegative(),
  imageUrl: imageUrlSchema,
});

export async function create(req: Request, res: Response) {
  const parse = sweetSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const sweet = await sweetsService.create(parse.data);
  return res.status(201).json(sweet);
}

export async function list(req: Request, res: Response) {
  const sweets = await sweetsService.list();
  return res.status(200).json(sweets);
}

export async function search(req: Request, res: Response) {
  const { name, category, minPrice, maxPrice } = req.query;
  const sweets = await sweetsService.search({
    name: name as string | undefined,
    category: category as string | undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });
  return res.status(200).json(sweets);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parse = sweetSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const sweet = await sweetsService.update(id, parse.data);
  return res.status(200).json(sweet);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  await sweetsService.remove(id);
  return res.status(204).send();
}

const qtySchema = z.object({ quantity: z.number().int().positive().default(1) });

export async function purchase(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parse = qtySchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const sweet = await sweetsService.purchase(id, parse.data.quantity);
    return res.status(200).json(sweet);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

export async function restock(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parse = qtySchema.safeParse(req.body ?? {});
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const sweet = await sweetsService.restock(id, parse.data.quantity);
  return res.status(200).json(sweet);
}
