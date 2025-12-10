import axios from './axios';

export const notificationAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllAsRead: () => axios.put('/notifications/read-all'),
  delete: (id) => axios.delete(`/notifications/${id}`),
  deleteAll: () => axios.delete('/notifications'),
};