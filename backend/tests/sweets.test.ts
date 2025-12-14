import request from 'supertest';
import app from '../src/app';
import bcrypt from 'bcryptjs';
import { signToken } from '../src/utils/jwt';
import { getDb, saveDb } from '../src/db';

function createAdmin() {
  const db = getDb();
  const email = 'admin@example.com';
  const passwordHash = bcrypt.hashSync('adminpass', 10);
  db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, 'ADMIN']);
  const result = db.exec('SELECT id, email, role FROM users WHERE email = ?', [email]);
  saveDb();
  const row = result[0].values[0];
  return signToken({ id: row[0] as number, email: row[1] as string, role: 'ADMIN' });
}

function createUser() {
  const db = getDb();
  const email = 'user2@example.com';
  const passwordHash = bcrypt.hashSync('userpass', 10);
  db.run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, 'USER']);
  const result = db.exec('SELECT id, email, role FROM users WHERE email = ?', [email]);
  saveDb();
  const row = result[0].values[0];
  return signToken({ id: row[0] as number, email: row[1] as string, role: 'USER' });
}

describe('Sweets', () => {
  it('admin can create and user can list/search/purchase', async () => {
    const adminToken = createAdmin();
    const userToken = createUser();

    await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ladoo', category: 'Traditional', price: 2.5, quantity: 10, imageUrl: 'https://example.com/ladoo.jpg' })
      .expect(201);

    const list = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(list.body.length).toBe(1);
    expect(list.body[0].name).toBe('Ladoo');

    const search = await request(app)
      .get('/api/sweets/search?name=ladoo')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(search.body.length).toBe(1);

    const purchase = await request(app)
      .post(`/api/sweets/${list.body[0].id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 2 })
      .expect(200);

    expect(purchase.body.quantity).toBe(8);
  });

  it('admin can update, restock, and delete sweets', async () => {
    const adminToken = createAdmin();

    const created = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Barfi', category: 'Milk', price: 3.1, quantity: 4, imageUrl: 'https://example.com/barfi.jpg' })
      .expect(201);

    const sweetId = created.body.id;

    const updated = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Kaju Barfi', category: 'Cashew', price: 4.5, quantity: 6, imageUrl: 'https://example.com/barfi-new.jpg' })
      .expect(200);

    expect(updated.body.name).toBe('Kaju Barfi');
    expect(updated.body.quantity).toBe(6);

    const restocked = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 })
      .expect(200);

    expect(restocked.body.quantity).toBe(11);

    await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const listAfterDelete = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(listAfterDelete.body.length).toBe(0);
  });

  it('prevents purchasing more sweets than available', async () => {
    const adminToken = createAdmin();
    const userToken = createUser();

    const created = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jalebi', category: 'Fried', price: 1.5, quantity: 1, imageUrl: 'https://example.com/jalebi.jpg' })
      .expect(201);

    const sweetId = created.body.id;

    await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 })
      .expect(200);

    const overPurchase = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 })
      .expect(400);

    expect(overPurchase.body.error).toBe('Insufficient stock');
  });
});
