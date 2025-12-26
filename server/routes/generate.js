import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Template from '../models/Template.js';
import { getSetting } from '../models/Settings.js';
import { incrementStats } from '../models/DailyStats.js';
import { generateQueue } from '../services/queue.js';

const router = Router();

// 通用生成函数
async function createGenerateTask(req, res, type) {
  try {
    const { templateId, sourceImage, targetImage, prompt, params } = req.body;

    // 获取用户
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 获取费用配置
    const featureCosts = await getSetting('featureCosts');
    const cost = featureCosts[type] || 5;

    // 检查金币
    if (user.coins < cost) {
      return res.status(400).json({
        error: 'Insufficient coins',
        required: cost,
        current: user.coins,
      });
    }

    // 获取模板（如果有）
    let template = null;
    if (templateId) {
      template = await Template.findById(templateId);
    }

    // 扣除金币
    await user.deductCoins(cost);

    // 创建任务
    const task = new Task({
      userId: user._id,
      templateId: template?._id,
      type,
      status: 'pending',
      costCoins: cost,
      input: {
        sourceImage,
        targetImage,
        prompt,
        params: { ...params, templateParams: template?.aiParams },
      },
    });
    await task.save();

    // 统计
    await incrementStats('tasksByType', 1, type);

    // 更新模板使用次数
    if (template) {
      template.usageCount += 1;
      await template.save();
    }

    // 添加到队列
    await generateQueue.add('generate', {
      taskId: task._id.toString(),
      type,
      input: task.input,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    res.json({
      success: true,
      taskId: task._id,
      status: 'pending',
      coins: user.coins,
    });
  } catch (error) {
    console.error(`Generate ${type} error:`, error);
    res.status(500).json({ error: 'Generation failed' });
  }
}

// 图生视频
router.post('/photo2video', verifyToken, (req, res) => createGenerateTask(req, res, 'photo2video'));

// 换脸（图片）
router.post('/faceswap', verifyToken, (req, res) => createGenerateTask(req, res, 'faceswap'));

// 换脸（视频）
router.post('/faceswap-video', verifyToken, (req, res) => createGenerateTask(req, res, 'faceswap_video'));

// 换装
router.post('/dressup', verifyToken, (req, res) => createGenerateTask(req, res, 'dressup'));

// 高清放大
router.post('/hd', verifyToken, (req, res) => createGenerateTask(req, res, 'hd'));

// 去背景/水印
router.post('/remove', verifyToken, (req, res) => createGenerateTask(req, res, 'remove'));

// AI图像生成
router.post('/aiimage', verifyToken, (req, res) => createGenerateTask(req, res, 'aiimage'));

// 查询任务状态
router.get('/task/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
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
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// 获取任务历史
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    const query = { userId: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('templateId', 'name thumbnail');

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
