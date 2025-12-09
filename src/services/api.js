import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加请求日志
    console.log('========================================');
    console.log('🌐 [HTTP请求] 发起请求');
    console.log('🌐 [HTTP请求] 方法:', config.method?.toUpperCase());
    console.log('🌐 [HTTP请求] URL:', config.baseURL + config.url);
    console.log('🌐 [HTTP请求] Headers:', JSON.stringify(config.headers, null, 2));
    if (config.data) {
      console.log('🌐 [HTTP请求] Body:', JSON.stringify(config.data, null, 2));
    }
    console.log('========================================');
    
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [HTTP请求] 已附加Authorization Token');
    }
    return config;
  },
  (error) => {
    console.error('❌ [HTTP请求] 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('========================================');
    console.log('✅ [HTTP响应] 收到响应');
    console.log('✅ [HTTP响应] 状态码:', response.status);
    console.log('✅ [HTTP响应] URL:', response.config.url);
    console.log('✅ [HTTP响应] 数据:', JSON.stringify(response.data, null, 2));
    console.log('========================================');
    
    const responseData = response.data;
    
    if (responseData.success === false) {
      console.error('❌ [HTTP响应] 业务逻辑失败:', responseData.message);
      return Promise.reject({
        message: responseData.message || 'Request failed',
        code: responseData.code,
        statusCode: responseData.statusCode,
      });
    }
    
    return responseData;
  },
  (error) => {
    console.log('========================================');
    console.error('❌ [HTTP响应] 请求失败');
    console.error('❌ [HTTP响应] 错误消息:', error.message);
    
    if (error.response) {
      console.error('❌ [HTTP响应] 状态码:', error.response.status);
      console.error('❌ [HTTP响应] 响应数据:', JSON.stringify(error.response.data, null, 2));
      console.error('❌ [HTTP响应] 响应Headers:', JSON.stringify(error.response.headers, null, 2));
      
      const { status, data } = error.response;
      if (status === 401) {
        console.error('❌ [HTTP响应] 401未授权，清除本地存储');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject({
        message: data?.message || 'Request failed',
        code: data?.code,
        statusCode: status,
        responseData: data,
      });
    }
    
    if (error.request) {
      console.error('❌ [HTTP响应] 请求已发送但无响应');
      console.error('❌ [HTTP响应] 请求对象:', error.request);
    }
    
    console.error('❌ [HTTP响应] 完整错误对象:', error);
    console.log('========================================');
    
    return Promise.reject({
      message: error.message || 'Network error',
      code: 'NETWORK_ERROR',
    });
  }
);

export default apiClient;
