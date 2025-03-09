import api from '../config/axios';

const getAllNGOs = async () => {
  try {
    const response = await api.get('/api/ngos');
    return response.data;
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    throw error.response?.data || { message: 'Error fetching NGOs' };
  }
};

const registerNGO = async (formData) => {
  try {
    const response = await api.post('/api/ngos/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in registerNGO:', error);
    throw error.response?.data || { message: 'Failed to register NGO' };
  }
};

const updateNGOStatus = async (ngoId, status) => {
  try {
    const response = await api.patch(`/api/ngos/${ngoId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating NGO status:', error);
    throw error.response?.data || { message: 'Error updating NGO status' };
  }
};

const getNGOProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/api/ngos/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching NGO profile:', error);
    throw error.response?.data || { message: 'Error fetching NGO profile' };
  }
};

export default { getAllNGOs, registerNGO, updateNGOStatus, getNGOProfile }; 