import axios from 'axios';

// In production, use same-origin `/api` (nginx proxies to backend).
// In dev, you can set VITE_API_URL or rely on vite proxy.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 增加到60秒，特别是上传大文件时
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and normalize response format
apiClient.interceptors.response.use(
  (response) => {
    // 统一处理响应格式
    // 如果后端返回的是 { success: true, data: ... }，直接返回 data
    // 如果后端返回的是 { success: true, ... }，返回整个响应
    if (response.data && typeof response.data === 'object') {
      if (response.data.success === true && response.data.data !== undefined) {
        // 标准格式：{ success: true, data: ... }
        response.data = response.data.data;
      } else if (response.data.success === false) {
        // 错误格式：{ success: false, error: ... }
        const error = new Error(response.data.error || 'Request failed');
        error.code = response.data.code;
        error.response = response;
        return Promise.reject(error);
      }
    }
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // 处理统一错误格式 { success: false, error: ... }
      if (errorData.success === false) {
        const errorMessage = errorData.error || 'Request failed';
        const errorCode = errorData.code;
        
        // 创建新的错误对象
        const normalizedError = new Error(errorMessage);
        normalizedError.code = errorCode;
        normalizedError.response = error.response;
        
        // 401 错误：清除 token 并跳转登录
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        return Promise.reject(normalizedError);
      }
      
      // 处理旧格式错误（向后兼容）
      if (errorData.error) {
        error.message = errorData.error;
      }
    }
    
    // 401 错误处理
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
