// API配置
// 使用相对路径，通过 Nginx 反向代理访问后端 API
export const API_BASE_URL = '';

// API端点 - 根据后端实际接口文档配置
export const API_ENDPOINTS = {
  // 用户管理
  USER: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    GOOGLE_LOGIN: '/api/users/google-login',
  },
  // AI角色 (Agents)
  AGENT: {
    LIST: '/api/agents',
    DETAIL: '/api/agents', // GET /api/agents/:id
  },
  // 聊天
  CHAT: {
    SEND: '/api/chat', // POST with { agentId, prompt }
    HISTORY: '/api/chat/history', // GET /api/chat/history/:agentId
    IMAGE: '/api/chat/image', // POST with { agentId } - 生成图片
    VOICE: '/api/chat/voice', // POST with { agentId, text } - 生成语音
    TTS: '/api/chat/tts', // POST with { agentId, text } - TTS
    VIDEO: '/api/chat/video', // POST with { agentId } - 生成视频
  },
  // 钱包
  WALLET: {
    BALANCE: '/api/wallet/balance',
    TRANSACTIONS: '/api/wallet/transactions',
  },
};
