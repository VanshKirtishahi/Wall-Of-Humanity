import api from '../config/axios';

const createRequest = async (requestData) => {
  const response = await api.post('/api/requests', requestData);
  return response.data;
};

const getMyRequests = async () => {
  const response = await api.get('/api/requests/my-requests');
  return response.data;
};

const getDonationRequests = async (donationId) => {
  const response = await api.get(`/api/requests/donation/${donationId}`);
  return response.data;
};

const updateRequestStatus = async (requestId, status) => {
  const response = await api.patch(`/api/requests/${requestId}/status`, { status });
  return response.data;
};

const deleteRequest = async (requestId) => {
  const response = await api.delete(`/api/requests/${requestId}`);
  return response.data;
};

const requestService = {
  createRequest,
  getMyRequests,
  getDonationRequests,
  updateRequestStatus,
  deleteRequest
};

export default requestService; 