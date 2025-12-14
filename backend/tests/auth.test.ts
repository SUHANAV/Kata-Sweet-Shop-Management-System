import request from 'supertest';
import app from '../src/app';

describe('Auth', () => {
  it('registers a user and logs in', async () => {
    const email = 'user@example.com';
    const password = 'password123';

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    expect(reg.body.user.email).toBe(email);
    expect(reg.body.token).toBeDefined();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(login.body.user.email).toBe(email);
    expect(login.body.token).toBeDefined();
  });
});
