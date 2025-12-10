/**
 * Date Utilities untuk Frontend
 * Fokus pada display formatting dan user interaction
 * Menggunakan dayjs untuk manipulasi date yang lebih mudah
 */

import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(timezone);
dayjs.extend(utc);

// Set locale to Indonesian
dayjs.locale('id');

// Set default timezone to Jakarta
dayjs.tz.setDefault('Asia/Jakarta');

/**
 * Format date to display format
 * @param {string|Date} date
 * @param {string} format - Default: 'DD MMMM YYYY'
 * @returns {string}
 */
export const formatDate = (date, format = 'DD MMMM YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * Format date to short format (DD/MM/YYYY)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Format time (HH:mm)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
};

/**
 * Format datetime
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMMM YYYY, HH:mm');
};

/**
 * Format relative time (e.g., "2 jam yang lalu")
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * Get day name in Indonesian
 * @param {string|Date|number} date - Date or day number (0-6)
 * @returns {string}
 */
export const getDayName = (date) => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  if (typeof date === 'number') {
    return days[date];
  }
  
  return days[dayjs(date).day()];
};

/**
 * Get day name short
 * @param {string|Date|number} date
 * @returns {string}
 */
export const getDayNameShort = (date) => {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  if (typeof date === 'number') {
    return days[date];
  }
  
  return days[dayjs(date).day()];
};

/**
 * Check if date is today
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Check if date is tomorrow
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isTomorrow = (date) => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

/**
 * Check if date is in the past
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isPast = (date) => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/**
 * Check if date is in the future
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isFuture = (date) => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

/**
 * Get difference in days
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {number}
 */
export const getDaysDiff = (date1, date2 = new Date()) => {
  return dayjs(date1).diff(dayjs(date2), 'day');
};

/**
 * Get difference in hours
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {number}
 */
export const getHoursDiff = (date1, date2 = new Date()) => {
  return dayjs(date1).diff(dayjs(date2), 'hour');
};

/**
 * Add days to date
 * @param {string|Date} date
 * @param {number} days
 * @returns {Date}
 */
export const addDays = (date, days) => {
  return dayjs(date).add(days, 'day').toDate();
};

/**
 * Subtract days from date
 * @param {string|Date} date
 * @param {number} days
 * @returns {Date}
 */
export const subtractDays = (date, days) => {
  return dayjs(date).subtract(days, 'day').toDate();
};

/**
 * Get start of day
 * @param {string|Date} date
 * @returns {Date}
 */
export const startOfDay = (date) => {
  return dayjs(date).startOf('day').toDate();
};

/**
 * Get end of day
 * @param {string|Date} date
 * @returns {Date}
 */
export const endOfDay = (date) => {
  return dayjs(date).endOf('day').toDate();
};

/**
 * Get start of week (Monday)
 * @param {string|Date} date
 * @returns {Date}
 */
export const startOfWeek = (date) => {
  return dayjs(date).startOf('week').add(1, 'day').toDate(); // Monday
};

/**
 * Get end of week (Sunday)
 * @param {string|Date} date
 * @returns {Date}
 */
export const endOfWeek = (date) => {
  return dayjs(date).endOf('week').add(1, 'day').toDate();
};

/**
 * Get start of month
 * @param {string|Date} date
 * @returns {Date}
 */
export const startOfMonth = (date) => {
  return dayjs(date).startOf('month').toDate();
};

/**
 * Get end of month
 * @param {string|Date} date
 * @returns {Date}
 */
export const endOfMonth = (date) => {
  return dayjs(date).endOf('month').toDate();
};

/**
 * Check if date is between two dates
 * @param {string|Date} date
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {boolean}
 */
export const isBetween = (date, start, end) => {
  return dayjs(date).isBetween(start, end, 'day', '[]');
};

/**
 * Parse date from string
 * @param {string} dateString
 * @param {string} format
 * @returns {Date}
 */
export const parseDate = (dateString, format = 'YYYY-MM-DD') => {
  return dayjs(dateString, format).toDate();
};

/**
 * Validate if string is valid date
 * @param {string} dateString
 * @returns {boolean}
 */
export const isValidDate = (dateString) => {
  return dayjs(dateString).isValid();
};

/**
 * Get calendar data for month view
 * @param {string|Date} date
 * @returns {Array<Array<Date>>} - 2D array of weeks
 */
export const getMonthCalendar = (date) => {
  const start = dayjs(date).startOf('month').startOf('week').add(1, 'day');
  const end = dayjs(date).endOf('month').endOf('week').add(1, 'day');
  
  const weeks = [];
  let current = start;
  
  while (current.isSameOrBefore(end)) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(current.toDate());
      current = current.add(1, 'day');
    }
    weeks.push(week);
  }
  
  return weeks;
};

/**
 * Get time slots for a day
 * @param {string} startTime - HH:mm
 * @param {string} endTime - HH:mm
 * @param {number} intervalMinutes - Default: 30
 * @returns {Array<string>} - Array of time slots
 */
export const getTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
  const slots = [];
  let current = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);
  
  while (current.isBefore(end)) {
    slots.push(current.format('HH:mm'));
    current = current.add(intervalMinutes, 'minute');
  }
  
  return slots;
};

/**
 * Check if time is between range
 * @param {string} time - HH:mm
 * @param {string} startTime - HH:mm
 * @param {string} endTime - HH:mm
 * @returns {boolean}
 */
export const isTimeBetween = (time, startTime, endTime) => {
  const t = dayjs(`2000-01-01 ${time}`);
  const start = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);
  
  return t.isSameOrAfter(start) && t.isSameOrBefore(end);
};

/**
 * Format time range
 * @param {string} startTime - HH:mm
 * @param {string} endTime - HH:mm
 * @returns {string}
 */
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '-';
  return `${startTime} - ${endTime}`;
};

/**
 * Calculate duration in minutes
 * @param {string} startTime - HH:mm
 * @param {string} endTime - HH:mm
 * @returns {number}
 */
export const calculateDuration = (startTime, endTime) => {
  const start = dayjs(`2000-01-01 ${startTime}`);
  const end = dayjs(`2000-01-01 ${endTime}`);
  return end.diff(start, 'minute');
};

/**
 * Format duration to readable string
 * @param {number} minutes
 * @returns {string}
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} jam`;
  }
  
  return `${hours} jam ${mins} menit`;
};

/**
 * Get date for input[type="date"]
 * @param {string|Date} date
 * @returns {string} - YYYY-MM-DD format
 */
export const getInputDateValue = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Get time for input[type="time"]
 * @param {string|Date} date
 * @returns {string} - HH:mm format
 */
export const getInputTimeValue = (date) => {
  if (!date) return '';
  return dayjs(date).format('HH:mm');
};

/**
 * Combine date and time
 * @param {string|Date} date
 * @param {string} time - HH:mm
 * @returns {Date}
 */
export const combineDateAndTime = (date, time) => {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  return dayjs(`${dateStr} ${time}`).toDate();
};

/**
 * Get academic year from date
 * @param {string|Date} date
 * @returns {string} - e.g., "2024/2025"
 */
export const getAcademicYear = (date) => {
  const d = dayjs(date);
  const year = d.year();
  const month = d.month();
  
  // Academic year starts in August (month 7)
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
};

/**
 * Get semester type
 * @param {string|Date} date
 * @returns {string} - 'Ganjil' or 'Genap'
 */
export const getSemesterType = (date) => {
  const month = dayjs(date).month();
  // Ganjil: Aug-Jan (7-0), Genap: Feb-Jul (1-6)
  return (month >= 7 || month <= 0) ? 'Ganjil' : 'Genap';
};

/**
 * Format date range
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {string}
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-';
  
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  
  if (start.isSame(end, 'day')) {
    return formatDate(startDate);
  }
  
  if (start.isSame(end, 'month')) {
    return `${start.format('DD')} - ${end.format('DD MMMM YYYY')}`;
  }
  
  if (start.isSame(end, 'year')) {
    return `${start.format('DD MMMM')} - ${end.format('DD MMMM YYYY')}`;
  }
  
  return `${start.format('DD MMMM YYYY')} - ${end.format('DD MMMM YYYY')}`;
};

/**
 * Get upcoming reminder text
 * @param {string|Date} date
 * @returns {string}
 */
export const getUpcomingReminderText = (date) => {
  const now = dayjs();
  const target = dayjs(date);
  const hoursDiff = target.diff(now, 'hour');
  const daysDiff = target.diff(now, 'day');
  
  if (hoursDiff < 1) {
    const minutesDiff = target.diff(now, 'minute');
    return `${minutesDiff} menit lagi`;
  }
  
  if (hoursDiff < 24) {
    return `${hoursDiff} jam lagi`;
  }
  
  if (daysDiff === 1) {
    return 'Besok';
  }
  
  if (daysDiff < 7) {
    return `${daysDiff} hari lagi`;
  }
  
  return formatDate(date);
};

/**
 * Check if session time is soon (within 2 hours)
 * @param {string|Date} date
 * @param {string} time
 * @returns {boolean}
 */
export const isSessionSoon = (date, time) => {
  const sessionDateTime = combineDateAndTime(date, time);
  const hoursDiff = getHoursDiff(sessionDateTime);
  return hoursDiff >= 0 && hoursDiff <= 2;
};

export default {
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  getDayName,
  getDayNameShort,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  getDaysDiff,
  getHoursDiff,
  addDays,
  subtractDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isBetween,
  parseDate,
  isValidDate,
  getMonthCalendar,
  getTimeSlots,
  isTimeBetween,
  formatTimeRange,
  calculateDuration,
  formatDuration,
  getInputDateValue,
  getInputTimeValue,
  combineDateAndTime,
  getAcademicYear,
  getSemesterType,
  formatDateRange,
  getUpcomingReminderText,
  isSessionSoon,
};