import api from '../config/axios';

class DonationService {
  async getAllDonations() {
    try {
      const response = await api.get('donations');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch donations');
    }
  }

  async getMyDonations() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user || !user.token) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      const response = await api.get('donations/my-donations', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get my donations error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
      }
      throw new Error('Authentication required');
    }
  }

  async getDonationById(id) {
    try {
      const response = await api.get(`/donations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createDonation(formData) {
    try {
      // If formData is not already FormData, create a new FormData object
      const data = formData instanceof FormData ? formData : new FormData();
      
      // If formData is a plain object, append each field to FormData
      if (!(formData instanceof FormData)) {
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            // Handle arrays and objects by converting them to JSON strings
            if (typeof formData[key] === 'object' && !(formData[key] instanceof File)) {
              data.append(key, JSON.stringify(formData[key]));
            } else {
              data.append(key, formData[key]);
            }
          }
        });
      }

      const response = await api.post('donations', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Create donation error:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to create donation');
    }
  }

  async updateDonation(id, updateData) {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user.token) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${user.token}`
      };

      if (updateData instanceof FormData) {
        const response = await api.patch(`/donations/${id}`, updateData, {
          headers: headers,
          timeout: 10000
        });
        
        if (!response.data || !response.data.donation) {
          throw new Error('Invalid response from server');
        }

        return response.data;
      } else {
        headers['Content-Type'] = 'application/json';
        const processedData = typeof updateData === 'string' ? updateData : JSON.stringify(updateData);
        
        const response = await api.patch(`/donations/${id}`, processedData, { 
          headers: headers,
          timeout: 10000
        });
        
        if (!response.data || !response.data.donation) {
          throw new Error('Invalid response from server');
        }

        return response.data;
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update donation'
      );
    }
  }

  async deleteDonation(id) {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user.token) {
        throw new Error('Authentication required');
      }

      const response = await api.delete(`/donations/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to delete donation');
    }
  }

  async createDonationWithImage(formData) {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user.token) {
        throw new Error('Authentication required');
      }

      // If formData is not already FormData, create a new FormData object
      const data = formData instanceof FormData ? formData : new FormData();
      
      // If formData is a plain object, append each field to FormData
      if (!(formData instanceof FormData)) {
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            // Handle arrays and objects by converting them to JSON strings
            if (typeof formData[key] === 'object' && !(formData[key] instanceof File)) {
              data.append(key, JSON.stringify(formData[key]));
            } else {
              data.append(key, formData[key]);
            }
          }
        });
      }

      const response = await api.post('/donations', data, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Create donation with image error:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await api.get('/donations/stats'); 
      
      if (!response.data) {
        throw new Error('No data received');
      }

      return {
        totalDonations: parseInt(response.data.totalDonations) || 0,
        ngoCount: parseInt(response.data.ngoCount) || 0,
        volunteerCount: parseInt(response.data.volunteerCount) || 0,
        userCount: parseInt(response.data.userCount) || 0,
        requestCount: parseInt(response.data.requestCount) || 0
      };
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a single instance
const donationService = new DonationService();
export default donationService; 