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
  // Accept either a payload object (recommended) or legacy (credential, clientId)
  googleLogin: async (payloadOrCredential, clientId) => {
    const payload =
      typeof payloadOrCredential === 'string'
        ? { credential: payloadOrCredential, clientId }
        : payloadOrCredential;
    const response = await apiClient.post('/auth/google', payload);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
