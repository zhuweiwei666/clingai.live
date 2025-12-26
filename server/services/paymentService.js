/**
 * Payment Service - Stripe & PayPal Integration
 * 
 * TODO: 填入实际的 API Keys
 */

// Stripe (待配置)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// PayPal (待配置)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // sandbox or live

/**
 * Stripe - 创建支付链接
 */
export async function createStripePayment(order) {
  if (!STRIPE_SECRET_KEY) {
    console.warn('[Payment] Stripe not configured');
    return { url: null, error: 'Stripe not configured' };
  }

  try {
    // TODO: 实际实现
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({...});
    
    console.log('[Payment] Creating Stripe payment for order:', order.orderId);
    
    return {
      url: `https://checkout.stripe.com/pay/${order.orderId}`,
      sessionId: `cs_${Date.now()}`,
    };
  } catch (error) {
    console.error('[Payment] Stripe error:', error);
    return { url: null, error: error.message };
  }
}

/**
 * Stripe - 验证 Webhook
 */
export function verifyStripeWebhook(payload, signature) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return { valid: false, error: 'Webhook secret not configured' };
  }

  try {
    // TODO: 实际验证
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    
    return { valid: true, event: JSON.parse(payload) };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * PayPal - 创建订单
 */
export async function createPayPalOrder(order) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.warn('[Payment] PayPal not configured');
    return { id: null, error: 'PayPal not configured' };
  }

  try {
    // TODO: 实际实现
    // 1. Get access token
    // 2. Create order
    
    console.log('[Payment] Creating PayPal order:', order.orderId);
    
    return {
      id: `PAYPAL_${Date.now()}`,
      status: 'CREATED',
      links: [
        { rel: 'approve', href: `https://www.sandbox.paypal.com/checkoutnow?token=${order.orderId}` },
      ],
    };
  } catch (error) {
    console.error('[Payment] PayPal error:', error);
    return { id: null, error: error.message };
  }
}

/**
 * PayPal - 捕获订单
 */
export async function capturePayPalOrder(paypalOrderId) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { success: false, error: 'PayPal not configured' };
  }

  try {
    // TODO: 实际实现
    console.log('[Payment] Capturing PayPal order:', paypalOrderId);
    
    return {
      success: true,
      status: 'COMPLETED',
      id: paypalOrderId,
    };
  } catch (error) {
    console.error('[Payment] PayPal capture error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取支付服务状态
 */
export function getPaymentStatus() {
  return {
    stripe: {
      configured: !!STRIPE_SECRET_KEY,
      mode: STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test',
    },
    paypal: {
      configured: !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET),
      mode: PAYPAL_MODE,
    },
  };
}

export default {
  createStripePayment,
  verifyStripeWebhook,
  createPayPalOrder,
  capturePayPalOrder,
  getPaymentStatus,
};
