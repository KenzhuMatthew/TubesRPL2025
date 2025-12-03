// frontend/src/utils/constants.js - Frontend Application Constants

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOSEN: 'DOSEN',
  MAHASISWA: 'MAHASISWA',
};

/**
 * Session Status
 */
export const SESSION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * Session Status Labels (for display)
 */
export const SESSION_STATUS_LABELS = {
  PENDING: 'Menunggu Persetujuan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

/**
 * Session Status Colors (for badges)
 */
export const SESSION_STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'info',
  CANCELLED: 'default',
};

/**
 * Session Types
 */
export const SESSION_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  GROUP: 'GROUP',
};

/**
 * Session Type Labels
 */
export const SESSION_TYPE_LABELS = {
  INDIVIDUAL: 'Individual',
  GROUP: 'Kelompok',
};

/**
 * Thesis Types
 */
export const THESIS_TYPE = {
  TA1: 'TA1',
  TA2: 'TA2',
};

/**
 * Thesis Status
 */
export const THESIS_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

/**
 * Thesis Status Labels
 */
export const THESIS_STATUS_LABELS = {
  ACTIVE: 'Aktif',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

/**
 * Notification Types
 */
export const NOTIFICATION_TYPE = {
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
 * Notification Type Labels
 */
export const NOTIFICATION_TYPE_LABELS = {
  SESSION_REQUESTED: 'Pengajuan Bimbingan',
  SESSION_APPROVED: 'Bimbingan Disetujui',
  SESSION_REJECTED: 'Bimbingan Ditolak',
  SESSION_UPDATED: 'Perubahan Jadwal',
  SESSION_CANCELLED: 'Bimbingan Dibatalkan',
  SESSION_REMINDER: 'Pengingat Bimbingan',
  NOTE_ADDED: 'Catatan Bimbingan',
  GUIDANCE_INSUFFICIENT: 'Peringatan Jumlah Bimbingan',
};

/**
 * Thesis Requirements
 */
export const THESIS_REQUIREMENTS = {
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
 * Days of Week
 */
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/**
 * Day Names
 */
export const DAY_NAMES = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

/**
 * Day Names Short
 */
export const DAY_NAMES_SHORT = {
  0: 'Min',
  1: 'Sen',
  2: 'Sel',
  3: 'Rab',
  4: 'Kam',
  5: 'Jum',
  6: 'Sab',
};

/**
 * Month Names
 */
export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

/**
 * File Upload Configuration
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_TEXT: '5MB',
  ALLOWED_EXTENSIONS: ['.csv', '.xlsx', '.xls'],
  ALLOWED_TYPES: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

/**
 * Time Configuration
 */
export const TIME_CONFIG = {
  DEFAULT_SESSION_DURATION: 60, // minutes
  MIN_SESSION_DURATION: 30,
  MAX_SESSION_DURATION: 180,
  TIME_SLOT_INTERVAL: 30, // minutes
  WORKING_HOURS: {
    START: '08:00',
    END: '17:00',
  },
};

/**
 * API Endpoints Base
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Routes
 */
export const ROUTES = {
  // Public
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_IMPORT: '/admin/import',
  ADMIN_REPORTS: '/admin/reports',
  
  // Dosen
  DOSEN_DASHBOARD: '/dosen/dashboard',
  DOSEN_SCHEDULE: '/dosen/schedule',
  DOSEN_AVAILABILITY: '/dosen/availability',
  DOSEN_SESSIONS: '/dosen/sessions',
  DOSEN_STUDENTS: '/dosen/students',
  
  // Mahasiswa
  MAHASISWA_DASHBOARD: '/mahasiswa/dashboard',
  MAHASISWA_SCHEDULE: '/mahasiswa/schedule',
  MAHASISWA_REQUEST: '/mahasiswa/request-guidance',
  MAHASISWA_HISTORY: '/mahasiswa/history',
  MAHASISWA_PROGRESS: '/mahasiswa/progress',
  
  // Shared
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/403',
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
};

/**
 * Theme Options
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Date Format Patterns
 */
export const DATE_FORMATS = {
  DISPLAY: 'DD MMMM YYYY',
  DISPLAY_SHORT: 'DD/MM/YYYY',
  INPUT: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'DD MMMM YYYY, HH:mm',
  DATETIME_SHORT: 'DD/MM/YYYY HH:mm',
};

/**
 * Chart Colors
 */
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SUCCESS: '#2e7d32',
  WARNING: '#ed6c02',
  ERROR: '#d32f2f',
  INFO: '#0288d1',
  GREY: '#757575',
};

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field ini wajib diisi',
  EMAIL_INVALID: 'Format email tidak valid',
  PASSWORD_MIN: 'Password minimal 6 karakter',
  PHONE_INVALID: 'Format nomor telepon tidak valid',
  DATE_INVALID: 'Format tanggal tidak valid',
  TIME_INVALID: 'Format waktu tidak valid',
  TIME_RANGE_INVALID: 'Waktu selesai harus lebih besar dari waktu mulai',
  FILE_TOO_LARGE: 'Ukuran file terlalu besar (max 5MB)',
  FILE_TYPE_INVALID: 'Tipe file tidak valid',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login berhasil',
  LOGOUT: 'Logout berhasil',
  CREATED: 'Data berhasil dibuat',
  UPDATED: 'Data berhasil diupdate',
  DELETED: 'Data berhasil dihapus',
  SESSION_REQUESTED: 'Pengajuan bimbingan berhasil dikirim',
  SESSION_APPROVED: 'Bimbingan berhasil disetujui',
  SESSION_REJECTED: 'Bimbingan berhasil ditolak',
  SESSION_CANCELLED: 'Bimbingan berhasil dibatalkan',
  IMPORT_SUCCESS: 'Data berhasil diimpor',
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  GENERIC: 'Terjadi kesalahan, silakan coba lagi',
  NETWORK: 'Koneksi bermasalah, periksa internet Anda',
  UNAUTHORIZED: 'Sesi Anda telah berakhir, silakan login kembali',
  FORBIDDEN: 'Anda tidak memiliki akses',
  NOT_FOUND: 'Data tidak ditemukan',
  VALIDATION: 'Data yang Anda masukkan tidak valid',
  SCHEDULE_CONFLICT: 'Terdapat konflik jadwal',
  FILE_UPLOAD_FAILED: 'Upload file gagal',
};

/**
 * Debounce Delay (ms)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
};

/**
 * Animation Duration (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

/**
 * Socket Events
 */
export const SOCKET_EVENTS = {
  CONNECT: 'connection',
  DISCONNECT: 'disconnect',
  NEW_NOTIFICATION: 'new_notification',
  SESSION_UPDATED: 'session_updated',
  SCHEDULE_UPDATED: 'schedule_updated',
};

/**
 * Export Types
 */
export const EXPORT_TYPE = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
};

/**
 * View Modes
 */
export const VIEW_MODE = {
  LIST: 'list',
  GRID: 'grid',
  CALENDAR: 'calendar',
};

/**
 * Sort Orders
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

/**
 * Filter Options for Sessions
 */
export const SESSION_FILTERS = {
  ALL: 'all',
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  UPCOMING: 'upcoming',
  PAST: 'past',
};

/**
 * Semester Types
 */
export const SEMESTER_TYPE = {
  GANJIL: 'GANJIL',
  GENAP: 'GENAP',
};

/**
 * Locations/Rooms (example data, should come from API)
 */
export const DEFAULT_LOCATIONS = [
  'Ruang Dosen',
  'Ruang Rapat',
  'Lab Komputer 1',
  'Lab Komputer 2',
  'Perpustakaan',
  'Online (Google Meet)',
  'Online (Zoom)',
];

export default {
  USER_ROLES,
  SESSION_STATUS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  SESSION_TYPE,
  SESSION_TYPE_LABELS,
  THESIS_TYPE,
  THESIS_STATUS,
  THESIS_STATUS_LABELS,
  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_LABELS,
  THESIS_REQUIREMENTS,
  DAYS_OF_WEEK,
  DAY_NAMES,
  DAY_NAMES_SHORT,
  MONTH_NAMES,
  PAGINATION,
  FILE_UPLOAD,
  TIME_CONFIG,
  API_BASE_URL,
  ROUTES,
  STORAGE_KEYS,
  THEMES,
  DATE_FORMATS,
  CHART_COLORS,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  DEBOUNCE_DELAY,
  ANIMATION_DURATION,
  SOCKET_EVENTS,
  EXPORT_TYPE,
  VIEW_MODE,
  SORT_ORDER,
  SESSION_FILTERS,
  SEMESTER_TYPE,
  DEFAULT_LOCATIONS,
};