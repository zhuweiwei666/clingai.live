import { Router } from 'express';
import User from '../models/User.js';
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取当前用户信息
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    return successResponse(res, {
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
    return errorResponse(res, 'Failed to get profile', 'GET_PROFILE_ERROR', 500);
  }
});

// 更新用户资料
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    await user.save();

    return successResponse(res, {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 'UPDATE_PROFILE_ERROR', 500);
  }
});

// 获取金币余额
router.get('/coins', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('coins plan planExpireAt');
    return successResponse(res, {
      coins: user.coins,
      plan: user.plan,
      planExpireAt: user.planExpireAt,
    });
  } catch (error) {
    console.error('Get coins error:', error);
    return errorResponse(res, 'Failed to get coins', 'GET_COINS_ERROR', 500);
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

    return successResponse(res, {
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
    return errorResponse(res, 'Failed to get works', 'GET_WORKS_ERROR', 500);
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

    return successResponse(res, {
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
    return errorResponse(res, 'Failed to get orders', 'GET_ORDERS_ERROR', 500);
  }
});

export default router;
