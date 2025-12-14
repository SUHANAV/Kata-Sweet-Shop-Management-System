import '../src/config/env';
import { initDb, getDb, closeDb, saveDb } from '../src/db';
import { runMigrations } from '../src/db/migrations';

beforeAll(async () => {
  await initDb();
  runMigrations();
});

beforeEach(() => {
  const db = getDb();
  db.run('DELETE FROM sweets;');
  db.run('DELETE FROM users;');
  db.run('DELETE FROM sqlite_sequence WHERE name IN ("sweets", "users");');
  saveDb();
});

afterAll(() => {
  closeDb();
});
