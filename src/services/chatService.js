import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const chatService = {
  // 发送消息
  sendMessage: async (streamerId, message) => {
    return apiClient.post(API_ENDPOINTS.CHAT.SEND, {
      streamer_id: streamerId,
      message,
    });
  },

  // 获取聊天历史
  getHistory: async (streamerId, page = 1, pageSize = 50) => {
    return apiClient.get(API_ENDPOINTS.CHAT.HISTORY, {
      params: {
        streamer_id: streamerId,
        page,
        page_size: pageSize,
      },
    });
  },

  // 清空聊天记录
  clearHistory: async (streamerId) => {
    return apiClient.delete(`${API_ENDPOINTS.CHAT.CLEAR}/${streamerId}`);
  },
};

