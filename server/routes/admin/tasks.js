import { Router } from 'express';
import Task from '../../models/Task.js';
import { generateQueue, getQueueStats } from '../../services/queue.js';

const router = Router();

// 获取任务列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const tasks = await Task.find(query)
      .populate('userId', 'email username')
      .populate('templateId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Task.countDocuments(query);

    // 状态统计
    const statusCounts = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      tasks,
      statusCounts: statusCounts.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// 获取队列状态
router.get('/queue', async (req, res) => {
  try {
    const stats = await getQueueStats();
    res.json({ success: true, queue: stats });
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

// 获取任务详情
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('userId', 'email username')
      .populate('templateId', 'name thumbnail');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Get task detail error:', error);
    res.status(500).json({ error: 'Failed to get task detail' });
  }
});

// 重试失败任务
router.post('/:id/retry', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed tasks can be retried' });
    }

    // 重置状态
    task.status = 'pending';
    task.progress = 0;
    task.error = '';
    await task.save();

    // 重新加入队列
    await generateQueue.add('generate', {
      taskId: task._id.toString(),
      type: task.type,
      input: task.input,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    res.json({ success: true, message: 'Task requeued' });
  } catch (error) {
    console.error('Retry task error:', error);
    res.status(500).json({ error: 'Failed to retry task' });
  }
});

// 取消任务
router.post('/:id/cancel', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!['pending', 'processing'].includes(task.status)) {
      return res.status(400).json({ error: 'Task cannot be cancelled' });
    }

    task.status = 'failed';
    task.error = 'Cancelled by admin';
    await task.save();

    res.json({ success: true, message: 'Task cancelled' });
  } catch (error) {
    console.error('Cancel task error:', error);
    res.status(500).json({ error: 'Failed to cancel task' });
  }
});

// 清理队列
router.post('/queue/clean', async (req, res) => {
  try {
    const { type } = req.body; // completed, failed, delayed

    if (type === 'completed') {
      await generateQueue.clean(0, 'completed');
    } else if (type === 'failed') {
      await generateQueue.clean(0, 'failed');
    } else if (type === 'delayed') {
      await generateQueue.clean(0, 'delayed');
    } else {
      return res.status(400).json({ error: 'Invalid clean type' });
    }

    res.json({ success: true, message: `Cleaned ${type} jobs` });
  } catch (error) {
    console.error('Clean queue error:', error);
    res.status(500).json({ error: 'Failed to clean queue' });
  }
});

export default router;
