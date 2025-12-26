import express from 'express';
import { templates } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all templates
router.get('/', optionalAuth, (req, res) => {
  const { category, tag, limit = 20, offset = 0 } = req.query;
  
  let result = Array.from(templates.values());
  
  // Filter by category
  if (category) {
    result = result.filter(t => t.category === category);
  }
  
  // Filter by tag
  if (tag) {
    result = result.filter(t => t.tags.includes(tag));
  }
  
  // Sort by views (popularity)
  result.sort((a, b) => b.views - a.views);
  
  // Paginate
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    templates: result,
    total,
    hasMore: Number(offset) + result.length < total
  });
});

// Get templates by category
router.get('/category/:category', optionalAuth, (req, res) => {
  const { category } = req.params;
  const { limit = 20, offset = 0 } = req.query;
  
  let result = Array.from(templates.values())
    .filter(t => t.category === category)
    .sort((a, b) => b.views - a.views);
  
  const total = result.length;
  result = result.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    templates: result,
    total,
    category
  });
});

// Get trending templates
router.get('/trending', optionalAuth, (req, res) => {
  const { limit = 10 } = req.query;
  
  const result = Array.from(templates.values())
    .filter(t => t.tags.includes('super') || t.tags.includes('hot') || t.tags.includes('viral'))
    .sort((a, b) => b.views - a.views)
    .slice(0, Number(limit));

  res.json({ templates: result });
});

// Get new templates
router.get('/new', optionalAuth, (req, res) => {
  const { limit = 10 } = req.query;
  
  const result = Array.from(templates.values())
    .filter(t => t.tags.includes('new'))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, Number(limit));

  res.json({ templates: result });
});

// Get single template
router.get('/:id', optionalAuth, (req, res) => {
  const template = templates.get(req.params.id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  // Increment views
  template.views++;
  templates.set(template.id, template);

  res.json(template);
});

// Get categories list
router.get('/meta/categories', (req, res) => {
  res.json({
    categories: [
      { id: 'photo_to_video', name: 'Photo to Video', icon: '🎬' },
      { id: 'face_swap', name: 'Face Swap', icon: '🔄' },
      { id: 'ai_image', name: 'AI Image', icon: '🎨' },
      { id: 'dress_up', name: 'Dress Up', icon: '👗' },
      { id: 'hd', name: 'HD Upscale', icon: '✨' },
      { id: 'remove', name: 'Remove', icon: '🧹' }
    ]
  });
});

export default router;
