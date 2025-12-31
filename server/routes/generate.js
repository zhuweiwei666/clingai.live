import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Template from '../models/Template.js';
import { getSetting, DEFAULT_SETTINGS } from '../models/Settings.js';
import { incrementStats } from '../models/DailyStats.js';
import { generateQueue } from '../services/queue.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

// 通用生成函数
async function createGenerateTask(req, res, type) {
  try {
    console.log(`[Generate] Creating ${type} task`);
    console.log(`[Generate] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[Generate] User ID:`, req.user?.id);
    
    const { templateId, sourceImage, targetImage, prompt, params } = req.body;

    // 验证必需参数
    if (!sourceImage && type !== 'aiimage') {
      console.error(`[Generate] Missing sourceImage for type ${type}`);
      return errorResponse(res, 'Source image is required', 'MISSING_IMAGE', 400);
    }

    // 获取用户
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error(`[Generate] User not found: ${req.user.id}`);
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }
    console.log(`[Generate] User found: ${user.email}, coins: ${user.coins}`);

    // 获取费用配置
    let featureCosts;
    try {
      featureCosts = await getSetting('featureCosts');
      console.log(`[Generate] Feature costs loaded:`, featureCosts);
    } catch (error) {
      console.error('[Generate] Failed to get featureCosts setting:', error);
      featureCosts = DEFAULT_SETTINGS.featureCosts;
      console.log(`[Generate] Using default feature costs:`, featureCosts);
    }
    const cost = (featureCosts && featureCosts[type]) || 5;
    console.log(`[Generate] Cost for ${type}: ${cost}`);

    // 检查金币
    if (user.coins < cost) {
      return errorResponse(res, 'Insufficient coins', 'INSUFFICIENT_COINS', 400);
    }

    // 获取模板（如果有）
    let template = null;
    if (templateId) {
      try {
        // 尝试将templateId转换为ObjectId
        const mongoose = (await import('mongoose')).default;
        let templateIdObj = templateId;
        
        // 如果templateId是字符串，尝试转换为ObjectId
        if (typeof templateId === 'string' && mongoose.Types.ObjectId.isValid(templateId)) {
          templateIdObj = new mongoose.Types.ObjectId(templateId);
        }
        
        template = await Template.findById(templateIdObj);
        console.log(`[Generate] Template lookup: id=${templateId}, found=${!!template}`);
      } catch (templateError) {
        console.error('[Generate] Template lookup error:', templateError);
        // 模板查找失败不影响主流程，继续执行
        template = null;
      }
    }

    // 扣除金币
    try {
      await user.deductCoins(cost);
    } catch (error) {
      console.error('Failed to deduct coins:', error);
      throw new Error(`Failed to deduct coins: ${error.message}`);
    }

    // 创建任务
    console.log(`[Generate] Creating task with input:`, {
      sourceImage: sourceImage?.substring(0, 50) + '...',
      hasTargetImage: !!targetImage,
      hasPrompt: !!prompt,
      hasTemplate: !!template,
    });
    
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
    
    try {
      await task.save();
      console.log(`[Generate] Task created: ${task._id}`);
    } catch (saveError) {
      console.error('[Generate] Failed to save task:', saveError);
      throw new Error(`Failed to create task: ${saveError.message}`);
    }

    // 统计
    try {
      await incrementStats('tasksByType', 1, type);
      console.log(`[Generate] Stats updated for ${type}`);
    } catch (statsError) {
      console.error('[Generate] Failed to update stats:', statsError);
      // 统计失败不影响主流程，继续执行
    }

    // 更新模板使用次数
    if (template) {
      try {
        template.usageCount = (template.usageCount || 0) + 1;
        await template.save();
        console.log(`[Generate] Template usage count updated: ${template.usageCount}`);
      } catch (templateError) {
        console.error('[Generate] Failed to update template usage:', templateError);
        // 模板更新失败不影响主流程，继续执行
      }
    }

    // 添加到队列
    try {
      console.log(`[Generate] Adding task to queue: ${task._id}`);
      console.log(`[Generate] Queue connection state:`, generateQueue.client?.status || 'unknown');
      
      const job = await generateQueue.add('generate', {
        taskId: task._id.toString(),
        type,
        input: task.input,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });
      
      console.log(`[Generate] Job added to queue: ${job.id}`);
    } catch (queueError) {
      console.error('[Generate] Failed to add task to queue:', queueError);
      console.error('[Generate] Queue error name:', queueError.name);
      console.error('[Generate] Queue error message:', queueError.message);
      console.error('[Generate] Queue error stack:', queueError.stack);
      
      // 检查是否是Redis连接错误
      if (queueError.message && (queueError.message.includes('ECONNREFUSED') || queueError.message.includes('Redis'))) {
        console.error('[Generate] Redis connection failed - task will be created but may not be processed');
        // Redis连接失败时，仍然返回成功，但任务可能无法处理
        // 或者可以选择抛出错误
        // 这里我们选择继续，让任务创建成功，但记录警告
      } else {
        // 其他队列错误，更新任务状态为失败
        try {
          task.status = 'failed';
          task.error = `Queue error: ${queueError.message}`;
          await task.save();
        } catch (saveError) {
          console.error('[Generate] Failed to update task status:', saveError);
        }
        throw new Error(`Failed to add task to queue: ${queueError.message}`);
      }
    }

    console.log(`[Generate] Task ${task._id} created successfully`);
    return successResponse(res, {
      taskId: task._id,
      status: 'pending',
      coins: user.coins,
    });
  } catch (error) {
    console.error(`Generate ${type} error:`, error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.id);
    
    // 返回更详细的错误信息（开发环境）
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Generation failed: ${error.message}` 
      : 'Generation failed';
    
    return errorResponse(res, errorMessage, 'GENERATION_ERROR', 500);
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
      return errorResponse(res, 'Task not found', 'TASK_NOT_FOUND', 404);
    }

    // 如果任务还在处理中且有 externalTaskId，尝试从 A2E API 获取最新状态
    if (task.status === 'processing' && task.externalTaskId) {
      try {
        const { default: aiService } = await import('../services/aiService.js');
        const taskTypeMap = {
          'photo2video': 'image-to-video',
          'faceswap': 'face-swap',
          'faceswap_video': 'face-swap',
          'dressup': 'virtual-try-on',
          'aiimage': 'text-to-image',
          'remove': 'caption-removal',
          'hd': 'video-to-video',
        };
        const a2eTaskType = taskTypeMap[task.type] || 'image-to-video';
        
        console.log(`[Generate] Fetching latest status from A2E for task ${task._id}, externalTaskId: ${task.externalTaskId}`);
        const a2eStatus = await aiService.checkTaskStatus(task.externalTaskId, a2eTaskType);
        
        // 更新任务状态
        if (a2eStatus.status === 'completed' && a2eStatus.resultUrl) {
          task.status = 'completed';
          task.progress = 100;
          task.output = {
            resultUrl: a2eStatus.resultUrl,
            thumbnailUrl: a2eStatus.thumbnailUrl || a2eStatus.resultUrl,
          };
          task.completedAt = new Date();
          await task.save();
        } else if (a2eStatus.status === 'failed') {
          task.status = 'failed';
          task.error = a2eStatus.error || 'A2E API returned failed status';
          await task.save();
        } else if (a2eStatus.progress) {
          task.progress = Math.max(task.progress, a2eStatus.progress);
          await task.save();
        }
      } catch (a2eError) {
        console.error(`[Generate] Failed to fetch A2E status:`, a2eError);
        // 不抛出错误，继续返回数据库中的状态
      }
    }

    return successResponse(res, {
      task: {
        id: task._id,
        type: task.type,
        status: task.status,
        progress: task.progress,
        output: task.output,
        error: task.error,
        externalTaskId: task.externalTaskId, // 返回外部任务ID用于调试
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error('[Generate] Get task error:', error);
    return errorResponse(res, 'Failed to get task', 'GET_TASK_ERROR', 500);
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

    return successResponse(res, {
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
    return errorResponse(res, 'Failed to get history', 'GET_HISTORY_ERROR', 500);
  }
});

export default router;
