import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, images, works } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate AI image
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = 5;
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    user.coins -= cost;
    users.set(user.id, user);

    const image = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: 'ai_generate',
      prompt,
      style,
      aspectRatio: aspectRatio || '1:1',
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    images.set(image.id, image);
    simulateImageGeneration(image.id);

    res.json({
      taskId: image.id,
      status: 'processing',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

// Face swap image
router.post('/face-swap', verifyToken, async (req, res) => {
  try {
    const { sourceImage, targetImage } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = 8;
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    user.coins -= cost;
    users.set(user.id, user);

    const image = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: 'face_swap',
      sourceImage,
      targetImage,
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    images.set(image.id, image);
    simulateImageGeneration(image.id);

    res.json({
      taskId: image.id,
      status: 'processing',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('Face swap error:', error);
    res.status(500).json({ error: 'Face swap failed' });
  }
});

// Dress up (change clothes)
router.post('/dress-up', verifyToken, async (req, res) => {
  try {
    const { personImage, clothingStyle } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = 8;
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    user.coins -= cost;
    users.set(user.id, user);

    const image = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: 'dress_up',
      personImage,
      clothingStyle,
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    images.set(image.id, image);
    simulateImageGeneration(image.id);

    res.json({
      taskId: image.id,
      status: 'processing',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('Dress up error:', error);
    res.status(500).json({ error: 'Dress up failed' });
  }
});

// HD upscale
router.post('/hd-upscale', verifyToken, async (req, res) => {
  try {
    const { imageUrl, scale } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = 3;
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    user.coins -= cost;
    users.set(user.id, user);

    const image = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: 'hd_upscale',
      inputImage: imageUrl,
      scale: scale || 2,
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    images.set(image.id, image);
    simulateImageGeneration(image.id);

    res.json({
      taskId: image.id,
      status: 'processing',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('HD upscale error:', error);
    res.status(500).json({ error: 'HD upscale failed' });
  }
});

// Remove watermark/background
router.post('/remove', verifyToken, async (req, res) => {
  try {
    const { imageUrl, removeType } = req.body; // removeType: 'watermark' or 'background'
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = 5;
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    user.coins -= cost;
    users.set(user.id, user);

    const image = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: `remove_${removeType}`,
      inputImage: imageUrl,
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    images.set(image.id, image);
    simulateImageGeneration(image.id);

    res.json({
      taskId: image.id,
      status: 'processing',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({ error: 'Remove failed' });
  }
});

// Get image status
router.get('/status/:taskId', verifyToken, (req, res) => {
  const image = images.get(req.params.taskId);
  
  if (!image) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (image.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({
    taskId: image.id,
    status: image.status,
    progress: image.progress,
    outputUrl: image.outputUrl,
    type: image.type
  });
});

// Get user's image history
router.get('/history', verifyToken, (req, res) => {
  const userImages = Array.from(images.values())
    .filter(i => i.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userImages);
});

// Simulate image generation
function simulateImageGeneration(imageId) {
  const image = images.get(imageId);
  if (!image) return;

  setTimeout(() => {
    image.status = 'completed';
    image.progress = 100;
    image.outputUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';
    image.completedAt = new Date().toISOString();
    
    works.set(image.id, {
      id: image.id,
      userId: image.userId,
      type: image.type,
      thumbnailUrl: image.outputUrl,
      outputUrl: image.outputUrl,
      createdAt: image.createdAt
    });
    
    images.set(imageId, image);
  }, 3000);
}

export default router;
