// api/axios.js - Axios Configuration (FIXED - Without message)
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('Token expired or invalid, logging out...');
      useAuthStore.getState().logout();
      
      // Redirect ke login (let component handle the message)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have access');
      return Promise.reject({
        status: 403,
        message: 'Forbidden',
        data: error.response.data,
      });
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || 'Terjadi kesalahan pada server';
      
      return Promise.reject({
        status: error.response.status,
        message: errorMessage,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: Cannot connect to server');
      return Promise.reject({
        message: 'Network error',
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        message: error.message,
      });
    }
  }
);

export default axiosInstance;