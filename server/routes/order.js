import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { getSetting } from '../models/Settings.js';
import { incrementStats } from '../models/DailyStats.js';
import paymentService from '../services/paymentService.js';

const router = Router();

// 获取金币套餐
router.get('/packages', async (req, res) => {
  try {
    const coinPackages = await getSetting('coinPackages');
    res.json({ success: true, packages: coinPackages });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to get packages' });
  }
});

// 获取订阅计划
router.get('/plans', async (req, res) => {
  try {
    const subscriptionPlans = await getSetting('subscriptionPlans');
    res.json({ success: true, plans: subscriptionPlans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
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
        return res.status(400).json({ error: 'Invalid package' });
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
        return res.status(400).json({ error: 'Invalid plan' });
      }
      orderData.plan = planId;
      orderData.planDuration = 1; // 1个月
      orderData.amount = plan.price;
    } else {
      return res.status(400).json({ error: 'Invalid order type' });
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

    res.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      paymentUrl: paymentResult?.approveUrl || paymentResult?.url,
      paymentId: paymentResult?.id || paymentResult?.sessionId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PayPal 支付完成回调
router.post('/paypal/capture', verifyToken, async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    const order = await Order.findOne({ orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.json({ success: true, message: 'Already paid' });
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
        await user.addCoins(order.coins + order.bonusCoins);
      } else if (order.type === 'subscription') {
        user.plan = order.plan;
        user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();
      }

      // 统计
      await incrementStats('totalOrders');
      await incrementStats('totalRevenue', order.amount);

      res.json({
        success: true,
        coins: user.coins,
        plan: user.plan,
      });
    } else {
      res.status(400).json({ error: captureResult.error || 'Payment failed' });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: 'Payment capture failed' });
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
          await user.addCoins(order.coins + order.bonusCoins);
        } else if (order.type === 'subscription') {
          user.plan = order.plan;
          user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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
          await user.addCoins(order.coins + order.bonusCoins);
        } else if (order.type === 'subscription') {
          user.plan = order.plan;
          user.planExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// 获取支付状态
router.get('/payment/status', async (req, res) => {
  try {
    const status = paymentService.getPaymentStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
