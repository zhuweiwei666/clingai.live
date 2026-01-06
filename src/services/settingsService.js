import apiClient from './api';

export const settingsService = {
  // 获取全局设置 (benchmark: /app/settings/get)
  getSettings: async () => {
    const response = await apiClient.get('/settings/get');
    return response.data;
  },
};

export default settingsService;

