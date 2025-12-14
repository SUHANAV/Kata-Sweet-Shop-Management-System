import bcrypt from 'bcryptjs';
import { initDb, getDb, closeDb } from '../db';
import '../config/env';

async function seedAdmin() {
  await initDb();
  const db = getDb();
  const email = 'admin@example.com';
  const passwordHash = bcrypt.hashSync('adminpass', 10);
  
  // Check if user exists
  const existing = db.exec(`SELECT id FROM users WHERE email = '${email}'`);
  if (existing.length && existing[0].values.length) {
    db.run(`UPDATE users SET password_hash = ? WHERE email = ?`, [passwordHash, email]);
  } else {
    db.run(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'ADMIN')`, [email, passwordHash]);
  }
  
  closeDb();
  console.log('Admin user ensured: admin@example.com / adminpass');
}

seedAdmin().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
