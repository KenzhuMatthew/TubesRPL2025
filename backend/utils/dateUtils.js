/**
 * Date Utilities untuk Backend
 * Fokus pada validasi, perhitungan, dan manipulasi data
 */

/**
 * Parse time string ke Date object
 * @param {string} time - Format HH:mm
 * @param {Date} baseDate - Base date (default: today)
 * @returns {Date}
 */
function parseTime(time, baseDate = new Date()) {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Check if two time ranges overlap
 * @param {string} start1 - Start time 1 (HH:mm)
 * @param {string} end1 - End time 1 (HH:mm)
 * @param {string} start2 - Start time 2 (HH:mm)
 * @param {string} end2 - End time 2 (HH:mm)
 * @returns {boolean}
 */
function isTimeOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
}

/**
 * Convert time string to minutes since midnight
 * @param {string} time - Format HH:mm
 * @returns {number}
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Format HH:mm
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculate duration between two times in minutes
 * @param {string} startTime - Format HH:mm
 * @param {string} endTime - Format HH:mm
 * @returns {number}
 */
function calculateDuration(startTime, endTime) {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Format date to ISO string (for database)
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateISO(date) {
  return new Date(date).toISOString();
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to Indonesian format: DD Month YYYY
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateIndonesian(date) {
  const d = new Date(date);
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format time to HH:mm
 * @param {Date|string} date
 * @returns {string}
 */
function formatTime(date) {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format datetime to Indonesian format
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateTime(date) {
  return `${formatDateIndonesian(date)}, ${formatTime(date)}`;
}

/**
 * Check if two dates are on the same day
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean}
 */
function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 * @param {Date|string} date
 * @returns {number}
 */
function getDayOfWeek(date) {
  return new Date(date).getDay();
}

/**
 * Get day name in Indonesian
 * @param {Date|string|number} date - Date object or day number (0-6)
 * @returns {string}
 */
function getDayNameIndonesian(date) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayIndex = typeof date === 'number' ? date : getDayOfWeek(date);
  return days[dayIndex];
}

/**
 * Add days to date
 * @param {Date|string} date
 * @param {number} days
 * @returns {Date}
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to date
 * @param {Date|string} date
 * @param {number} months
 * @returns {Date}
 */
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Check if date is in the past
 * @param {Date|string} date
 * @returns {boolean}
 */
function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 * @param {Date|string} date
 * @returns {boolean}
 */
function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Check if date is today
 * @param {Date|string} date
 * @returns {boolean}
 */
function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Get difference in days between two dates
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
function diffInDays(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get difference in hours between two dates
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
function diffInHours(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60));
}

/**
 * Get start of day (00:00:00)
 * @param {Date|string} date
 * @returns {Date}
 */
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59)
 * @param {Date|string} date
 * @returns {Date}
 */
function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of week (Monday)
 * @param {Date|string} date
 * @returns {Date}
 */
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
}

/**
 * Get end of week (Sunday)
 * @param {Date|string} date
 * @returns {Date}
 */
function endOfWeek(date) {
  const start = startOfWeek(date);
  return addDays(start, 6);
}

/**
 * Get start of month
 * @param {Date|string} date
 * @returns {Date}
 */
function startOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Get end of month
 * @param {Date|string} date
 * @returns {Date}
 */
function endOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Check if date is within range
 * @param {Date|string} date
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {boolean}
 */
function isWithinRange(date, startDate, endDate) {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

/**
 * Get dates between two dates
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {Date[]}
 */
function getDatesBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

/**
 * Validate date string format (YYYY-MM-DD)
 * @param {string} dateString
 * @returns {boolean}
 */
function isValidDateString(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate time string format (HH:mm)
 * @param {string} timeString
 * @returns {boolean}
 */
function isValidTimeString(timeString) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
}

/**
 * Convert UTC to local timezone
 * @param {Date|string} date
 * @param {string} timezone - IANA timezone (e.g., 'Asia/Jakarta')
 * @returns {Date}
 */
function convertToTimezone(date, timezone = 'Asia/Jakarta') {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Get current timestamp in seconds
 * @returns {number}
 */
function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get academic year from date (e.g., "2024/2025")
 * Assuming academic year starts in August
 * @param {Date|string} date
 * @returns {string}
 */
function getAcademicYear(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  
  if (month >= 7) { // August or later
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}

/**
 * Get semester type from date ('ganjil' or 'genap')
 * @param {Date|string} date
 * @returns {string}
 */
function getSemesterType(date) {
  const d = new Date(date);
  const month = d.getMonth();
  
  // Ganjil: August - January (7-0)
  // Genap: February - July (1-6)
  return (month >= 7 || month <= 0) ? 'ganjil' : 'genap';
}

module.exports = {
  parseTime,
  isTimeOverlap,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  formatDateISO,
  formatDate,
  formatDateIndonesian,
  formatTime,
  formatDateTime,
  isSameDay,
  getDayOfWeek,
  getDayNameIndonesian,
  addDays,
  addMonths,
  isPast,
  isFuture,
  isToday,
  diffInDays,
  diffInHours,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinRange,
  getDatesBetween,
  isValidDateString,
  isValidTimeString,
  convertToTimezone,
  getTimestamp,
  getAcademicYear,
  getSemesterType
};