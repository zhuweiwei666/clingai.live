import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { users } from '../config/database.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      email,
      username: username || email.split('@')[0],
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      coins: 100, // Free starter coins
      subscription: null,
      createdAt: new Date().toISOString()
    };

    users.set(user.id, user);

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential, clientId } = req.body;

    // Decode the Google JWT token (in production, verify with Google API)
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
    
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = Array.from(users.values()).find(u => u.email === email);

    if (!user) {
      user = {
        id: uuidv4(),
        email,
        username: name || email.split('@')[0],
        password: null, // No password for OAuth users
        avatar: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        googleId,
        coins: 100,
        subscription: null,
        createdAt: new Date().toISOString()
      };
      users.set(user.id, user);
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coins: user.coins,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
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
    subscription: user.subscription
  });
});

export default router;
