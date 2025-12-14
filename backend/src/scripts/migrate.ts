import { initDb, closeDb } from '../db';
import { runMigrations } from '../db/migrations';

async function main() {
  await initDb();
  runMigrations();
  closeDb();
  console.log('Migrations applied.');
}

main().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
