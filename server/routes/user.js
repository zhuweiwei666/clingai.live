import express from 'express';
import { users, works } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    coins: user.coins,
    subscription: user.subscription,
    createdAt: user.createdAt
  });
});

// Update user profile
router.put('/profile', verifyToken, (req, res) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { username, avatar } = req.body;
  
  if (username) user.username = username;
  if (avatar) user.avatar = avatar;
  
  users.set(user.id, user);

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    coins: user.coins,
    subscription: user.subscription
  });
});

// Get user's works (generated videos/images)
router.get('/works', verifyToken, (req, res) => {
  const userWorks = Array.from(works.values())
    .filter(w => w.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userWorks);
});

// Get user's coin balance
router.get('/coins', verifyToken, (req, res) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ coins: user.coins });
});

// Add coins (for testing/development)
router.post('/coins/add', verifyToken, (req, res) => {
  const user = users.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { amount } = req.body;
  user.coins += amount || 100;
  users.set(user.id, user);

  res.json({ coins: user.coins });
});

export default router;
