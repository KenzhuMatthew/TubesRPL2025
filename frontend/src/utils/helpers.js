// frontend/src/utils/helpers.js - Frontend Helper Functions

import { PAGINATION } from './constants';

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate string
 * @param {string} str
 * @param {number} length
 * @param {string} suffix
 * @returns {string}
 */
export const truncate = (str, length = 100, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

/**
 * Get initials from name
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Generate color from string (for avatars)
 * @param {string} str
 * @returns {string}
 */
export const stringToColor = (str) => {
  if (!str) return '#757575';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', 
    '#0288d1', '#7b1fa2', '#c2185b', '#f57c00'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format number with thousand separator
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Format to Indonesian Rupiah
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate percentage
 * @param {number} value
 * @param {number} total
 * @returns {number}
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Deep clone object
 * @param {*} obj
 * @returns {*}
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Remove empty values from object
 * @param {Object} obj
 * @returns {Object}
 */
export const removeEmpty = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Group array by key
 * @param {Array} array
 * @param {string} key
 * @returns {Object}
 */
export const groupBy = (array, key) => {
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
 * @param {string} order
 * @returns {Array}
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

/**
 * Remove duplicates from array
 * @param {Array} array
 * @param {string} key
 * @returns {Array}
 */
export const unique = (array, key = null) => {
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
 * Chunk array into smaller arrays
 * @param {Array} array
 * @param {number} size
 * @returns {Array}
 */
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Download file from blob
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Generate query string from object
 * @param {Object} params
 * @returns {string}
 */
export const buildQueryString = (params) => {
  const cleaned = removeEmpty(params);
  return new URLSearchParams(cleaned).toString();
};

/**
 * Parse query string to object
 * @param {string} search
 * @returns {Object}
 */
export const parseQueryString = (search) => {
  return Object.fromEntries(new URLSearchParams(search));
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
};

/**
 * Mask email address
 * @param {string} email
 * @returns {string}
 */
export const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return email;
  const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  return `${maskedName}@${domain}`;
};

/**
 * Mask phone number
 * @param {string} phone
 * @returns {string}
 */
export const maskPhone = (phone) => {
  if (!phone || phone.length <= 4) return phone;
  return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
};

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func
 * @param {number} limit
 * @returns {Function}
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sleep/delay function
 * @param {number} ms
 * @returns {Promise}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get contrast color (black or white) for background
 * @param {string} hexColor
 * @returns {string}
 */
export const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Scroll to element
 * @param {string} elementId
 * @param {Object} options
 */
export const scrollToElement = (elementId, options = {}) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  }
};

/**
 * Scroll to top
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Format NIM/NIP
 * @param {string} code
 * @returns {string}
 */
export const formatStudentCode = (code) => {
  if (!code) return '';
  // Example: 2110123456 -> 2110.123.456
  if (code.length === 10) {
    return `${code.slice(0, 4)}.${code.slice(4, 7)}.${code.slice(7)}`;
  }
  return code;
};

/**
 * Get file extension from filename
 * @param {string} filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Get file icon color based on extension
 * @param {string} extension
 * @returns {string}
 */
export const getFileIconColor = (extension) => {
  const colors = {
    pdf: '#d32f2f',
    doc: '#1976d2',
    docx: '#1976d2',
    xls: '#2e7d32',
    xlsx: '#2e7d32',
    csv: '#2e7d32',
    ppt: '#ed6c02',
    pptx: '#ed6c02',
    jpg: '#7b1fa2',
    jpeg: '#7b1fa2',
    png: '#7b1fa2',
    zip: '#616161',
    rar: '#616161',
  };
  
  return colors[extension.toLowerCase()] || '#757575';
};

/**
 * Safe JSON parse
 * @param {string} str
 * @param {*} defaultValue
 * @returns {*}
 */
export const safeJSONParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Get user display name with fallback
 * @param {Object} user
 * @returns {string}
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  return user.name || user.email || 'Unknown User';
};

/**
 * Get role badge color
 * @param {string} role
 * @returns {string}
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    ADMIN: 'error',
    DOSEN: 'primary',
    MAHASISWA: 'success',
  };
  return colors[role] || 'default';
};

/**
 * Format academic year display
 * @param {string} academicYear - e.g., "2024/2025"
 * @param {string} semesterType - e.g., "GANJIL"
 * @returns {string}
 */
export const formatAcademicPeriod = (academicYear, semesterType) => {
  const semesterLabel = semesterType === 'GANJIL' ? 'Ganjil' : 'Genap';
  return `${academicYear} ${semesterLabel}`;
};

/**
 * Check if user has role
 * @param {Object} user
 * @param {string|Array} roles
 * @returns {boolean}
 */
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};

/**
 * Get progress color based on percentage
 * @param {number} percentage
 * @returns {string}
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'success';
  if (percentage >= 50) return 'warning';
  return 'error';
};

/**
 * Format guidance count display
 * @param {number} current
 * @param {number} required
 * @returns {string}
 */
export const formatGuidanceCount = (current, required) => {
  return `${current}/${required} Bimbingan`;
};

/**
 * Check if guidance requirement is met
 * @param {number} current
 * @param {number} required
 * @returns {boolean}
 */
export const isGuidanceRequirementMet = (current, required) => {
  return current >= required;
};

/**
 * Get status badge variant
 * @param {string} status
 * @returns {string}
 */
export const getStatusBadgeVariant = (status) => {
  const variants = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    COMPLETED: 'info',
    CANCELLED: 'default',
    ACTIVE: 'success',
  };
  return variants[status] || 'default';
};

/**
 * Generate random ID
 * @returns {string}
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Pluralize word based on count
 * @param {number} count
 * @param {string} singular
 * @param {string} plural
 * @returns {string}
 */
export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format time range for display
 * @param {string} startTime
 * @param {string} endTime
 * @returns {string}
 */
export const formatTimeRangeDisplay = (startTime, endTime) => {
  if (!startTime || !endTime) return '-';
  return `${startTime} - ${endTime} WIB`;
};

/**
 * Get greeting based on time
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

/**
 * Check if browser supports feature
 * @param {string} feature
 * @returns {boolean}
 */
export const supportsFeature = (feature) => {
  const features = {
    clipboard: !!navigator.clipboard,
    notification: 'Notification' in window,
    geolocation: 'geolocation' in navigator,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
  };
  
  return features[feature] || false;
};

/**
 * Request notification permission
 * @returns {Promise<string>}
 */
export const requestNotificationPermission = async () => {
  if (!supportsFeature('notification')) {
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Notification permission error:', error);
    return 'denied';
  }
};

/**
 * Show browser notification
 * @param {string} title
 * @param {Object} options
 */
export const showNotification = (title, options = {}) => {
  if (!supportsFeature('notification') || Notification.permission !== 'granted') {
    return;
  }
  
  new Notification(title, {
    icon: '/logo.png',
    badge: '/logo.png',
    ...options
  });
};

/**
 * Prevent event default and propagation
 * @param {Event} e
 */
export const stopEvent = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Get browser info
 * @returns {Object}
 */
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1];
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1];
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1];
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+)/)?.[1];
  }
  
  return { browserName, browserVersion };
};

/**
 * Check if mobile device
 * @returns {boolean}
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get device type
 * @returns {string}
 */
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Format array to comma-separated string with 'dan' for last item
 * @param {Array} array
 * @param {string} key - Optional key for objects
 * @returns {string}
 */
export const formatList = (array, key = null) => {
  if (!array || array.length === 0) return '';
  
  const items = key ? array.map(item => item[key]) : array;
  
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  
  const lastItem = items.pop();
  return `${items.join(', ')}, dan ${lastItem}`;
};

/**
 * Create pagination object for UI
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {number} maxVisible
 * @returns {Array}
 */
export const getPaginationRange = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const leftOffset = Math.floor(maxVisible / 2);
    const rightOffset = maxVisible - leftOffset - 1;
    
    if (currentPage <= leftOffset + 1) {
      for (let i = 1; i <= maxVisible - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - rightOffset) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - leftOffset + 1; i <= currentPage + rightOffset - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }
  
  return pages;
};

/**
 * Handle API error and return user-friendly message
 * @param {Error} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.data?.error || 'Terjadi kesalahan pada server';
  } else if (error.request) {
    // Request made but no response
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  } else {
    // Something else happened
    return error.message || 'Terjadi kesalahan yang tidak diketahui';
  }
};

export default {
  capitalize,
  truncate,
  getInitials,
  stringToColor,
  formatFileSize,
  formatNumber,
  formatCurrency,
  calculatePercentage,
  deepClone,
  isEmpty,
  removeEmpty,
  groupBy,
  sortBy,
  unique,
  chunkArray,
  downloadBlob,
  copyToClipboard,
  buildQueryString,
  parseQueryString,
  isValidEmail,
  isValidPhone,
  maskEmail,
  maskPhone,
  debounce,
  throttle,
  sleep,
  getContrastColor,
  scrollToElement,
  scrollToTop,
  isInViewport,
  formatStudentCode,
  getFileExtension,
  getFileIconColor,
  safeJSONParse,
  getUserDisplayName,
  getRoleBadgeColor,
  formatAcademicPeriod,
  hasRole,
  getProgressColor,
  formatGuidanceCount,
  isGuidanceRequirementMet,
  getStatusBadgeVariant,
  generateId,
  pluralize,
  formatTimeRangeDisplay,
  getGreeting,
  supportsFeature,
  requestNotificationPermission,
  showNotification,
  stopEvent,
  getBrowserInfo,
  isMobile,
  getDeviceType,
  formatList,
  getPaginationRange,
  getErrorMessage,
};