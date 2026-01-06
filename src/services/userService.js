import apiClient from './api';

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  // Get user coins
  getCoins: async () => {
    const response = await apiClient.get('/user/coins');
    return response.data;
  },

  // Get user works
  getWorks: async (params = {}) => {
    const response = await apiClient.get('/user/works', { params });
    return response.data;
  },

  // Get user orders
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/user/orders', { params });
    return response.data;
  },

  // Get feedback
  getFeedback: async () => {
    const response = await apiClient.get('/user/feedback');
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (data) => {
    const response = await apiClient.post('/user/feedback', data);
    return response.data;
  },

  // Get email
  getEmail: async () => {
    const response = await apiClient.get('/user/email');
    return response.data;
  },

  // Save email
  saveEmail: async (email) => {
    const response = await apiClient.put('/user/email', { email });
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await apiClient.delete('/user/destroy');
    return response.data;
  },
};

export default userService;

