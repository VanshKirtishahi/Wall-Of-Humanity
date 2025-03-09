import api from '../config/axios';

class DonationService {
  async getAllDonations() {
    try {
      const response = await api.get('/api/donations');
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

      const response = await api.get('/api/donations/my-donations', {
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
      const response = await api.get(`/api/donations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createDonation(formData) {
    try {
      // Check for authentication
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Authentication required');
      }

      const user = JSON.parse(userData);
      if (!user || !user.token) {
        localStorage.removeItem('user');
        throw new Error('Authentication required');
      }

      // Create a new FormData instance
      const data = new FormData();
      
      // Handle regular form fields
      const fields = ['type', 'title', 'description', 'quantity', 'foodType', 'status'];
      fields.forEach(field => {
        if (formData[field]) {
          data.append(field, formData[field]);
        }
      });

      // Handle nested objects
      if (formData.availability) {
        data.append('availability', JSON.stringify(formData.availability));
      }
      if (formData.location) {
        data.append('location', JSON.stringify(formData.location));
      }

      // Handle images
      if (formData.images && formData.images.length > 0) {
        // Convert base64 to Blob and append
        for (let i = 0; i < formData.images.length; i++) {
          const imageData = formData.images[i];
          if (imageData.startsWith('data:image')) {
            // Convert base64 to Blob
            const byteString = atob(imageData.split(',')[1]);
            const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            data.append('images', blob, `image${i + 1}.${mimeString.split('/')[1]}`);
          } else if (imageData instanceof File) {
            data.append('images', imageData);
          }
        }
      }

      // Add user ID
      const userId = user._id || user.id;
      if (!userId) {
        console.error('User ID not found in:', user);
        throw new Error('User ID not found');
      }
      data.append('userId', userId);

      // Log form data contents for debugging
      console.log('Creating donation with data:');
      for (let pair of data.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'images' ? 'Image data...' : pair[1]));
      }

      // Validate required fields
      const requiredFields = ['type', 'title', 'description', 'userId'];
      for (let field of requiredFields) {
        if (!data.has(field)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const response = await api.post('/api/donations', data, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout for image upload
      });

      console.log('Server response:', response);

      if (response.status === 201 && response.data) {
        console.log('Donation created successfully:', response.data);
        return response.data;
      }

      console.error('Invalid response:', response);
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Create donation error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication required - Please log in again');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error - The image might be too large or in an unsupported format. Please try with a smaller image or a different format.');
      }

      if (error.message.includes('Missing required field')) {
        throw error;
      }

      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create donation. Please check all required fields and try again.'
      );
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
        const response = await api.patch(`/api/donations/${id}`, updateData, {
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
        
        const response = await api.patch(`/api/donations/${id}`, processedData, { 
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

      const response = await api.delete(`/api/donations/${id}`, {
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

      const response = await api.post('/api/donations', data, {
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
      const response = await api.get('/api/donations/stats'); 
      
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