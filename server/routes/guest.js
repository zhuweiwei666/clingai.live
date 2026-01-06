import { Router } from 'express';
import Task from '../models/Task.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 绑定游客账户 (benchmark: /app/guest/bind)
router.post('/bind', async (req, res) => {
  try {
    const { guestId, userId } = req.body;
    
    if (!guestId || !userId) {
      return errorResponse(res, 'Guest ID and User ID are required', 'MISSING_IDS', 400);
    }

    // Transfer guest tasks to user account
    const result = await Task.updateMany(
      { userId: guestId, isGuest: true },
      { $set: { userId: userId, isGuest: false } }
    );

    return successResponse(res, {
      message: 'Guest account bound successfully',
      tasksTransferred: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bind guest error:', error);
    return errorResponse(res, 'Failed to bind guest account', 'BIND_GUEST_ERROR', 500);
  }
});

// 获取游客任务状态 (benchmark: /app/guest/get_task)
router.get('/task/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      isGuest: true,
    });

    if (!task) {
      return errorResponse(res, 'Task not found', 'TASK_NOT_FOUND', 404);
    }

    return successResponse(res, {
      task: {
        id: task._id,
        type: task.type,
        status: task.status,
        progress: task.progress,
        output: task.output,
        error: task.error,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error('Get guest task error:', error);
    return errorResponse(res, 'Failed to get guest task', 'GET_GUEST_TASK_ERROR', 500);
  }
});

export default router;

