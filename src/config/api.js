// API配置
// 根据当前页面的协议自动选择 HTTP/HTTPS
// 如果页面是 HTTPS，API 也必须使用 HTTPS（避免 Mixed Content 错误）
const getApiBaseUrl = () => {
  // 如果当前页面是 HTTPS，强制使用 HTTPS API
  if (window.location.protocol === 'https:') {
    // 尝试使用 HTTPS，如果后端不支持，可能需要配置反向代理
    return 'https://139.162.62.115';
  }
  // 开发环境使用 HTTP
  return 'http://139.162.62.115';
};

export const API_BASE_URL = getApiBaseUrl();

// 调试：输出 API 配置
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Current Protocol:', window.location.protocol);

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

