// config/socket.js - Socket.IO Configuration
const socketIo = require('socket.io');

/**
 * Socket.IO configuration options
 */
const socketConfig = {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
};

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 * @returns {SocketIO.Server} Socket.IO server instance
 */
const initializeSocket = (server) => {
  const io = socketIo(server, socketConfig);

  // Connection event
  io.on('connection', (socket) => {
    console.log('✅ New socket connection:', socket.id);

    // User joins their personal room for notifications
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined room: user_${userId}`);
      
      // Send confirmation
      socket.emit('joined', { 
        userId, 
        room: `user_${userId}`,
        timestamp: new Date().toISOString() 
      });
    });

    // User leaves room
    socket.on('leave', (userId) => {
      socket.leave(`user_${userId}`);
      console.log(`👋 User ${userId} left room: user_${userId}`);
    });

    // Handle custom events
    socket.on('message', (data) => {
      console.log('📨 Message received:', data);
      socket.emit('message', { 
        received: true, 
        timestamp: new Date().toISOString() 
      });
    });

    // Disconnect event
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', socket.id, 'Reason:', reason);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', socket.id, error);
    });
  });

  return io;
};

/**
 * Emit notification to specific user
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification data
 */
const emitToUser = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit notification to multiple users
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {Array} userIds - Array of user IDs
 * @param {object} notification - Notification data
 */
const emitToUsers = (io, userIds, notification) => {
  userIds.forEach((userId) => {
    emitToUser(io, userId, notification);
  });
};

/**
 * Broadcast to all connected clients
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {string} event - Event name
 * @param {object} data - Data to broadcast
 */
const broadcast = (io, event, data) => {
  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get connected clients count
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @returns {number} Number of connected clients
 */
const getConnectedClients = async (io) => {
  const sockets = await io.fetchSockets();
  return sockets.length;
};

/**
 * Get clients in specific room
 * @param {SocketIO.Server} io - Socket.IO server instance
 * @param {string} room - Room name
 * @returns {Array} Array of socket IDs
 */
const getClientsInRoom = async (io, room) => {
  const sockets = await io.in(room).fetchSockets();
  return sockets.map(socket => socket.id);
};

module.exports = {
  socketConfig,
  initializeSocket,
  emitToUser,
  emitToUsers,
  broadcast,
  getConnectedClients,
  getClientsInRoom,
};