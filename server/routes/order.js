import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { getSetting } from '../models/Settings.js';
import { incrementStats } from '../models/DailyStats.js';

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
    const { type, packageId, planId, paymentMethod } = req.body;

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

    // TODO: 调用支付服务创建支付链接
    // const paymentUrl = await paymentService.createPayment(order);

    res.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      // paymentUrl,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// 支付回调（Webhook）
router.post('/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    // TODO: 验证签名
    // TODO: 解析支付结果

    const { orderId, paymentId, status } = req.body; // 模拟

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'success' && order.status !== 'paid') {
      order.status = 'paid';
      order.paymentId = paymentId;
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
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ error: 'Callback failed' });
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

export default router;
