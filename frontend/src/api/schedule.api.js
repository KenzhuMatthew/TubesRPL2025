// api/schedule.api.js - Schedule Management API calls
import axiosInstance from './axios';

export const scheduleApi = {
  // Dosen Schedule APIs
  getDosenSchedules: async (params) => {
    const response = await axiosInstance.get('/dosen/schedules', { params });
    return response.data;
  },

  addDosenSchedule: async (data) => {
    const response = await axiosInstance.post('/dosen/schedules', data);
    return response.data;
  },

  updateDosenSchedule: async (scheduleId, data) => {
    const response = await axiosInstance.put(`/dosen/schedules/${scheduleId}`, data);
    return response.data;
  },

  deleteDosenSchedule: async (scheduleId) => {
    const response = await axiosInstance.delete(`/dosen/schedules/${scheduleId}`);
    return response.data;
  },

  // Dosen Availability APIs
  getAvailabilities: async (params) => {
    const response = await axiosInstance.get('/dosen/availabilities', { params });
    return response.data;
  },

  createAvailability: async (data) => {
    const response = await axiosInstance.post('/dosen/availabilities', data);
    return response.data;
  },

  updateAvailability: async (availabilityId, data) => {
    const response = await axiosInstance.put(`/dosen/availabilities/${availabilityId}`, data);
    return response.data;
  },

  deleteAvailability: async (availabilityId) => {
    const response = await axiosInstance.delete(`/dosen/availabilities/${availabilityId}`);
    return response.data;
  },

  toggleAvailability: async (availabilityId, isActive) => {
    const response = await axiosInstance.patch(`/dosen/availabilities/${availabilityId}/toggle`, {
      isActive,
    });
    return response.data;
  },

  // Mahasiswa Schedule APIs
  getMahasiswaSchedules: async (params) => {
    const response = await axiosInstance.get('/mahasiswa/schedules', { params });
    return response.data;
  },

  addMahasiswaSchedule: async (data) => {
    const response = await axiosInstance.post('/mahasiswa/schedules', data);
    return response.data;
  },

  updateMahasiswaSchedule: async (scheduleId, data) => {
    const response = await axiosInstance.put(`/mahasiswa/schedules/${scheduleId}`, data);
    return response.data;
  },

  deleteMahasiswaSchedule: async (scheduleId) => {
    const response = await axiosInstance.delete(`/mahasiswa/schedules/${scheduleId}`);
    return response.data;
  },

  // Common APIs
  checkConflict: async (data) => {
    const response = await axiosInstance.post('/schedule/check-conflict', data);
    return response.data;
  },

  getRooms: async () => {
    const response = await axiosInstance.get('/schedule/rooms');
    return response.data;
  },
};