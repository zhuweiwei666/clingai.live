import { Router } from 'express';
import Template from '../../models/Template.js';

const router = Router();

// 获取模板列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, enabled, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const templates = await Template.find(query)
      .sort({ sortOrder: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

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

// 创建模板
router.post('/', async (req, res) => {
  try {
    const {
      name, category, type, thumbnail, previewVideo,
      costCoins, isSuper, isNew, isHot, isTrending,
      sortOrder, enabled, aiParams,
    } = req.body;

    const template = new Template({
      name, category, type, thumbnail, previewVideo,
      costCoins, isSuper, isNew, isHot, isTrending,
      sortOrder, enabled, aiParams,
    });

    await template.save();

    res.status(201).json({ success: true, template });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// 获取模板详情
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ success: true, template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// 更新模板
router.put('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const allowedFields = [
      'name', 'category', 'type', 'thumbnail', 'previewVideo',
      'costCoins', 'isSuper', 'isNew', 'isHot', 'isTrending',
      'sortOrder', 'enabled', 'aiParams',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });

    await template.save();

    res.json({ success: true, template });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// 删除模板
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// 批量更新模板状态
router.post('/batch', async (req, res) => {
  try {
    const { ids, action, value } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No template IDs provided' });
    }

    const allowedActions = ['enabled', 'isSuper', 'isNew', 'isHot', 'isTrending'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await Template.updateMany(
      { _id: { $in: ids } },
      { $set: { [action]: value } }
    );

    res.json({ success: true, message: `Updated ${ids.length} templates` });
  } catch (error) {
    console.error('Batch update templates error:', error);
    res.status(500).json({ error: 'Failed to batch update templates' });
  }
});

export default router;
