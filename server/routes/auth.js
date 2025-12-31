import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { incrementStats } from '../models/DailyStats.js';
import { verifyToken } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clingai-jwt-secret-2024';

// 生成 JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 'MISSING_FIELDS', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 'INVALID_PASSWORD', 400);
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 'EMAIL_EXISTS', 400);
    }

    // 创建用户
    const user = new User({
      email,
      password,
      username: username || email.split('@')[0],
    });
    await user.save();

    // 统计
    await incrementStats('newUsers');

    const token = generateToken(user);

    return successResponse(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        coins: user.coins,
        plan: user.plan,
      },
    }, 'Registration successful', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed', 'REGISTRATION_ERROR', 500);
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 'MISSING_FIELDS', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    if (user.isBanned) {
      return errorResponse(res, 'Account is banned', 'ACCOUNT_BANNED', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 'INVALID_CREDENTIALS', 401);
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 统计活跃用户
    await incrementStats('activeUsers');

    const token = generateToken(user);

    return successResponse(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        plan: user.plan,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 'LOGIN_ERROR', 500);
  }
});

// Google 登录
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return errorResponse(res, 'Google ID and email are required', 'MISSING_FIELDS', 400);
    }

    // 查找或创建用户
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // 更新 Google ID 和头像
      if (!user.googleId) user.googleId = googleId;
      if (picture) user.avatar = picture;
      user.lastLoginAt = new Date();
      await user.save();
      await incrementStats('activeUsers');
    } else {
      // 创建新用户
      user = new User({
        email,
        googleId,
        username: name || email.split('@')[0],
        avatar: picture || '',
      });
      await user.save();
      await incrementStats('newUsers');
    }

    if (user.isBanned) {
      return errorResponse(res, 'Account is banned', 'ACCOUNT_BANNED', 403);
    }

    const token = generateToken(user);

    return successResponse(res, {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        plan: user.plan,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return errorResponse(res, 'Google login failed', 'GOOGLE_LOGIN_ERROR', 500);
  }
});

// 获取当前用户信息
router.get('/me', verifyToken, async (req, res) => {
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
        isAdmin: user.isAdmin || false,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user information', 'GET_USER_ERROR', 500);
  }
});

export default router;
