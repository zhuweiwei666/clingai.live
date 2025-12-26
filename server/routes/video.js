import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { users, videos, works } from '../config/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate video from image (Photo to Video)
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { imageUrl, templateId, prompt } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check coins
    const cost = 10; // Cost per generation
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    // Deduct coins
    user.coins -= cost;
    users.set(user.id, user);

    // Create video task (in production, this would call AI API)
    const video = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: 'photo_to_video',
      inputImage: imageUrl,
      templateId,
      prompt,
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    videos.set(video.id, video);

    // Simulate processing (in production, call actual AI API)
    simulateVideoGeneration(video.id);

    res.json({
      taskId: video.id,
      status: 'processing',
      message: 'Video generation started',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: 'Video generation failed' });
  }
});

// Face swap video
router.post('/face-swap', verifyToken, async (req, res) => {
  try {
    const { sourceImage, targetVideoUrl } = req.body;
    const user = users.get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cost = 15;
    if (user.coins < cost) {
      return res.status(402).json({ error: 'Insufficient coins', required: cost, current: user.coins });
    }

    user.coins -= cost;
    users.set(user.id, user);

    const video = {
      id: uuidv4(),
      userId: req.user.id,
      status: 'processing',
      type: 'face_swap_video',
      sourceImage,
      targetVideoUrl,
      outputUrl: null,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    videos.set(video.id, video);
    simulateVideoGeneration(video.id);

    res.json({
      taskId: video.id,
      status: 'processing',
      coinsRemaining: user.coins
    });
  } catch (error) {
    console.error('Face swap error:', error);
    res.status(500).json({ error: 'Face swap failed' });
  }
});

// Get video status
router.get('/status/:taskId', verifyToken, (req, res) => {
  const video = videos.get(req.params.taskId);
  
  if (!video) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (video.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({
    taskId: video.id,
    status: video.status,
    progress: video.progress,
    outputUrl: video.outputUrl,
    type: video.type
  });
});

// Get user's video history
router.get('/history', verifyToken, (req, res) => {
  const userVideos = Array.from(videos.values())
    .filter(v => v.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(userVideos);
});

// Simulate video generation (for development)
function simulateVideoGeneration(videoId) {
  const video = videos.get(videoId);
  if (!video) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    video.progress = progress;
    
    if (progress >= 100) {
      video.status = 'completed';
      video.outputUrl = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4';
      video.completedAt = new Date().toISOString();
      
      // Add to works
      works.set(video.id, {
        id: video.id,
        userId: video.userId,
        type: video.type,
        thumbnailUrl: video.inputImage,
        outputUrl: video.outputUrl,
        createdAt: video.createdAt
      });
      
      clearInterval(interval);
    }
    
    videos.set(videoId, video);
  }, 2000);
}

export default router;
