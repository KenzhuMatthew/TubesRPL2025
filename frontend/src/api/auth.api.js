import axios from './axios';

export const authAPI = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (data) => axios.post('/auth/register', data),
  logout: () => axios.post('/auth/logout'),
  refreshToken: () => axios.post('/auth/refresh'),
  forgotPassword: (email) => axios.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axios.post('/auth/reset-password', { token, password }),
  changePassword: (data) => axios.put('/auth/change-password', data),
  getCurrentUser: () => axios.get('/auth/me'),
};