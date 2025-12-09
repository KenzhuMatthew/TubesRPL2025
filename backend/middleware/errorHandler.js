// middleware/errorHandler.js - Global Error Handler
const { AppError } = require('../utils/helpers');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }


  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    error = new AppError('Token tidak valid', 401);
  }

  if (error.name === 'TokenExpiredError') {
    error = new AppError('Token telah kadaluarsa', 401);
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    error = new AppError(messages.join(', '), 400);
  }

  // Handle multer errors
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File terlalu besar', 400);
    } else {
      error = new AppError('Error saat upload file', 400);
    }
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Terjadi kesalahan pada server';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error,
    }),
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} tidak ditemukan`, 404);
  next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
};