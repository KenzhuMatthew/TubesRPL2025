// api/mahasiswa.api.js - Fixed (Remove /api prefix)
import axios from './axios';

// ===== DASHBOARD =====
export const getDashboard = () => axios.get('/mahasiswa/dashboard');

// ===== COURSE SCHEDULES =====
export const getMahasiswaSchedules = () => 
  axios.get('/mahasiswa/schedules');

export const addMahasiswaSchedule = (data) => 
  axios.post('/mahasiswa/schedules', data);

export const updateMahasiswaSchedule = (id, data) => 
  axios.put(`/mahasiswa/schedules/${id}`, data);

export const deleteMahasiswaSchedule = (id) => 
  axios.delete(`/mahasiswa/schedules/${id}`);

// ===== SUPERVISORS =====
export const getSupervisors = () => 
  axios.get('/mahasiswa/supervisors');

// ===== GUIDANCE SESSIONS =====
export const getAvailableSlots = (params) => 
  axios.get('/mahasiswa/available-slots', { params });

export const requestGuidanceSession = (data) => 
  axios.post('/mahasiswa/sessions/request', data);

export const getMahasiswaSessions = (params) => 
  axios.get('/mahasiswa/sessions', { params });

export const getSessionDetail = (id) => 
  axios.get(`/mahasiswa/sessions/${id}`);

export const updateSessionRequest = (id, data) => 
  axios.put(`/mahasiswa/sessions/${id}`, data);

export const cancelSession = (id) => 
  axios.delete(`/mahasiswa/sessions/${id}`);

export const acceptOfferedSession = (id) => 
  axios.post(`/guidance/mahasiswa/sessions/${id}/accept`);

export const declineOfferedSession = (id, reason) => 
  axios.post(`/guidance/mahasiswa/sessions/${id}/decline`, { reason });

// ===== PROGRESS =====
export const getMahasiswaProgress = () => 
  axios.get('/mahasiswa/progress');

// ===== SCHEDULE UTILITIES =====
export const checkScheduleConflict = (data) => 
  axios.post('/schedule/check-conflict', data);

export const getRooms = () => 
  axios.get('/schedule/rooms');

// Keep old API object for backward compatibility (if needed elsewhere)
export const mahasiswaAPI = {
  // Profile
  getProfile: (id) => axios.get(`/mahasiswa/${id}`),
  updateProfile: (id, data) => axios.put(`/mahasiswa/${id}`, data),
  
  // Course Schedule
  getCourseSchedule: (id) => axios.get(`/mahasiswa/${id}/course-schedule`),
  createCourseSchedule: (id, data) => axios.post(`/mahasiswa/${id}/course-schedule`, data),
  updateCourseSchedule: (id, scheduleId, data) => axios.put(`/mahasiswa/${id}/course-schedule/${scheduleId}`, data),
  deleteCourseSchedule: (id, scheduleId) => axios.delete(`/mahasiswa/${id}/course-schedule/${scheduleId}`),
  
  // Advisors
  getAdvisors: (id) => axios.get(`/mahasiswa/${id}/advisors`),
  getAdvisorAvailability: (id, advisorId, params) => axios.get(`/mahasiswa/${id}/advisors/${advisorId}/availability`, { params }),
  
  // Guidance Sessions
  getGuidanceSessions: (id, params) => axios.get(`/mahasiswa/${id}/guidance-sessions`, { params }),
  getSessionDetail: (id, sessionId) => axios.get(`/mahasiswa/${id}/guidance-sessions/${sessionId}`),
  requestGuidance: (id, data) => axios.post(`/mahasiswa/${id}/guidance-sessions/request`, data),
  updateRequest: (id, sessionId, data) => axios.put(`/mahasiswa/${id}/guidance-sessions/${sessionId}`, data),
  cancelRequest: (id, sessionId, reason) => axios.put(`/mahasiswa/${id}/guidance-sessions/${sessionId}/cancel`, { reason }),
  
  // Progress & History
  getProgress: (id) => axios.get(`/mahasiswa/${id}/progress`),
  getHistory: (id, params) => axios.get(`/mahasiswa/${id}/history`, { params }),
  
  // Thesis
  getThesisInfo: (id) => axios.get(`/mahasiswa/${id}/thesis`),
  updateThesisInfo: (id, data) => axios.put(`/mahasiswa/${id}/thesis`, data),
  
  // Validation
  checkGraduationRequirement: (id) => axios.get(`/mahasiswa/${id}/graduation-check`),
};