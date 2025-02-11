import api from '../config/axios';
import EmailService from './email.service';

const emailService = new EmailService();

const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', {
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password
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

const login = async (email, password) => {
  try {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid email or password format');
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      throw new Error('Email and password cannot be empty');
    }

    const response = await api.post('/auth/login', {
      email: trimmedEmail,
      password: trimmedPassword
    });

    if (response.data && response.data.token) {
      const userData = {
        token: response.data.token,
        ...response.data.user
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', response.data.token);
      return userData;
    }
    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Login error details:', error.response?.data || error);
    const errorMessage = error.response?.data?.message || error.message || 'Server error';
    throw new Error(errorMessage);
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