import axios from 'axios';
import API_BASE_URL from '../config/api';

/**
 * PRODUCTION READY AXIOS INSTANCE
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * AUTH INTERCEPTOR: Attach JWT token to all protected requests
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // As requested by user
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * ERROR INTERCEPTOR: Handle expired tokens and global errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage on authentication failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Force redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
