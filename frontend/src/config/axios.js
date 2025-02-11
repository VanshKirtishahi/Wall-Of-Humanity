import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' 
    ? 'https://wall-of-humanity-xhoc.onrender.com/api'
    : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Remove any double /api occurrences in the URL
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.substring(4); // Remove the leading /api
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 