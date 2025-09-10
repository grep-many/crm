const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = require('../src/app');
const User = require('../src/models/user.model');
const Customer = require('../src/models/customer.model');
const Lead = require('../src/models/lead.model');

let token;
let customerId;
let leadId;

beforeAll(async () => {
  // Connect to test DB
  await mongoose.connect(`${process.env.MONGO_URI}-leadTest`);

  // Clear collections
  await Promise.all([User.deleteMany({}), Customer.deleteMany({}), Lead.deleteMany({})]);

  // Create test user
  const passwordHash = await bcrypt.hash('LeadTester123!', 10);
  const user = await User.create({
    name: 'Lead Tester',
    email: 'leadtester@example.com',
    passwordHash,
    role: 'user',
  });

  token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Create test customer
  const customer = await Customer.create({
    name: 'Lead Customer',
    email: 'leadcust@example.com',
    phone: '1234567890',
    ownerId: user._id,
  });

  customerId = customer._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Lead API Endpoints', () => {
  const leadData = {
    title: 'First Lead',
    description: 'This is a test lead',
    status: 'New',
    value: 1000,
  };

  it('POST /api/customers/:customerId/leads → should create a new lead', async () => {
    const res = await request(app)
      .post(`/api/customers/${customerId}/leads`)
      .set('Authorization', `Bearer ${token}`)
      .send(leadData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(leadData.title);

    leadId = res.body._id; // Save for later tests
  });

  it('GET /api/customers/:customerId/leads → should retrieve all leads for a customer', async () => {
    const res = await request(app)
      .get(`/api/customers/${customerId}/leads`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/customers/:customerId/leads/:leadId → should retrieve a single lead', async () => {
    const res = await request(app)
      .get(`/api/customers/${customerId}/leads/${leadId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe(leadData.title);
  });

  it('PUT /api/customers/:customerId/leads/:leadId → should update a lead', async () => {
    const updatedData = { status: 'Contacted', value: 1200 };
    const res = await request(app)
      .put(`/api/customers/${customerId}/leads/${leadId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(updatedData.status);
    expect(res.body.value).toBe(updatedData.value);
  });

  it('DELETE /api/customers/:customerId/leads/:leadId → should delete a lead', async () => {
    const res = await request(app)
      .delete(`/api/customers/${customerId}/leads/${leadId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // Confirm deletion from DB
    const leadExists = await Lead.findById(leadId);
    expect(leadExists).toBeNull();
  });
});
