import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, ''), // Remove trailing slash if present
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Normalize URL to ensure proper formatting
    const normalizedUrl = config.url.replace(/^\/+/, '').replace(/\/+$/, '');
    
    // Add api prefix if not present
    if (!normalizedUrl.startsWith('api/')) {
      config.url = `/api/${normalizedUrl}`;
    } else {
      config.url = `/${normalizedUrl}`;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't override Content-Type if it's multipart/form-data
    if (!config.headers['Content-Type']?.includes('multipart/form-data')) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Log the final URL for debugging
    const finalUrl = `${config.baseURL}${config.url}`;
    console.log('Making request to:', finalUrl);
    console.log('Request config:', {
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 