// API Configuration
// Production should use same-origin `/api` (proxied by nginx).
// Dev can override via VITE_API_URL or vite proxy.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    GOOGLE: `${API_BASE_URL}/auth/google`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  // User
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile`,
    WORKS: `${API_BASE_URL}/user/works`,
    COINS: `${API_BASE_URL}/user/coins`,
  },
  // Generate (统一生成 API)
  GENERATE: {
    PHOTO2VIDEO: `${API_BASE_URL}/generate/photo2video`,
    FACESWAP: `${API_BASE_URL}/generate/faceswap`,
    FACESWAP_VIDEO: `${API_BASE_URL}/generate/faceswap-video`,
    DRESSUP: `${API_BASE_URL}/generate/dressup`,
    HD: `${API_BASE_URL}/generate/hd`,
    REMOVE: `${API_BASE_URL}/generate/remove`,
    AIIMAGE: `${API_BASE_URL}/generate/aiimage`,
    TASK_STATUS: (taskId) => `${API_BASE_URL}/generate/task/${taskId}`,
    HISTORY: `${API_BASE_URL}/generate/history`,
  },
  // Templates
  TEMPLATES: {
    LIST: `${API_BASE_URL}/templates`,
    TRENDING: `${API_BASE_URL}/templates/trending`,
    NEW: `${API_BASE_URL}/templates/new`,
    CATEGORIES: `${API_BASE_URL}/templates/categories`,
    DETAIL: (id) => `${API_BASE_URL}/templates/${id}`,
  },
};

export default API_ENDPOINTS;
