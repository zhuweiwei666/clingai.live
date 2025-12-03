// API配置
export const API_BASE_URL = 'http://139.162.62.115';

// API端点
export const API_ENDPOINTS = {
  // 用户管理
  USER: {
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
    GOOGLE_LOGIN: '/api/user/google-login',
  },
  // AI主播
  AI_STREAMER: {
    LIST: '/api/ai-streamer/list',
    DETAIL: '/api/ai-streamer/detail',
    FAVORITE: '/api/ai-streamer/favorite',
  },
  // 聊天
  CHAT: {
    SEND: '/api/chat/send',
    HISTORY: '/api/chat/history',
    CLEAR: '/api/chat/clear',
  },
  // 图片生成
  IMAGE: {
    GENERATE: '/api/image/generate',
    LIST: '/api/image/list',
  },
  // 视频生成
  VIDEO: {
    GENERATE: '/api/video/generate',
    LIST: '/api/video/list',
  },
  // 钱包
  WALLET: {
    BALANCE: '/api/wallet/balance',
    RECHARGE: '/api/wallet/recharge',
    HISTORY: '/api/wallet/history',
  },
  // OSS存储
  OSS: {
    UPLOAD: '/api/oss/upload',
  },
  // 语音模型
  VOICE: {
    LIST: '/api/voice/list',
    USE: '/api/voice/use',
  },
  // 数据统计
  STATS: {
    DASHBOARD: '/api/stats/dashboard',
  },
};

