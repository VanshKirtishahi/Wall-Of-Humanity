import api from './api';

const getAllNGOs = async () => {
  try {
    const response = await api.get('/ngos');
    return response.data;
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    throw error.response?.data || { message: 'Error fetching NGOs' };
  }
};

const registerNGO = async (ngoData) => {
  try {
    const formData = new FormData();
    
    // Map form fields directly without renaming
    const fieldsToMap = {
      organizationName: ngoData.organizationName,
      organizationEmail: ngoData.organizationEmail,
      phoneNumber: ngoData.phoneNumber,
      contactPersonName: ngoData.contactPersonName,
      contactPersonEmail: ngoData.contactPersonEmail,
      contactPersonPhone: ngoData.contactPersonPhone,
      ngoType: ngoData.ngoType,
      address: ngoData.address,
      ngoWebsite: ngoData.ngoWebsite || '',
      socialMediaLinks: ngoData.socialMediaLinks || ''
    };

    // Append all fields
    Object.entries(fieldsToMap).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Handle date separately
    if (ngoData.incorporationDate) {
      formData.append('incorporationDate', ngoData.incorporationDate.toISOString());
    }

    // Handle files
    if (ngoData.logo instanceof File) {
      formData.append('logo', ngoData.logo);
    }
    if (ngoData.certification instanceof File) {
      formData.append('certification', ngoData.certification);
    }

    const response = await api.post('/ngos/register', formData, {
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
    const response = await api.patch(`/ngos/${ngoId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating NGO status:', error);
    throw error.response?.data || { message: 'Error updating NGO status' };
  }
};

const getNGOProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await api.get('/ngos/profile', {
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