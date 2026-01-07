import { Router } from 'express';
import User from '../models/User.js';
import Work from '../models/Work.js';
import Order from '../models/Order.js';
import { verifyToken } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 获取用户信息 (benchmark: /app/user/info) - 支持未登录访问（返回null）
router.get('/info', async (req, res) => {
  try {
    // Try to get user from token if present
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return successResponse(res, { user: null, plan: 'free', coins: 0 });
    }

    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return successResponse(res, { user: null, plan: 'free', coins: 0 });
      }

      return successResponse(res, {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        },
        plan: user.plan || 'free',
        coins: user.coins || 0,
        planExpireAt: user.planExpireAt,
      });
    } catch (jwtError) {
      // Invalid token, return null user
      return successResponse(res, { user: null, plan: 'free', coins: 0 });
    }
  } catch (error) {
    console.error('Get user info error:', error);
    return errorResponse(res, 'Failed to get user info', 'GET_USER_INFO_ERROR', 500);
  }
});

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

// 支付历史（benchmark: POST /app/user/payment_history）- 支持未登录访问（返回空）
router.post('/payment_history', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    if (!token) {
      return successResponse(res, { orders: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }

    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const { page = 1, limit = 20 } = req.body || {};
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      const total = await Order.countDocuments({ userId });

      return successResponse(res, {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (jwtError) {
      // Invalid token: benchmark behaves like logged-out
      return successResponse(res, { orders: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }
  } catch (error) {
    console.error('Payment history error:', error);
    return errorResponse(res, 'Failed to get payment history', 'GET_PAYMENT_HISTORY_ERROR', 500);
  }
});

// 获取用户反馈 (benchmark: /app/user/feedback)
router.get('/feedback', verifyToken, async (req, res) => {
  try {
    // For now, return empty array. Can be extended to store feedback in DB
    return successResponse(res, { feedback: [] });
  } catch (error) {
    console.error('Get feedback error:', error);
    return errorResponse(res, 'Failed to get feedback', 'GET_FEEDBACK_ERROR', 500);
  }
});

// 提交用户反馈 (benchmark: /app/user/feedback)
router.post('/feedback', verifyToken, async (req, res) => {
  try {
    const { subject, message, content, type } = req.body;
    
    // Support both subject/message format and content/type format
    const feedbackContent = message || content || subject;
    if (!feedbackContent) {
      return errorResponse(res, 'Feedback content is required', 'MISSING_FEEDBACK_CONTENT', 400);
    }

    // Store feedback in user's feedback array
    const user = await User.findById(req.user.id);
    if (user) {
      if (!user.feedback) user.feedback = [];
      user.feedback.push({
        subject: subject || 'Feedback',
        message: feedbackContent,
        type: type || 'general',
        createdAt: new Date(),
      });
      await user.save();
    }

    return successResponse(res, { message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return errorResponse(res, 'Failed to submit feedback', 'SUBMIT_FEEDBACK_ERROR', 500);
  }
});

// 获取用户邮箱 (benchmark: /app/user/email)
router.get('/email', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    return successResponse(res, { email: user.email || '' });
  } catch (error) {
    console.error('Get email error:', error);
    return errorResponse(res, 'Failed to get email', 'GET_EMAIL_ERROR', 500);
  }
});

// 保存用户邮箱 (benchmark: /app/user/save_email)
router.put('/email', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', 'MISSING_EMAIL', 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    user.email = email;
    await user.save();

    return successResponse(res, { message: 'Email saved successfully', email: user.email });
  } catch (error) {
    console.error('Save email error:', error);
    return errorResponse(res, 'Failed to save email', 'SAVE_EMAIL_ERROR', 500);
  }
});

// 删除账户 (benchmark: /app/user/destory)
router.delete('/destroy', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    // Soft delete: mark as deleted instead of actually deleting
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Clear token
    res.clearCookie('token');

    return successResponse(res, { message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return errorResponse(res, 'Failed to delete account', 'DELETE_ACCOUNT_ERROR', 500);
  }
});

export default router;
