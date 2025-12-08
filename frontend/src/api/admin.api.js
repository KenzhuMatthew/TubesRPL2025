// api/admin.api.js - Admin Management API calls
import axiosInstance from './axios';

export const adminApi = {
  // User Management
  getUsers: async (params) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/toggle`, {
      isActive,
    });
    return response.data;
  },

  resetPassword: async (userId) => {
    const response = await axiosInstance.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  // Import Data
  importDosenSchedules: async (file, semester) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);

    const response = await axiosInstance.post('/admin/import/schedules', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  importStudentData: async (file, semester) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);

    const response = await axiosInstance.post('/admin/import/students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  importThesisProjects: async (file, semester) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('semester', semester);

    const response = await axiosInstance.post('/admin/import/thesis-projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Monitoring & Reports
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },

  getMonitoringReport: async (params) => {
    const response = await axiosInstance.get('/admin/monitoring', { params });
    return response.data;
  },

  getStudentsNotMeetingRequirements: async (params) => {
    const response = await axiosInstance.get('/admin/monitoring/not-meeting-requirements', {
      params,
    });
    return response.data;
  },

  exportMonitoringReport: async (params) => {
    const response = await axiosInstance.get('/admin/monitoring/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Academic Period Management
  getAcademicPeriods: async () => {
    const response = await axiosInstance.get('/admin/academic-periods');
    return response.data;
  },

  getActivePeriod: async () => {
    const response = await axiosInstance.get('/admin/academic-periods/active');
    return response.data;
  },

  createAcademicPeriod: async (data) => {
    const response = await axiosInstance.post('/admin/academic-periods', data);
    return response.data;
  },

  updateAcademicPeriod: async (periodId, data) => {
    const response = await axiosInstance.put(`/admin/academic-periods/${periodId}`, data);
    return response.data;
  },

  setActivePeriod: async (periodId) => {
    const response = await axiosInstance.post(`/admin/academic-periods/${periodId}/activate`);
    return response.data;
  },

  deleteAcademicPeriod: async (periodId) => {
    const response = await axiosInstance.delete(`/admin/academic-periods/${periodId}`);
    return response.data;
  },

  // Room Management
  getRooms: async () => {
    const response = await axiosInstance.get('/admin/rooms');
    return response.data;
  },

  createRoom: async (data) => {
    const response = await axiosInstance.post('/admin/rooms', data);
    return response.data;
  },

  updateRoom: async (roomId, data) => {
    const response = await axiosInstance.put(`/admin/rooms/${roomId}`, data);
    return response.data;
  },

  deleteRoom: async (roomId) => {
    const response = await axiosInstance.delete(`/admin/rooms/${roomId}`);
    return response.data;
  },
};