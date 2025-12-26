import { Router } from 'express';
import Template from '../models/Template.js';

const router = Router();

// 获取模板列表
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const query = { enabled: true };
    if (category) query.category = category;

    const templates = await Template.find(query)
      .sort({ sortOrder: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-aiParams');

    const total = await Template.countDocuments(query);

    res.json({
      success: true,
      templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// 获取热门模板
router.get('/trending', async (req, res) => {
  try {
    const templates = await Template.find({ enabled: true, isTrending: true })
      .sort({ usageCount: -1 })
      .limit(20)
      .select('-aiParams');

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to get trending templates' });
  }
});

// 获取新模板
router.get('/new', async (req, res) => {
  try {
    const templates = await Template.find({ enabled: true, isNew: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-aiParams');

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get new templates error:', error);
    res.status(500).json({ error: 'Failed to get new templates' });
  }
});

// 获取分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'photo2video', name: 'Photo to Video', icon: '🎬' },
      { id: 'faceswap', name: 'Face Swap', icon: '🎭' },
      { id: 'dressup', name: 'Dress Up', icon: '👗' },
      { id: 'hd', name: 'HD Upscale', icon: '✨' },
      { id: 'remove', name: 'Remove', icon: '🧹' },
      { id: 'aiimage', name: 'AI Image', icon: '🎨' },
    ];

    // 获取每个分类的模板数量
    const counts = await Template.aggregate([
      { $match: { enabled: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    res.json({
      success: true,
      categories: categories.map(c => ({
        ...c,
        count: countMap[c.id] || 0,
      })),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// 获取单个模板详情
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template || !template.enabled) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

export default router;
