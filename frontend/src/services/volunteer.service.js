import api from '../config/axios';

class VolunteerService {
  async register(formData) {
    try {
      const response = await api.post('/api/volunteers', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to register volunteer' };
    }
  }
}

export const volunteerService = new VolunteerService();