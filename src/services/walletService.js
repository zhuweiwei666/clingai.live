import apiClient from './api.js';
import { API_ENDPOINTS } from '../config/api.js';

export const walletService = {
  // 获取余额
  // 后端返回: { success, data: { balance } }
  getBalance: async () => {
    return apiClient.get(API_ENDPOINTS.WALLET.BALANCE);
  },

  // 获取交易历史
  // 后端返回: { success, data: { transactions: [], pagination: {...} } }
  getTransactions: async (page = 1, limit = 20) => {
    return apiClient.get(API_ENDPOINTS.WALLET.TRANSACTIONS, {
      params: { page, limit },
    });
  },
};

