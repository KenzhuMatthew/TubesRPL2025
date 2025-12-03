// api/guidance.api.js - Guidance Session API calls
import axiosInstance from './axios';

export const guidanceApi = {
  // Mahasiswa APIs
  getAvailableSlots: async (dosenId, date) => {
    const response = await axiosInstance.get('/guidance/mahasiswa/available-slots', {
      params: { dosenId, date },
    });
    return response.data;
  },

  requestSession: async (data) => {
    const response = await axiosInstance.post('/guidance/mahasiswa/sessions/request', data);
    return response.data;
  },

  getMahasiswaSessions: async (params) => {
    const response = await axiosInstance.get('/guidance/mahasiswa/sessions', { params });
    return response.data;
  },

  getSessionDetail: async (sessionId) => {
    const response = await axiosInstance.get(`/guidance/mahasiswa/sessions/${sessionId}`);
    return response.data;
  },

  acceptOfferedSession: async (sessionId) => {
    const response = await axiosInstance.post(`/guidance/mahasiswa/sessions/${sessionId}/accept`);
    return response.data;
  },

  declineOfferedSession: async (sessionId, reason) => {
    const response = await axiosInstance.post(`/guidance/mahasiswa/sessions/${sessionId}/decline`, {
      reason,
    });
    return response.data;
  },

  cancelSession: async (sessionId) => {
    const response = await axiosInstance.delete(`/guidance/mahasiswa/sessions/${sessionId}`);
    return response.data;
  },

  getProgress: async () => {
    const response = await axiosInstance.get('/guidance/mahasiswa/progress');
    return response.data;
  },

  // Dosen APIs
  getDosenSessions: async (params) => {
    const response = await axiosInstance.get('/guidance/dosen/sessions', { params });
    return response.data;
  },

  offerSession: async (data) => {
    const response = await axiosInstance.post('/guidance/dosen/sessions/offer', data);
    return response.data;
  },

  approveSession: async (sessionId, location) => {
    const response = await axiosInstance.post(`/guidance/dosen/sessions/${sessionId}/approve`, {
      location,
    });
    return response.data;
  },

  rejectSession: async (sessionId, reason) => {
    const response = await axiosInstance.post(`/guidance/dosen/sessions/${sessionId}/reject`, {
      reason,
    });
    return response.data;
  },

  addNotes: async (sessionId, data) => {
    const response = await axiosInstance.post(`/guidance/dosen/sessions/${sessionId}/notes`, data);
    return response.data;
  },

  getStudents: async () => {
    const response = await axiosInstance.get('/guidance/dosen/students');
    return response.data;
  },

  getStudentProgress: async (mahasiswaId) => {
    const response = await axiosInstance.get(`/guidance/dosen/students/${mahasiswaId}/progress`);
    return response.data;
  },
};