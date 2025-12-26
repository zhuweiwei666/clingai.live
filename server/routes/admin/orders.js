import { Router } from 'express';
import Order from '../../models/Order.js';
import User from '../../models/User.js';

const router = Router();

// 获取订单列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.orderId = { $regex: search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('userId', 'email username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    // 统计
    const stats = await Order.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      orders,
      stats: stats[0] || { totalRevenue: 0, totalOrders: 0 },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// 获取订单详情
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'email username avatar');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ error: 'Failed to get order detail' });
  }
});

// 退款
router.post('/:id/refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid' });
    }

    // 更新订单状态
    order.status = 'refunded';
    order.refundedAt = new Date();
    await order.save();

    // 扣除用户金币（如果是金币订单）
    if (order.type === 'coins') {
      const user = await User.findById(order.userId);
      const coinsToDeduct = order.coins + order.bonusCoins;
      if (user.coins >= coinsToDeduct) {
        user.coins -= coinsToDeduct;
        await user.save();
      }
    } else if (order.type === 'subscription') {
      // 取消订阅
      const user = await User.findById(order.userId);
      user.plan = 'free';
      user.planExpireAt = null;
      await user.save();
    }

    // TODO: 调用支付服务退款

    res.json({ success: true, message: 'Order refunded' });
  } catch (error) {
    console.error('Refund order error:', error);
    res.status(500).json({ error: 'Failed to refund order' });
  }
});

export default router;
