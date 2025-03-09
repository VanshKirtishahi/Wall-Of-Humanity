import api from '../config/axios';

const createRequest = async (requestData) => {
  try {
    // Log the request data for debugging
    console.log('Submitting request with data:', {
      ...requestData,
      // Don't log sensitive information if any
    });

    const response = await api.post('/api/requests', requestData);
    return response.data;
  } catch (error) {
    // Log detailed error information
    console.error('Request creation failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      requestData: {
        ...requestData,
        // Don't log sensitive information if any
      }
    });
    
    // Throw a more informative error
    throw {
      message: error.response?.data?.message || 'Failed to submit request',
      details: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

const getMyRequests = async () => {
  try {
    const response = await api.get('/api/requests/my-requests');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch my requests:', error);
    throw error.response?.data || error;
  }
};

const getDonationRequests = async (donationId) => {
  try {
    const response = await api.get(`/api/requests/donation/${donationId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch donation requests:', error);
    throw error.response?.data || error;
  }
};

const updateRequestStatus = async (requestId, status) => {
  try {
    const response = await api.patch(`/api/requests/${requestId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Failed to update request status:', error);
    throw error.response?.data || error;
  }
};

const deleteRequest = async (requestId) => {
  try {
    const response = await api.delete(`/api/requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete request:', error);
    throw error.response?.data || error;
  }
};

const requestService = {
  createRequest,
  getMyRequests,
  getDonationRequests,
  updateRequestStatus,
  deleteRequest
};

export default requestService; 