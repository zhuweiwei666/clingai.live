/**
 * Payment Service - Stripe & PayPal Integration
 */
import fetch from 'node-fetch';

// Stripe (待配置)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// PayPal (待配置)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox'; // sandbox or live
const PAYPAL_API_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Frontend URL for redirects
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://clingai.live';

/**
 * PayPal - 获取访问令牌
 */
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
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
    const accessToken = await getPayPalAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.orderId,
        description: order.type === 'coins' 
          ? `${order.coins} Coins + ${order.bonusCoins || 0} Bonus`
          : `${order.plan} Subscription`,
        amount: {
          currency_code: 'USD',
          value: order.amount.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'Hot AI',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${FRONTEND_URL}/payment/success?orderId=${order.orderId}`,
        cancel_url: `${FRONTEND_URL}/payment/cancel?orderId=${order.orderId}`,
      },
    };

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (data.id) {
      console.log('[Payment] PayPal order created:', data.id);
      const approveLink = data.links.find(l => l.rel === 'approve');
      return {
        id: data.id,
        status: data.status,
        approveUrl: approveLink?.href,
      };
    } else {
      console.error('[Payment] PayPal create order error:', data);
      return { id: null, error: data.message || 'Failed to create order' };
    }
  } catch (error) {
    console.error('[Payment] PayPal error:', error);
    return { id: null, error: error.message };
  }
}

/**
 * PayPal - 捕获订单（确认支付）
 */
export async function capturePayPalOrder(paypalOrderId) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { success: false, error: 'PayPal not configured' };
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status === 'COMPLETED') {
      console.log('[Payment] PayPal order captured:', paypalOrderId);
      return {
        success: true,
        status: 'COMPLETED',
        id: paypalOrderId,
        captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      };
    } else {
      console.error('[Payment] PayPal capture failed:', data);
      return { success: false, error: data.message || 'Capture failed' };
    }
  } catch (error) {
    console.error('[Payment] PayPal capture error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * PayPal - 验证 Webhook
 */
export async function verifyPayPalWebhook(webhookEvent, headers) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { valid: false, error: 'PayPal not configured' };
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    const verifyData = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData),
    });

    const data = await response.json();
    return { valid: data.verification_status === 'SUCCESS' };
  } catch (error) {
    console.error('[Payment] Webhook verification error:', error);
    return { valid: false, error: error.message };
  }
}

/**
 * Stripe - 创建支付会话
 */
export async function createStripePayment(order) {
  if (!STRIPE_SECRET_KEY) {
    console.warn('[Payment] Stripe not configured');
    return { url: null, error: 'Stripe not configured' };
  }

  try {
    // Dynamic import stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: order.type === 'coins' 
              ? `${order.coins} Coins + ${order.bonusCoins || 0} Bonus`
              : `${order.plan} Subscription`,
          },
          unit_amount: Math.round(order.amount * 100), // cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/payment/success?orderId=${order.orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment/cancel?orderId=${order.orderId}`,
      client_reference_id: order.orderId,
    });

    console.log('[Payment] Stripe session created:', session.id);
    
    return {
      url: session.url,
      sessionId: session.id,
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
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return { valid: false, error: 'Webhook secret not configured' };
  }

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    return { valid: true, event };
  } catch (error) {
    return { valid: false, error: error.message };
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
  verifyPayPalWebhook,
  getPaymentStatus,
};
