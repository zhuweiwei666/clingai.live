import apiClient from './api';

export const orderService = {
  // 创建订单
  createOrder: async (type, packageId, planId, paymentMethod = 'stripe') => {
    const response = await apiClient.post('/order/create', {
      type,
      packageId,
      planId,
      paymentMethod,
    });
    return response.data;
  },

  // PayPal 支付捕获
  capturePayPalOrder: async (orderId, paypalOrderId) => {
    const response = await apiClient.post('/order/paypal/capture', {
      orderId,
      paypalOrderId,
    });
    return response.data;
  },

  // 查询订单状态
  getOrderStatus: async (orderId) => {
    const response = await apiClient.get(`/order/${orderId}`);
    return response.data;
  },
};

export default orderService;

