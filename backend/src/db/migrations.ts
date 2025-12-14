import fs from 'fs';
import path from 'path';
import { getDb, saveDb } from '../db';
import '../config/env';

const migrationsDir = path.resolve(__dirname, '..', 'migrations');

export function runMigrations() {
  const db = getDb();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.run(sql);
  }
  saveDb();
}
