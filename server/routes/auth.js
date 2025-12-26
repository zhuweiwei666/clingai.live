import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { incrementStats } from '../models/DailyStats.js';

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
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
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

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        coins: user.coins,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 统计活跃用户
    await incrementStats('activeUsers');

    const token = generateToken(user);

    res.json({
      success: true,
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
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google 登录
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required' });
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
      return res.status(403).json({ error: 'Account is banned' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
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
    res.status(500).json({ error: 'Google login failed' });
  }
});

export default router;
