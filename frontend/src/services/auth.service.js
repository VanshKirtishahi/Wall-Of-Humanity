import api from '../config/axios';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getToken() {
    const user = this.getCurrentUser();
    return user?.token;
  }
}

export default new AuthService(); 