import { getDb, saveDb } from '../db';

export type UserRecord = {
  id: number;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
};

function mapUser(row: any[]): UserRecord {
  return {
    id: row[0] as number,
    email: row[1] as string,
    passwordHash: row[2] as string,
    role: row[3] as 'USER' | 'ADMIN',
    createdAt: new Date(row[4] as string),
    updatedAt: new Date(row[5] as string),
  };
}

export function findByEmail(email: string): UserRecord | null {
  const db = getDb();
  const result = db.exec(`SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1`, [email]);
  if (!result.length || !result[0].values.length) return null;
  return mapUser(result[0].values[0]);
}

export function create(email: string, passwordHash: string, role: 'USER' | 'ADMIN' = 'USER') {
  const db = getDb();
  db.run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`, [email, passwordHash, role]);
  const result = db.exec(`SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = ?`, [email]);
  saveDb();
  return mapUser(result[0].values[0]);
}

export function findById(id: number): UserRecord | null {
  const db = getDb();
  const result = db.exec(`SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1`, [id]);
  if (!result.length || !result[0].values.length) return null;
  return mapUser(result[0].values[0]);
}
