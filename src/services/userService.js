import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const userService = {
  // 登录
  login: async (username, password) => {
    return apiClient.post(API_ENDPOINTS.USER.LOGIN, {
      username,
      password,
    });
  },

  // 注册
  register: async (userData) => {
    return apiClient.post(API_ENDPOINTS.USER.REGISTER, userData);
  },

  // 获取用户信息
  getProfile: async () => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE, userData);
  },

  // Google登录
  googleLogin: async (googleData) => {
    return apiClient.post(API_ENDPOINTS.USER.GOOGLE_LOGIN || '/api/user/google-login', googleData);
  },
};

