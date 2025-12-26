import { Router } from 'express';
import User from '../models/User.js';
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// 获取当前用户信息
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        plan: user.plan,
        planExpireAt: user.planExpireAt,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// 更新用户资料
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 获取金币余额
router.get('/coins', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('coins plan planExpireAt');
    res.json({
      success: true,
      coins: user.coins,
      plan: user.plan,
      planExpireAt: user.planExpireAt,
    });
  } catch (error) {
    console.error('Get coins error:', error);
    res.status(500).json({ error: 'Failed to get coins' });
  }
});

// 获取用户作品
router.get('/works', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const query = { userId: req.user.id, isDeleted: false };
    if (type) query.type = type;

    const works = await Work.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('taskId', 'type status');

    const total = await Work.countDocuments(query);

    res.json({
      success: true,
      works,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get works error:', error);
    res.status(500).json({ error: 'Failed to get works' });
  }
});

// 获取用户订单历史
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      orders,
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

export default router;
