import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const userService = {
  // 登录
  login: async (username, password) => {
    console.log('📡 [userService.login] 发起登录请求');
    return apiClient.post(API_ENDPOINTS.USER.LOGIN, {
      username,
      password,
    });
  },

  // 注册
  register: async (userData) => {
    console.log('📡 [userService.register] 发起注册请求');
    return apiClient.post(API_ENDPOINTS.USER.REGISTER, {
      username: userData.username,
      password: userData.password,
      email: userData.email,
    });
  },

  // Google登录
  googleLogin: async (googleData) => {
    console.log('========================================');
    console.log('📡 [userService.googleLogin] 发起Google登录请求');
    console.log('📡 [userService.googleLogin] API端点:', API_ENDPOINTS.USER.GOOGLE_LOGIN);
    console.log('📡 [userService.googleLogin] 请求数据:', {
      google_id: googleData.google_id,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture?.slice(0, 30) + '...',
    });
    console.log('========================================');
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.USER.GOOGLE_LOGIN, {
        google_id: googleData.google_id,
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture,
      });
      
      console.log('========================================');
      console.log('📡 [userService.googleLogin] 请求成功');
      console.log('📡 [userService.googleLogin] 响应:', response);
      console.log('========================================');
      
      return response;
    } catch (error) {
      console.log('========================================');
      console.error('📡 [userService.googleLogin] 请求失败');
      console.error('📡 [userService.googleLogin] 错误:', error);
      console.log('========================================');
      throw error;
    }
  },

  // 获取用户信息
  getProfile: async () => {
    console.log('📡 [userService.getProfile] 发起获取用户信息请求');
    return apiClient.get(API_ENDPOINTS.USER.PROFILE || '/api/user/profile');
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    console.log('📡 [userService.updateProfile] 发起更新用户信息请求');
    return apiClient.put(API_ENDPOINTS.USER.PROFILE || '/api/user/profile', userData);
  },
};
