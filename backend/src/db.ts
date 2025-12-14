import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { DATABASE_PATH } from './config/env';

let db: Database;

const dbPath = DATABASE_PATH || path.resolve(__dirname, '..', 'data', 'sweetshop.db');

export async function initDb(): Promise<Database> {
  if (db) return db;
  const SQL = await initSqlJs();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

export function getDb(): Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function closeDb() {
  if (db) {
    saveDb();
    db.close();
  }
}
