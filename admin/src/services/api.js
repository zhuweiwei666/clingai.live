import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Dashboard
export const dashboardApi = {
  getOverview: () => api.get('/admin/dashboard/overview'),
  getTrends: (days = 7) => api.get(`/admin/dashboard/trends?days=${days}`),
  getUsage: (days = 30) => api.get(`/admin/dashboard/usage?days=${days}`),
};

// Users
export const usersApi = {
  getList: (params) => api.get('/admin/users', { params }),
  getDetail: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  modifyCoins: (id, amount, reason) => api.post(`/admin/users/${id}/coins`, { amount, reason }),
  toggleBan: (id) => api.post(`/admin/users/${id}/ban`),
};

// Templates
export const templatesApi = {
  getList: (params) => api.get('/admin/templates', { params }),
  create: (data) => api.post('/admin/templates', data),
  update: (id, data) => api.put(`/admin/templates/${id}`, data),
  delete: (id) => api.delete(`/admin/templates/${id}`),
  batch: (ids, action, value) => api.post('/admin/templates/batch', { ids, action, value }),
};

// Orders
export const ordersApi = {
  getList: (params) => api.get('/admin/orders', { params }),
  getDetail: (id) => api.get(`/admin/orders/${id}`),
  refund: (id) => api.post(`/admin/orders/${id}/refund`),
};

// Tasks
export const tasksApi = {
  getList: (params) => api.get('/admin/tasks', { params }),
  getDetail: (id) => api.get(`/admin/tasks/${id}`),
  getQueue: () => api.get('/admin/tasks/queue'),
  retry: (id) => api.post(`/admin/tasks/${id}/retry`),
  cancel: (id) => api.post(`/admin/tasks/${id}/cancel`),
  cleanQueue: (type) => api.post('/admin/tasks/queue/clean', { type }),
};

// Settings
export const settingsApi = {
  getAll: () => api.get('/admin/settings'),
  update: (key, value) => api.put(`/admin/settings/${key}`, { value }),
  updateCoinPackages: (packages) => api.put('/admin/settings/packages/coins', { packages }),
  updatePlans: (plans) => api.put('/admin/settings/plans/subscription', { plans }),
  updateFeatureCosts: (costs) => api.put('/admin/settings/costs/features', { costs }),
  setMaintenance: (enabled) => api.put('/admin/settings/maintenance', { enabled }),
  setAnnouncement: (text) => api.put('/admin/settings/announcement', { text }),
};

export default api;
