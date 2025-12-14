import './config/env';
import { PORT } from './config/env';
import { initDb } from './db';
import app from './app';

async function main() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
