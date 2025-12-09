// backend/utils/helpers.js - Helper Functions

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PAGINATION } = require('./constants');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string}
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Generate random password
 * @param {number} length - Default: 12
 * @returns {string}
 */
const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Hash password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Paginate array
 * @param {Array} array
 * @param {number} page
 * @param {number} limit
 * @returns {Object}
 */
const paginate = (array, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < array.length,
      hasPrevPage: page > 1,
    }
  };
  
  return results;
};

/**
 * Build pagination metadata
 * @param {number} total - Total items
 * @param {number} page
 * @param {number} limit
 * @returns {Object}
 */
const buildPaginationMeta = (total, page, limit) => {
  return {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
};

/**
 * Sanitize object - remove null/undefined values
 * @param {Object} obj
 * @returns {Object}
 */
const sanitizeObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Pick specific fields from object
 * @param {Object} obj
 * @param {Array<string>} fields
 * @returns {Object}
 */
const pick = (obj, fields) => {
  return fields.reduce((acc, field) => {
    if (obj.hasOwnProperty(field)) {
      acc[field] = obj[field];
    }
    return acc;
  }, {});
};

/**
 * Omit specific fields from object
 * @param {Object} obj
 * @param {Array<string>} fields
 * @returns {Object}
 */
const omit = (obj, fields) => {
  const result = { ...obj };
  fields.forEach(field => delete result[field]);
  return result;
};

/**
 * Sleep function
 * @param {number} ms - Milliseconds
 * @returns {Promise}
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array
 * @param {number} size
 * @returns {Array<Array>}
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Group array by key
 * @param {Array} array
 * @param {string} key
 * @returns {Object}
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array
 * @param {string} key
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array}
 */
const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

/**
 * Remove duplicates from array
 * @param {Array} array
 * @param {string} key - Optional key for objects
 * @returns {Array}
 */
const unique = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Deep clone object
 * @param {Object} obj
 * @returns {Object}
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj
 * @returns {boolean}
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to slug
 * @param {string} str
 * @returns {string}
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate UUID v4
 * @returns {string}
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Mask email address
 * @param {string} email
 * @returns {string}
 */
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  return `${maskedName}@${domain}`;
};

/**
 * Mask phone number
 * @param {string} phone
 * @returns {string}
 */
const maskPhone = (phone) => {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Parse query string to object
 * @param {string} query
 * @returns {Object}
 */
const parseQueryString = (query) => {
  return Object.fromEntries(new URLSearchParams(query));
};

/**
 * Build query string from object
 * @param {Object} params
 * @returns {string}
 */
const buildQueryString = (params) => {
  const sanitized = sanitizeObject(params);
  return new URLSearchParams(sanitized).toString();
};

/**
 * Retry async function
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries (ms)
 * @returns {Promise}
 */
const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

/**
 * Validate Indonesian phone number
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
};

/**
 * Normalize Indonesian phone number to +62 format
 * @param {string} phone
 * @returns {string}
 */
const normalizePhone = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to +62 format
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.slice(1);
  } else if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('+62')) {
    return cleaned;
  }
  
  return '+62' + cleaned;
};

/**
 * Calculate percentage
 * @param {number} value
 * @param {number} total
 * @returns {number}
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Truncate string
 * @param {string} str
 * @param {number} length
 * @param {string} suffix
 * @returns {string}
 */
const truncate = (str, length = 100, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate color from string (for avatar backgrounds)
 * @param {string} str
 * @returns {string} - Hex color
 */
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return '#' + '0'.repeat(6 - color.length) + color;
};

/**
 * Safe JSON parse
 * @param {string} str
 * @param {*} defaultValue
 * @returns {*}
 */
const safeJSONParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Flatten nested object
 * @param {Object} obj
 * @param {string} prefix
 * @returns {Object}
 */
const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    
    return acc;
  }, {});
};

/**
 * Check if value is numeric
 * @param {*} value
 * @returns {boolean}
 */
const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Convert to Indonesian Rupiah format
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
};

module.exports = {
  generateRandomString,
  generatePassword,
  hashPassword,
  comparePassword,
  paginate,
  buildPaginationMeta,
  sanitizeObject,
  pick,
  omit,
  sleep,
  chunkArray,
  groupBy,
  sortBy,
  unique,
  deepClone,
  isEmpty,
  capitalize,
  slugify,
  generateUUID,
  maskEmail,
  maskPhone,
  formatFileSize,
  parseQueryString,
  buildQueryString,
  retry,
  isValidPhone,
  normalizePhone,
  calculatePercentage,
  truncate,
  getInitials,
  stringToColor,
  safeJSONParse,
  flattenObject,
  isNumeric,
  formatCurrency,
  escapeHtml,
  AppError,
};