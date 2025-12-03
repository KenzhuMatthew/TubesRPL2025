// server.js - Main Express Server Setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const dosenRoutes = require('./routes/dosen.routes');
const mahasiswaRoutes = require('./routes/mahasiswa.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const guidanceRoutes = require('./routes/guidance.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import services
const notificationService = require('./services/notification.service');

const app = express();
const server = http.createServer(app);

// Socket.IO setup for real-time notifications
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'SIAP Bimbingan API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      dosen: '/api/dosen',
      mahasiswa: '/api/mahasiswa',
      schedule: '/api/schedule',
      guidance: '/api/guidance',
      notifications: '/api/notifications',
    },
    documentation: '/api/docs',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/guidance', guidanceRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler - must be before error handler
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  // User joins their personal room for targeted notifications
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room: user_${userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Scheduled tasks
if (process.env.NODE_ENV !== 'test') {
  // Send session reminders every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('📬 Running scheduled task: Send session reminders');
    try {
      await notificationService.sendSessionReminders();
    } catch (error) {
      console.error('Error sending session reminders:', error);
    }
  });

  // Clean up old notifications every week
  cron.schedule('0 0 * * 0', async () => {
    console.log('🧹 Running scheduled task: Clean up old notifications');
    try {
      await notificationService.deleteOldNotifications(30); // 30 days old
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ===============================================');
  console.log(`🎓 SIAP Bimbingan API Server`);
  console.log('🚀 ===============================================');
  console.log(`📍 Server running on port: ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('🚀 ===============================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = { app, io };