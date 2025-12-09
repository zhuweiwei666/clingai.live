import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const agentService = {
  // 获取AI角色列表
  // 后端返回: { success, data: [{ _id, name, avatarUrl, coverVideoUrl, description, ... }] }
  getList: async () => {
    return apiClient.get(API_ENDPOINTS.AGENT.LIST);
  },

  // 获取AI角色详情
  // 后端返回: { success, data: { _id, name, avatarUrl, ... } }
  getDetail: async (id) => {
    return apiClient.get(`${API_ENDPOINTS.AGENT.DETAIL}/${id}`);
  },
};

// 为了向后兼容，也导出 streamerService
export const streamerService = agentService;

