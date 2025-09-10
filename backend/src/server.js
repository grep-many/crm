require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

// Handle CORS origin from .env or fallback
let allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : '*';

const server = http.createServer(app);

// socket.io setup — attach to server and make available via app.get('io')
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});
app.set('io', io);

// Socket connection and user-specific rooms
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.join('global');

  socket.on('joinRoom', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room for user ${userId}`);
    }
  });

  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// Create or update admin
const createOrUpdateAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminRole = 'admin';

    if (!adminEmail || !adminPassword) {
      console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin creation/update.');
      return;
    }

    const existing = await User.findOne({ email: adminEmail.toLowerCase() });
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = adminRole;
      existing.name = adminName;
      await existing.save();
      console.log(`Admin user updated: ${existing.email}`);
    } else {
      const admin = new User({
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: adminRole,
      });
      await admin.save();
      console.log('Admin user created:', admin.email);
    }
  } catch (err) {
    console.error('Error creating/updating admin user:', err);
  }
};

const start = async () => {
  try {
    await connectDB();
    await createOrUpdateAdmin();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`CORS allowed origins: ${allowedOrigins}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();