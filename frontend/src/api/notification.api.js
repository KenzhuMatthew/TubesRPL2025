import axios from './axios';

export const notificationAPI = {
  getAll: (params) => axios.get('/notifications', { params }),
  getUnreadCount: () => axios.get('/notifications/unread-count'),
  markAsRead: (id) => axios.put(`/notifications/${id}/read`),
  markAllAsRead: () => axios.put('/notifications/mark-all-read'),
  delete: (id) => axios.delete(`/notifications/${id}`),
  deleteAll: () => axios.delete('/notifications'),
};