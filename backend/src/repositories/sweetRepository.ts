import { getDb, saveDb } from '../db';

export type SweetRecord = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapSweet(row: any[]): SweetRecord {
  return {
    id: row[0] as number,
    name: row[1] as string,
    category: row[2] as string,
    price: Number(row[3]),
    quantity: row[4] as number,
    imageUrl: row[5] as string | null,
    createdAt: new Date(row[6] as string),
    updatedAt: new Date(row[7] as string),
  };
}

type SweetCreateInput = { name: string; category: string; price: number; quantity: number; imageUrl?: string | null };
type SweetUpdateInput = Partial<{ name: string; category: string; price: number; quantity: number; imageUrl?: string | null }>;

export function create(data: SweetCreateInput) {
  const db = getDb();
  db.run(
    'INSERT INTO sweets (name, category, price, quantity, image_url) VALUES (?, ?, ?, ?, ?)',
    [data.name, data.category, data.price, data.quantity, data.imageUrl ?? null]
  );
  const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets ORDER BY id DESC LIMIT 1');
  saveDb();
  return mapSweet(result[0].values[0]);
}

export function listAll() {
  const db = getDb();
  const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets ORDER BY created_at DESC');
  if (!result.length) return [];
  return result[0].values.map(mapSweet);
}

export function search(filters: {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const db = getDb();
  const clauses: string[] = [];
  const values: any[] = [];
  if (filters.name) {
    clauses.push(`LOWER(name) LIKE LOWER(?)`);
    values.push(`%${filters.name}%`);
  }
  if (filters.category) {
    clauses.push(`LOWER(category) = LOWER(?)`);
    values.push(filters.category);
  }
  if (typeof filters.minPrice === 'number') {
    clauses.push(`price >= ?`);
    values.push(filters.minPrice);
  }
  if (typeof filters.maxPrice === 'number') {
    clauses.push(`price <= ?`);
    values.push(filters.maxPrice);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = db.exec(`SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets ${where} ORDER BY created_at DESC`, values);
  if (!result.length) return [];
  return result[0].values.map(mapSweet);
}

export function update(id: number, data: SweetUpdateInput) {
  const db = getDb();
  const entries = Object.entries(data);
  if (!entries.length) {
    const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets WHERE id = ?', [id]);
    if (!result.length || !result[0].values.length) throw new Error('Not found');
    return mapSweet(result[0].values[0]);
  }
  const sets: string[] = [];
  const values: any[] = [];
  entries.forEach(([key, value]) => {
    const column = key === 'imageUrl' ? 'image_url' : key;
    sets.push(`${column} = ?`);
    values.push(value);
  });
  values.push(id);
  db.run(`UPDATE sweets SET ${sets.join(', ')} WHERE id = ?`, values);
  const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets WHERE id = ?', [id]);
  if (!result.length || !result[0].values.length) throw new Error('Not found');
  saveDb();
  return mapSweet(result[0].values[0]);
}

export function remove(id: number) {
  const db = getDb();
  const check = db.exec('SELECT id FROM sweets WHERE id = ?', [id]);
  if (!check.length || !check[0].values.length) throw new Error('Not found');
  db.run('DELETE FROM sweets WHERE id = ?', [id]);
  saveDb();
}

export function decrementQuantity(id: number, quantity: number) {
  const db = getDb();
  const check = db.exec('SELECT quantity FROM sweets WHERE id = ?', [id]);
  if (!check.length || !check[0].values.length) throw new Error('Not found');
  const currentQty = check[0].values[0][0] as number;
  if (currentQty < quantity) throw new Error('Insufficient stock');
  db.run('UPDATE sweets SET quantity = quantity - ? WHERE id = ?', [quantity, id]);
  const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets WHERE id = ?', [id]);
  saveDb();
  return mapSweet(result[0].values[0]);
}

export function incrementQuantity(id: number, quantity: number) {
  const db = getDb();
  const check = db.exec('SELECT id FROM sweets WHERE id = ?', [id]);
  if (!check.length || !check[0].values.length) throw new Error('Not found');
  db.run('UPDATE sweets SET quantity = quantity + ? WHERE id = ?', [quantity, id]);
  const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets WHERE id = ?', [id]);
  saveDb();
  return mapSweet(result[0].values[0]);
}

export function findById(id: number) {
  const db = getDb();
  const result = db.exec('SELECT id, name, category, price, quantity, image_url, created_at, updated_at FROM sweets WHERE id = ?', [id]);
  if (!result.length || !result[0].values.length) return null;
  return mapSweet(result[0].values[0]);
}
