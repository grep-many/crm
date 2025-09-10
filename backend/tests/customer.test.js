const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = require('../src/app');
const User = require('../src/models/user.model');
const Customer = require('../src/models/customer.model');
const Lead = require('../src/models/lead.model');
const jwt = require('jsonwebtoken');

let userToken, adminToken;

// Mock Socket.IO globally
const mockEmit = jest.fn();
app.set('io', { to: () => ({ emit: mockEmit }) });

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI + '-customerTest');
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Lead.deleteMany({});

  const passwordHash = await bcrypt.hash('UserPass123!', 10);

  const user = await User.create({
    name: 'Customer Tester',
    email: 'custester@example.com',
    passwordHash,
    role: 'user'
  });

  const admin = await User.create({
    name: 'Admin Tester',
    email: 'admintester@example.com',
    passwordHash,
    role: 'admin'
  });

  userToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Customer API', () => {
  beforeEach(() => {
    mockEmit.mockClear();
  });

  it('should deny creating customer without token', async () => {
    const res = await request(app).post('/api/customers').send({
      name: 'Test Customer',
      email: 'cust1@example.com'
    });
    expect(res.statusCode).toBe(401);
  });

  it('should fail validation on missing name', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ email: 'bad@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('should create a new customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test Customer', email: 'cust1@example.com', phone: '1234567890' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.email).toBe('cust1@example.com');

    // Verify Socket.IO emit
    const events = mockEmit.mock.calls.map(call => call[0]);
    expect(events).toContain('customerCreated');
  });

  it('should not allow duplicate customer email', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Duplicate', email: 'cust1@example.com', phone: '1234567890' });

    expect(res.statusCode).toBe(409);
  });

  it('should get a single customer by ID including leads', async () => {
    const tokenPayload = jwt.verify(userToken, process.env.JWT_SECRET);

    const customer = await Customer.create({
      name: 'Single Customer',
      email: 'single@example.com',
      phone: '1112223333',
      ownerId: tokenPayload.id
    });

    await Lead.create({
      title: 'Test Lead',
      description: 'Lead description',
      status: 'New',
      value: 1000,
      customerId: customer._id
    });

    const res = await request(app)
      .get(`/api/customers/${customer._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', customer._id.toString());
    expect(res.body.leads.length).toBe(1);
    expect(res.body.leads[0].title).toBe('Test Lead');
  });

  it('should return 404 if user tries to access another user’s customer', async () => {
    const otherCustomer = await Customer.create({
      name: 'Other User Customer',
      email: 'other@example.com',
      phone: '0001112222',
      ownerId: new mongoose.Types.ObjectId()
    });

    const res = await request(app)
      .get(`/api/customers/${otherCustomer._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('should list customers with leadsCount', async () => {
    const res = await request(app)
      .get('/api/customers?search=Customer')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('leadsCount');
  });

  it('should update a customer', async () => {
    const tokenPayload = jwt.verify(userToken, process.env.JWT_SECRET);

    const customer = await Customer.create({
      name: 'Updatable Customer',
      email: 'update@example.com',
      phone: '9876543210',
      ownerId: tokenPayload.id
    });

    const res = await request(app)
      .put(`/api/customers/${customer._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Customer Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Customer Name');

    const events = mockEmit.mock.calls.map(call => call[0]);
    expect(events).toContain('customerUpdated');
  });

  it('should delete a customer', async () => {
    const tokenPayload = jwt.verify(userToken, process.env.JWT_SECRET);

    const customer = await Customer.create({
      name: 'Deletable Customer',
      email: 'delete@example.com',
      phone: '5555555555',
      ownerId: tokenPayload.id
    });

    const res = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const check = await Customer.findById(customer._id);
    expect(check).toBeNull();

    const events = mockEmit.mock.calls.map(call => call[0]);
    expect(events).toContain('customerDeleted');
  });

  it('admin should fetch any customer with populated owner', async () => {
    const customer = await Customer.findOne();
    const res = await request(app)
      .get(`/api/customers/${customer._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ownerId).toHaveProperty('name');
    expect(res.body.ownerId).toHaveProperty('email');
  });
});