import { Router } from 'express';
import User from '../../models/User.js';
import Work from '../../models/Work.js';
import Order from '../../models/Order.js';
import Task from '../../models/Task.js';

const router = Router();

// 获取用户列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, plan, banned } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    if (plan) query.plan = plan;
    if (banned !== undefined) query.isBanned = banned === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// 获取用户详情
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 获取用户统计
    const worksCount = await Work.countDocuments({ userId: user._id, isDeleted: false });
    const ordersCount = await Order.countDocuments({ userId: user._id });
    const tasksCount = await Task.countDocuments({ userId: user._id });

    // 最近订单
    const recentOrders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // 最近作品
    const recentWorks = await Work.find({ userId: user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user,
      stats: {
        works: worksCount,
        orders: ordersCount,
        tasks: tasksCount,
      },
      recentOrders,
      recentWorks,
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ error: 'Failed to get user detail' });
  }
});

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const { username, plan, planExpireAt, isAdmin, isBanned } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username !== undefined) user.username = username;
    if (plan !== undefined) user.plan = plan;
    if (planExpireAt !== undefined) user.planExpireAt = planExpireAt;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (isBanned !== undefined) user.isBanned = isBanned;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// 增减用户金币
router.post('/:id/coins', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (amount > 0) {
      await user.addCoins(amount);
    } else if (amount < 0) {
      if (user.coins < Math.abs(amount)) {
        return res.status(400).json({ error: 'Insufficient coins' });
      }
      user.coins += amount; // amount 是负数
      await user.save();
    }

    // TODO: 记录操作日志

    res.json({ 
      success: true, 
      coins: user.coins,
      message: `Coins ${amount > 0 ? 'added' : 'deducted'}: ${Math.abs(amount)}`,
    });
  } catch (error) {
    console.error('Modify coins error:', error);
    res.status(500).json({ error: 'Failed to modify coins' });
  }
});

// 封禁/解封用户
router.post('/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ 
      success: true, 
      isBanned: user.isBanned,
      message: user.isBanned ? 'User banned' : 'User unbanned',
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

export default router;
