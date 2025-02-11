import api from './api';

class VolunteerService {
  async register(formData) {
    try {
      const response = await api.post('/volunteers', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to register volunteer' };
    }
  }
}

export const volunteerService = new VolunteerService();