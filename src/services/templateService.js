import apiClient from './api';

export const templateService = {
  // Get all templates
  getAll: async (params = {}) => {
    const response = await apiClient.get('/templates', { params });
    return response.data;
  },

  // Get trending templates
  getTrending: async (limit = 10) => {
    const response = await apiClient.get('/templates/trending', { params: { limit } });
    return response.data;
  },

  // Get new templates
  getNew: async (limit = 10) => {
    const response = await apiClient.get('/templates/new', { params: { limit } });
    return response.data;
  },

  // Get templates by category
  getByCategory: async (category, params = {}) => {
    const response = await apiClient.get(`/templates/category/${category}`, { params });
    return response.data;
  },

  // Get single template
  getById: async (id) => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },

  // Get all categories
  getCategories: async () => {
    const response = await apiClient.get('/templates/meta/categories');
    return response.data;
  },
};

export default templateService;
