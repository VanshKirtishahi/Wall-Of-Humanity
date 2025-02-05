import api from './api';

class DonationService {
  async getAllDonations() {
    try {
      const response = await api.get('/donations');
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

      const response = await api.get('/donations/my-donations', {
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
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user.token) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5000/api/donations/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch donation');
      }

      return data;
    } catch (error) {
      console.error('Get donation error:', error);
      throw error;
    }
  }

  async createDonation(formData) {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user.token) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (response.status === 401) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create donation');
      }

      return data;
    } catch (error) {
      if (error.message === 'Authentication required') {
        window.location.href = '/login';
      }
      throw error;
    }
  }

  async updateDonation(id, formData) {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user.token) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5000/api/donations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('user');
          throw new Error('Authentication required');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update donation');
      }

      return await response.json();
    } catch (error) {
      console.error('Update donation error:', error);
      throw error;
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

      // Add user data to formData
      formData.append('userId', user._id);
      formData.append('user', user._id);

      const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create donation');
      }

      return await response.json();
    } catch (error) {
      console.error('Create donation error:', error);
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
        totalDonations: response.data.totalDonations || 0,
        ngoCount: response.data.ngoCount || 0,
        volunteerCount: response.data.volunteerCount || 0,
        userCount: response.data.userCount || 0,
        requestCount: response.data.requestCount || 0
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const donationService = new DonationService();
export default donationService; 