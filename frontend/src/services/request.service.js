import api from './api';

const createRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

const getMyRequests = async () => {
  const response = await api.get('/requests/my-requests');
  return response.data;
};

const getDonationRequests = async (donationId) => {
  const response = await api.get(`/requests/donation/${donationId}`);
  return response.data;
};

const updateRequestStatus = async (requestId, status) => {
  const response = await api.patch(`/requests/${requestId}/status`, { status });
  return response.data;
};

const deleteRequest = async (requestId) => {
  const response = await api.delete(`/requests/${requestId}`);
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