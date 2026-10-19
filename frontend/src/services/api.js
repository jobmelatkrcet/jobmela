import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};

export const DEFAULT_API_TIMEOUT = 30000; // 30 seconds: accommodates mobile uploads while preventing indefinite hangs

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: DEFAULT_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Token ${token}`);
      } else {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    if (config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized or server errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear token
      // Only clear if path is not login/register
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
