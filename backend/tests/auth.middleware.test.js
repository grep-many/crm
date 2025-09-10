const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../src/app');
const User = require('../src/models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI + '-test2');
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  await User.create({
    name: 'Admin Test',
    email: 'admintest@example.com',
    passwordHash,
    role: 'admin'
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth Middleware', () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ id: '12345', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('denies access without token', async () => {
    const res = await request(app).get('/api/protected/me');
    expect(res.statusCode).toBe(401);
  });

  it('allows access with valid token', async () => {
    const res = await request(app)
      .get('/api/protected/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('user');
  });

  it('blocks access to admin-only route for user role', async () => {
    const res = await request(app)
      .get('/api/protected/admin-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});
