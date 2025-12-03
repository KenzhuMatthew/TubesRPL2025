// api/dosen.api.js - FIXED: Sesuaikan dengan backend routes
import axios from './axios';

export const dosenAPI = {
  // ===== DASHBOARD =====
  getDashboard: () => axios.get('/dosen/dashboard'),

  // ===== PROFILE =====
  getProfile: (id) => axios.get(`/dosen/${id}`),
  updateProfile: (id, data) => axios.put(`/dosen/${id}`, data),
  
  // ===== TEACHING SCHEDULES =====
  // FIX: Backend route adalah /dosen/schedules (plural) tanpa userId
  getSchedule: () => axios.get('/dosen/schedules'),
  getSchedules: () => axios.get('/dosen/schedules'), // alias
  createSchedule: (data) => axios.post('/dosen/schedules', data),
  updateSchedule: (scheduleId, data) => axios.put(`/dosen/schedules/${scheduleId}`, data),
  deleteSchedule: (scheduleId) => axios.delete(`/dosen/schedules/${scheduleId}`),
  
  // ===== AVAILABILITY =====
  // FIX: Backend route adalah /dosen/availabilities (plural) tanpa userId
  getAvailability: (params) => axios.get('/dosen/availabilities', { params }),
  getAvailabilities: (params) => axios.get('/dosen/availabilities', { params }), // alias
  createAvailability: (data) => axios.post('/dosen/availabilities', data),
  updateAvailability: (availabilityId, data) => axios.put(`/dosen/availabilities/${availabilityId}`, data),
  deleteAvailability: (availabilityId) => axios.delete(`/dosen/availabilities/${availabilityId}`),
  toggleAvailability: (availabilityId) => axios.patch(`/dosen/availabilities/${availabilityId}/toggle`),
  
  // ===== STUDENTS =====
  // FIX: Backend route adalah /dosen/students tanpa userId
  getStudents: (params) => axios.get('/dosen/students', { params }),
  getStudentDetail: (studentId) => axios.get(`/dosen/students/${studentId}`),
  getStudentProgress: (mahasiswaId) => axios.get(`/dosen/students/${mahasiswaId}/progress`),
  
  // ===== GUIDANCE SESSIONS =====
  // FIX: Backend route adalah /dosen/sessions tanpa userId
  getGuidanceSessions: (params) => axios.get('/dosen/sessions', { params }),
  getSessions: (params) => axios.get('/dosen/sessions', { params }), // alias
  getSessionDetail: (sessionId) => axios.get(`/dosen/sessions/${sessionId}`),
  createSession: (data) => axios.post('/dosen/sessions', data),
  updateSession: (sessionId, data) => axios.put(`/dosen/sessions/${sessionId}`, data),
  deleteSession: (sessionId) => axios.delete(`/dosen/sessions/${sessionId}`),
  
  // Session Actions
  approveSession: (sessionId, data) => axios.post(`/dosen/sessions/${sessionId}/approve`, data),
  rejectSession: (sessionId, data) => axios.post(`/dosen/sessions/${sessionId}/reject`, data),
  
  // ===== NOTES =====
  addNotes: (sessionId, data) => axios.post(`/dosen/sessions/${sessionId}/notes`, data),
  updateNotes: (sessionId, noteId, data) => axios.put(`/dosen/sessions/${sessionId}/notes/${noteId}`, data),
  
  // ===== STATISTICS =====
  getStatistics: () => axios.get('/dosen/statistics'),
};

// Export default
export default dosenAPI;

// ===== INDIVIDUAL EXPORTS (untuk backward compatibility) =====

// Profile
export const getProfile = dosenAPI.getProfile;
export const updateProfile = dosenAPI.updateProfile;

// Dashboard
export const getDashboard = dosenAPI.getDashboard;

// Schedule & Availability
export const getSchedule = dosenAPI.getSchedule;
export const getSchedules = dosenAPI.getSchedules;
export const createSchedule = dosenAPI.createSchedule;
export const updateSchedule = dosenAPI.updateSchedule;
export const deleteSchedule = dosenAPI.deleteSchedule;

export const getAvailability = dosenAPI.getAvailability;
export const getAvailabilities = dosenAPI.getAvailabilities;
export const getDosenAvailabilities = dosenAPI.getAvailability; // alias
export const createAvailability = dosenAPI.createAvailability;
export const updateAvailability = dosenAPI.updateAvailability;
export const deleteAvailability = dosenAPI.deleteAvailability;
export const toggleAvailability = dosenAPI.toggleAvailability;

// Students
export const getStudents = dosenAPI.getStudents;
export const getStudentDetail = dosenAPI.getStudentDetail;
export const getStudentProgress = dosenAPI.getStudentProgress;

// Guidance Sessions
export const getGuidanceSessions = dosenAPI.getGuidanceSessions;
export const getSessions = dosenAPI.getSessions;
export const getDosenSessions = dosenAPI.getGuidanceSessions; // alias
export const getSessionDetail = dosenAPI.getSessionDetail;
export const createSession = dosenAPI.createSession;
export const updateSession = dosenAPI.updateSession;
export const deleteSession = dosenAPI.deleteSession;

export const approveSession = dosenAPI.approveSession;
export const rejectSession = dosenAPI.rejectSession;

// Notes
export const addNotes = dosenAPI.addNotes;
export const updateNotes = dosenAPI.updateNotes;

// Statistics
export const getStatistics = dosenAPI.getStatistics;