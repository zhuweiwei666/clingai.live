import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const streamerService = {
  // 获取AI主播列表
  getList: async (params = {}) => {
    return apiClient.get(API_ENDPOINTS.AI_STREAMER.LIST, { params });
  },

  // 获取AI主播详情
  getDetail: async (id) => {
    return apiClient.get(`${API_ENDPOINTS.AI_STREAMER.DETAIL}/${id}`);
  },

  // 收藏/取消收藏
  toggleFavorite: async (id) => {
    return apiClient.post(`${API_ENDPOINTS.AI_STREAMER.FAVORITE}/${id}`);
  },
};

