import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import Work from '../models/Work.js';
import { successResponse, errorResponse } from '../utils/response.js';

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

    return successResponse(res, {
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
    return errorResponse(res, 'Failed to get works', 'GET_WORKS_ERROR', 500);
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
      return errorResponse(res, 'Work not found', 'WORK_NOT_FOUND', 404);
    }

    work.isFavorite = !work.isFavorite;
    await work.save();

    return successResponse(res, { isFavorite: work.isFavorite });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return errorResponse(res, 'Failed to toggle favorite', 'TOGGLE_FAVORITE_ERROR', 500);
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
      return errorResponse(res, 'Work not found', 'WORK_NOT_FOUND', 404);
    }

    work.isDeleted = true;
    await work.save();

    return successResponse(res, { message: 'Work deleted' });
  } catch (error) {
    console.error('Delete work error:', error);
    return errorResponse(res, 'Failed to delete work', 'DELETE_WORK_ERROR', 500);
  }
});

export default router;
