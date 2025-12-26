import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import Work from '../models/Work.js';

const router = Router();

// 获取作品列表
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, favorite } = req.query;

    const query = { userId: req.user.id, isDeleted: false };
    if (type) query.type = type;
    if (favorite === 'true') query.isFavorite = true;

    const works = await Work.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Work.countDocuments(query);

    res.json({
      success: true,
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
    res.status(500).json({ error: 'Failed to get works' });
  }
});

// 收藏/取消收藏
router.put('/:id/favorite', verifyToken, async (req, res) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }

    work.isFavorite = !work.isFavorite;
    await work.save();

    res.json({ success: true, isFavorite: work.isFavorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// 删除作品（软删除）
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const work = await Work.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }

    work.isDeleted = true;
    await work.save();

    res.json({ success: true, message: 'Work deleted' });
  } catch (error) {
    console.error('Delete work error:', error);
    res.status(500).json({ error: 'Failed to delete work' });
  }
});

export default router;
