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
  // Video
  VIDEO: {
    GENERATE: `${API_BASE_URL}/video/generate`,
    FACE_SWAP: `${API_BASE_URL}/video/face-swap`,
    STATUS: (taskId) => `${API_BASE_URL}/video/status/${taskId}`,
    HISTORY: `${API_BASE_URL}/video/history`,
  },
  // Image
  IMAGE: {
    GENERATE: `${API_BASE_URL}/image/generate`,
    FACE_SWAP: `${API_BASE_URL}/image/face-swap`,
    DRESS_UP: `${API_BASE_URL}/image/dress-up`,
    HD_UPSCALE: `${API_BASE_URL}/image/hd-upscale`,
    REMOVE: `${API_BASE_URL}/image/remove`,
    STATUS: (taskId) => `${API_BASE_URL}/image/status/${taskId}`,
    HISTORY: `${API_BASE_URL}/image/history`,
  },
  // Templates
  TEMPLATES: {
    LIST: `${API_BASE_URL}/templates`,
    TRENDING: `${API_BASE_URL}/templates/trending`,
    NEW: `${API_BASE_URL}/templates/new`,
    CATEGORY: (category) => `${API_BASE_URL}/templates/category/${category}`,
    DETAIL: (id) => `${API_BASE_URL}/templates/${id}`,
    CATEGORIES: `${API_BASE_URL}/templates/meta/categories`,
  },
};

export default API_ENDPOINTS;
