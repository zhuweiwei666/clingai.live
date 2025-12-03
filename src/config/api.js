// API配置
// 使用相对路径，通过 Nginx 反向代理访问后端 API
// 这样可以避免 Mixed Content 错误（HTTPS 页面请求 HTTP API）
// 所有 API 请求会通过当前域名（clingai.live）转发到后端服务器
export const API_BASE_URL = ''; // 使用相对路径，通过 Nginx 反向代理

// 调试：输出 API 配置
console.log('🔧 API Base URL:', API_BASE_URL || '(使用相对路径)');
console.log('🔧 Current Origin:', window.location.origin);

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

