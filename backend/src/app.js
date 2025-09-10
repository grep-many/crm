const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth.routes');
const protectedRouter = require('./routes/protected.routes');
const customerRouter = require('./routes/customer.routes');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/protected', protectedRouter);
app.use('/api/customers', customerRouter);

// health check
app.get('/health', (req, res) => res.json({ ok: true }));

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;