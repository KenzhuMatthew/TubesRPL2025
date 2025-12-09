// backend/utils/constants.js - Application Constants

/**
 * User Roles
 */
const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOSEN: 'DOSEN',
  MAHASISWA: 'MAHASISWA',
};

/**
 * Session Status
 */
const SESSION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * Session Types
 */
const SESSION_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  GROUP: 'GROUP',
};

/**
 * Thesis Types
 */
const THESIS_TYPE = {
  TA1: 'TA1',
  TA2: 'TA2',
};

/**
 * Thesis Status
 */
const THESIS_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * Notification Types
 */
const NOTIFICATION_TYPE = {
  SESSION_REQUESTED: 'SESSION_REQUESTED',
  SESSION_APPROVED: 'SESSION_APPROVED',
  SESSION_REJECTED: 'SESSION_REJECTED',
  SESSION_UPDATED: 'SESSION_UPDATED',
  SESSION_CANCELLED: 'SESSION_CANCELLED',
  SESSION_REMINDER: 'SESSION_REMINDER',
  NOTE_ADDED: 'NOTE_ADDED',
  GUIDANCE_INSUFFICIENT: 'GUIDANCE_INSUFFICIENT',
};

/**
 * Notification Priority
 */
const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
};

/**
 * Thesis Requirements
 */
const THESIS_REQUIREMENTS = {
  TA1: {
    beforeUTS: 2,
    beforeUAS: 2,
    total: 4,
  },
  TA2: {
    beforeUTS: 3,
    beforeUAS: 3,
    total: 6,
  },
};

/**
 * Days of Week (0 = Sunday, 1 = Monday, etc.)
 */
const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/**
 * Day Names in Indonesian
 */
const DAY_NAMES = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

/**
 * JWT Configuration
 */
const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
};

/**
 * Pagination Defaults
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * File Upload Configuration
 */
const FILE_UPLOAD = {
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: ['.csv', '.xlsx', '.xls'],
  ALLOWED_MIME_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  UPLOAD_PATHS: {
    SCHEDULES: 'uploads/schedules',
    STUDENTS: 'uploads/students',
    DOCUMENTS: 'uploads/documents',
  },
};

/**
 * Email Configuration
 */
const EMAIL_CONFIG = {
  FROM: process.env.EMAIL_FROM || 'noreply@siapbimbingan.unpar.ac.id',
  APP_NAME: process.env.APP_NAME || 'SIAP Bimbingan',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

/**
 * Academic Calendar
 */
const ACADEMIC_CALENDAR = {
  CURRENT_SEMESTER: process.env.CURRENT_SEMESTER || '2024/2025 Ganjil',
  UTS_DATE: process.env.UTS_DATE || '2025-03-15',
  UAS_DATE: process.env.UAS_DATE || '2025-06-01',
};

/**
 * Semester Types
 */
const SEMESTER_TYPE = {
  GANJIL: 'GANJIL',
  GENAP: 'GENAP',
};

/**
 * API Rate Limiting
 */
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // 100 requests per window
};

/**
 * Session Reminder Configuration
 */
const REMINDER_CONFIG = {
  HOURS_BEFORE: [24, 2], // Send reminders 24 hours and 2 hours before session
  CRON_SCHEDULE: '0 * * * *', // Run every hour
};

/**
 * Time Configuration
 */
const TIME_CONFIG = {
  TIMEZONE: 'Asia/Jakarta',
  DEFAULT_SESSION_DURATION: 60, // minutes
  MIN_SESSION_DURATION: 30, // minutes
  MAX_SESSION_DURATION: 180, // minutes
  WORKING_HOURS: {
    START: '08:00',
    END: '17:00',
  },
};

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error',
  AUTHENTICATION_FAILED: 'Authentication failed',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  NIM_ALREADY_EXISTS: 'NIM already registered',
  NIP_ALREADY_EXISTS: 'NIP already registered',
  SCHEDULE_CONFLICT: 'Schedule conflict detected',
  INSUFFICIENT_GUIDANCE: 'Insufficient guidance sessions',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
};

/**
 * Success Messages
 */
const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SESSION_APPROVED: 'Session approved successfully',
  SESSION_REJECTED: 'Session rejected successfully',
  SESSION_COMPLETED: 'Session completed successfully',
  SESSION_CANCELLED: 'Session cancelled successfully',
  EMAIL_SENT: 'Email sent successfully',
  IMPORT_SUCCESS: 'Data imported successfully',
};

/**
 * HTTP Status Codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Log Levels
 */
const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Import Types
 */
const IMPORT_TYPE = {
  TEACHING_SCHEDULE: 'TEACHING_SCHEDULE',
  COURSE_SCHEDULE: 'COURSE_SCHEDULE',
  STUDENTS: 'STUDENTS',
  THESIS_PROJECTS: 'THESIS_PROJECTS',
};

/**
 * Export Types
 */
const EXPORT_TYPE = {
  GUIDANCE_REPORT: 'GUIDANCE_REPORT',
  INSUFFICIENT_STUDENTS: 'INSUFFICIENT_STUDENTS',
  SCHEDULE_REPORT: 'SCHEDULE_REPORT',
  ATTENDANCE_REPORT: 'ATTENDANCE_REPORT',
};

/**
 * Cache Configuration
 */
const CACHE_CONFIG = {
  TTL: {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 24 * 60 * 60, // 24 hours
  },
  KEYS: {
    USER_PREFIX: 'user:',
    SESSION_PREFIX: 'session:',
    SCHEDULE_PREFIX: 'schedule:',
    AVAILABILITY_PREFIX: 'availability:',
  },
};

/**
 * Socket Events
 */
const SOCKET_EVENTS = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  NEW_NOTIFICATION: 'new_notification',
  SESSION_UPDATED: 'session_updated',
  SCHEDULE_UPDATED: 'schedule_updated',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
};

/**
 * Validation Rules
 */
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 10,
  TITLE_MAX_LENGTH: 500,
  PHONE_PATTERN: /^[0-9]{10,15}$/,
  TIME_PATTERN: /^([01]\d|2[0-3]):([0-5]\d)$/,
  DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
};

module.exports = {
  USER_ROLES,
  SESSION_STATUS,
  SESSION_TYPE,
  THESIS_TYPE,
  THESIS_STATUS,
  NOTIFICATION_TYPE,
  NOTIFICATION_PRIORITY,
  THESIS_REQUIREMENTS,
  DAYS_OF_WEEK,
  DAY_NAMES,
  JWT_CONFIG,
  PAGINATION,
  FILE_UPLOAD,
  EMAIL_CONFIG,
  ACADEMIC_CALENDAR,
  SEMESTER_TYPE,
  RATE_LIMIT,
  REMINDER_CONFIG,
  TIME_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  LOG_LEVEL,
  IMPORT_TYPE,
  EXPORT_TYPE,
  CACHE_CONFIG,
  SOCKET_EVENTS,
  VALIDATION_RULES,
};