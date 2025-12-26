import apiClient from './api';

export const authService = {
  // Login with email/password
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Register new user
  register: async (email, password, username) => {
    const response = await apiClient.post('/auth/register', { email, password, username });
    return response.data;
  },

  // Google OAuth login
  googleLogin: async (credential, clientId) => {
    const response = await apiClient.post('/auth/google', { credential, clientId });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
