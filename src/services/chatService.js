import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const chatService = {
  // 发送消息
  // 后端期望: POST /api/chat { agentId, prompt }
  // 后端返回: { success, data: { message, audioUrl?, imageUrl? } }
  sendMessage: async (agentId, message) => {
    const payload = {
      agentId,
      prompt: message,
    };
    console.log('📤 Chat API 请求:', payload);
    return apiClient.post(API_ENDPOINTS.CHAT.SEND, payload);
  },

  // 获取聊天历史
  // 后端返回: { success, data: { history: [...], intimacy } }
  getHistory: async (agentId) => {
    return apiClient.get(`${API_ENDPOINTS.CHAT.HISTORY}/${agentId}`);
  },

  // 生成图片消息
  // 后端期望: POST /api/chat/image { agentId }
  // 后端返回: { success, data: { imageUrl, message? } }
  generateImage: async (agentId) => {
    console.log('🖼️ 请求生成图片, agentId:', agentId);
    return apiClient.post(API_ENDPOINTS.CHAT.IMAGE, {
      agentId,
    });
  },

  // 文字转语音 (TTS)
  // 后端期望: POST /api/chat/voice { agentId, text }
  // 后端返回: { success, data: { audioUrl } }
  generateVoice: async (agentId, text) => {
    console.log('🔊 请求语音, agentId:', agentId, 'text:', text.slice(0, 50) + '...');
    return apiClient.post(API_ENDPOINTS.CHAT.VOICE, {
      agentId,
      text,
    });
  },

  // 生成视频消息
  // 后端期望: POST /api/chat/video { agentId }
  // 后端返回: { success, data: { videoUrl, message? } }
  generateVideo: async (agentId) => {
    console.log('🎬 请求生成视频, agentId:', agentId);
    return apiClient.post(API_ENDPOINTS.CHAT.VIDEO, {
      agentId,
    });
  },
};
