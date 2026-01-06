import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { getSetting } from '../models/Settings.js';
import { incrementStats } from '../models/DailyStats.js';
import paymentService from '../services/paymentService.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取金币套餐
router.get('/packages', async (req, res) => {
  try {
    const coinPackages = await getSetting('coinPackages');
    return successResponse(res, { packages: coinPackages });
  } catch (error) {
    console.error('Get packages error:', error);
    return errorResponse(res, 'Failed to get packages', 'GET_PACKAGES_ERROR', 500);
  }
});

// 获取订阅计划
router.get('/plans', async (req, res) => {
  try {
    const subscriptionPlans = await getSetting('subscriptionPlans');
    return successResponse(res, { plans: subscriptionPlans });
  } catch (error) {
    console.error('Get plans error:', error);
    return errorResponse(res, 'Failed to get plans', 'GET_PLANS_ERROR', 500);
  }
});

// 创建订单
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { type, packageId, planId, paymentMethod = 'paypal' } = req.body;

    let orderData = {
      userId: req.user.id,
      type,
      paymentMethod,
    };

    if (type === 'coins') {
      // 金币套餐
      const coinPackages = await getSetting('coinPackages');
      const pkg = coinPackages.find(p => p.id === packageId);
      if (!pkg) {
        return errorResponse(res, 'Invalid package', 'INVALID_PACKAGE', 400);
      }
      orderData.packageId = packageId;
      orderData.coins = pkg.coins;
      orderData.bonusCoins = pkg.bonus || 0;
      orderData.amount = pkg.price;
    } else if (type === 'subscription') {
      // 订阅
      const subscriptionPlans = await getSetting('subscriptionPlans');
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        return errorResponse(res, 'Invalid plan', 'INVALID_PLAN', 400);
      }
      orderData.plan = planId;
      orderData.planDuration = 1; // 1个月
      orderData.amount = plan.price;
    } else {
      return errorResponse(res, 'Invalid order type', 'INVALID_ORDER_TYPE', 400);
    }

    const order = new Order(orderData);
    await order.save();

    // 创建支付链接
    let paymentResult;
    if (paymentMethod === 'paypal') {
      paymentResult = await paymentService.createPayPalOrder(order);
      if (paymentResult.id) {
        order.paymentId = paymentResult.id;
        await order.save();
      }
    } else if (paymentMethod === 'stripe') {
      paymentResult = await paymentService.createStripePayment(order);
      if (paymentResult.sessionId) {
        order.paymentId = paymentResult.sessionId;
        await order.save();
      }
    }

    return successResponse(res, {
      orderId: order.orderId,
      amount: order.amount,
      paymentUrl: paymentResult?.approveUrl || paymentResult?.url,
      paymentId: paymentResult?.id || paymentResult?.sessionId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(res, 'Failed to create order', 'CREATE_ORDER_ERROR', 500);
  }
});

// PayPal 支付完成回调
router.post('/paypal/capture', verifyToken, async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    const order = await Order.findOne({ orderId, userId: req.user.id });
    if (!order) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    if (order.status === 'paid') {
      return successResponse(res, { message: 'Already paid' });
    }

    // 捕获 PayPal 支付
    const captureResult = await paymentService.capturePayPalOrder(paypalOrderId);
    
    if (captureResult.success) {
      order.status = 'paid';
      order.paymentId = captureResult.captureId || paypalOrderId;
      order.paidAt = new Date();
      await order.save();

      // 发放金币/订阅
      const user = await User.findById(order.userId);
      if (order.type === 'coins') {
        await user.addCoins(order.coins + (order.bonusCoins || 0));
      } else if (order.type === 'subscription') {
        // 根据 planId 设置正确的 plan 和过期时间
        const planId = order.plan;
        if (planId === 'super') {
          // Yearly subscription: 365 days
          user.plan = 'pro';
          user.planExpireAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        } else if (planId === 'monthly') {
          // Monthly subscription: 30 days
          user.plan = 'pro';
          user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else {
          // Default: 30 days
          user.plan = planId || 'pro';
          user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        await user.save();
      }

      // 统计
      await incrementStats('totalOrders');
      await incrementStats('totalRevenue', order.amount);

      return successResponse(res, {
        coins: user.coins,
        plan: user.plan,
      });
    } else {
      return errorResponse(res, captureResult.error || 'Payment failed', 'PAYMENT_FAILED', 400);
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    return errorResponse(res, 'Payment capture failed', 'CAPTURE_ERROR', 500);
  }
});

// Stripe Webhook
router.post('/stripe/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = paymentService.verifyStripeWebhook(req.rawBody, signature);
    
    if (!result.valid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = result.event;
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.client_reference_id;

      const order = await Order.findOne({ orderId });
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paymentId = session.payment_intent;
        order.paidAt = new Date();
        await order.save();

        // 发放金币/订阅
        const user = await User.findById(order.userId);
        if (order.type === 'coins') {
          await user.addCoins(order.coins + (order.bonusCoins || 0));
        } else if (order.type === 'subscription') {
          // 根据 planId 设置正确的 plan 和过期时间
          const planId = order.plan;
          if (planId === 'super') {
            // Yearly subscription: 365 days
            user.plan = 'pro';
            user.planExpireAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          } else if (planId === 'monthly') {
            // Monthly subscription: 30 days
            user.plan = 'pro';
            user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else {
            // Default: 30 days
            user.plan = planId || 'pro';
            user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          }
          await user.save();
        }

        await incrementStats('totalOrders');
        await incrementStats('totalRevenue', order.amount);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

// PayPal Webhook
router.post('/paypal/webhook', async (req, res) => {
  try {
    const webhookEvent = req.body;
    const verified = await paymentService.verifyPayPalWebhook(webhookEvent, req.headers);
    
    if (!verified.valid) {
      console.warn('[Payment] Invalid PayPal webhook');
      // 返回 200 避免 PayPal 重试
      return res.json({ received: true });
    }

    const eventType = webhookEvent.event_type;
    
    if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resourceId = webhookEvent.resource.id;
      const order = await Order.findOne({ paymentId: resourceId });
      
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date();
        await order.save();

        const user = await User.findById(order.userId);
        if (order.type === 'coins') {
          await user.addCoins(order.coins + (order.bonusCoins || 0));
        } else if (order.type === 'subscription') {
          // 根据 planId 设置正确的 plan 和过期时间
          const planId = order.plan;
          if (planId === 'super') {
            // Yearly subscription: 365 days
            user.plan = 'pro';
            user.planExpireAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          } else if (planId === 'monthly') {
            // Monthly subscription: 30 days
            user.plan = 'pro';
            user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          } else {
            // Default: 30 days
            user.plan = planId || 'pro';
            user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          }
          await user.save();
        }

        await incrementStats('totalOrders');
        await incrementStats('totalRevenue', order.amount);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.json({ received: true });
  }
});

// 获取订单详情
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.id,
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 'ORDER_NOT_FOUND', 404);
    }

    return successResponse(res, { order });
  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 'Failed to get order', 'GET_ORDER_ERROR', 500);
  }
});

// 获取支付状态
router.get('/payment/status', async (req, res) => {
  try {
    const status = paymentService.getPaymentStatus();
    return successResponse(res, status);
  } catch (error) {
    return errorResponse(res, 'Failed to get status', 'GET_STATUS_ERROR', 500);
  }
});

// 获取用户订阅信息 (benchmark: /app/order/my_subscribe)
router.get('/my_subscribe', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('plan planExpireAt');
    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Find active subscription order
    const activeOrder = await Order.findOne({
      userId: req.user.id,
      type: 'subscription',
      status: 'paid',
    }).sort({ createdAt: -1 });

    return successResponse(res, {
      plan: user.plan || 'free',
      planExpireAt: user.planExpireAt || null,
      isActive: user.plan && user.plan !== 'free' && (!user.planExpireAt || user.planExpireAt > new Date()),
      orderId: activeOrder?.orderId || null,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return errorResponse(res, 'Failed to get subscription', 'GET_SUBSCRIPTION_ERROR', 500);
  }
});

// Stripe取消订阅 (benchmark: /app/order/stripe_unsubscribe)
router.post('/stripe/unsubscribe', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Find active subscription order
    const activeOrder = await Order.findOne({
      userId: req.user.id,
      type: 'subscription',
      status: 'paid',
      paymentMethod: 'stripe',
    }).sort({ createdAt: -1 });

    if (!activeOrder || !activeOrder.paymentId) {
      return errorResponse(res, 'No active subscription found', 'NO_ACTIVE_SUBSCRIPTION', 404);
    }

    // Cancel subscription via Stripe
    try {
      const cancelResult = await paymentService.cancelStripeSubscription(activeOrder.paymentId);
      
      if (cancelResult.success) {
        // Update user plan
        user.plan = 'free';
        user.planExpireAt = null;
        await user.save();

        // Update order status
        activeOrder.status = 'cancelled';
        activeOrder.cancelledAt = new Date();
        await activeOrder.save();

        return successResponse(res, { message: 'Subscription cancelled successfully' });
      } else {
        return errorResponse(res, cancelResult.error || 'Failed to cancel subscription', 'CANCEL_SUBSCRIPTION_ERROR', 500);
      }
    } catch (stripeError) {
      console.error('Stripe cancel error:', stripeError);
      return errorResponse(res, 'Failed to cancel subscription', 'CANCEL_SUBSCRIPTION_ERROR', 500);
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return errorResponse(res, 'Failed to unsubscribe', 'UNSUBSCRIBE_ERROR', 500);
  }
});

export default router;
