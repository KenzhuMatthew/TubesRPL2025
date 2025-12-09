// middleware/auth.js - Authentication & Authorization Middleware (PostgreSQL Native)
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists and is active
    const userResult = await db.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'User tidak aktif' });
    }

    // Attach user to request object (convert snake_case to camelCase for compatibility)
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token telah kadaluarsa' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Check if user has required role - FIX: Export sebagai function yang return middleware
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Akses ditolak. Halaman ini hanya untuk ${allowedRoles.join(', ')}`,
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.' 
    });
  }
  next();
};

// Check if user is dosen
exports.isDosen = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'DOSEN') {
    return res.status(403).json({ 
      message: 'Akses ditolak. Hanya dosen yang dapat mengakses resource ini.' 
    });
  }
  next();
};

// Check if user is mahasiswa
exports.isMahasiswa = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'MAHASISWA') {
    return res.status(403).json({ 
      message: 'Akses ditolak. Hanya mahasiswa yang dapat mengakses resource ini.' 
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const userResult = await db.query(
      `SELECT id, email, role, is_active
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];

      if (user.is_active) {
        // Attach user to request object
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.is_active
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};