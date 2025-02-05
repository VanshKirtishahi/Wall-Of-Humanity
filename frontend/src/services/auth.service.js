import api from './api';
import EmailService from './email.service';
import axios from 'axios';

const emailService = new EmailService();

const register = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.token && response.data.user) {
      const userData = {
        ...response.data.user,
        token: response.data.token
      };
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

const login = async (credentials) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.token && response.data.user) {
      const userData = {
        ...response.data.user,
        token: response.data.token
      };
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error details:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const adminLogin = async (credentials) => {
  try {
    const response = await api.post('/auth/admin/login', credentials);
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error.response?.data || { message: 'Login failed' };
  }
};

const verifyAdminToken = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No token found');

    const response = await api.get('/auth/admin/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    localStorage.removeItem('adminToken');
    throw error.response?.data || { message: 'Verification failed' };
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  adminLogin,
  verifyAdminToken
};

export default authService; 