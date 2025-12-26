/**
 * Generate Worker - 处理 AI 生成任务
 */

import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database.js';
import { generateQueue } from '../services/queue.js';
import Task from '../models/Task.js';
import Work from '../models/Work.js';
import User from '../models/User.js';
import { incrementStats } from '../models/DailyStats.js';
import aiService from '../services/aiService.js';

// 处理任务
async function processJob(job) {
  const { taskId, type, input } = job.data;
  const startTime = Date.now();

  console.log(`[Worker] Processing job ${job.id}, task: ${taskId}, type: ${type}`);

  // 获取任务
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  try {
    // 更新状态为处理中
    task.status = 'processing';
    task.progress = 10;
    await task.save();

    // 根据类型调用不同的 AI 服务
    let result;
    switch (type) {
      case 'photo2video':
        result = await aiService.photo2video(input.sourceImage, input.params);
        break;
      case 'faceswap':
        result = await aiService.faceSwapImage(input.sourceImage, input.targetImage, input.params);
        break;
      case 'faceswap_video':
        result = await aiService.faceSwapVideo(input.sourceImage, input.targetImage, input.params);
        break;
      case 'dressup':
        result = await aiService.dressUp(input.sourceImage, input.targetImage, input.params);
        break;
      case 'hd':
        result = await aiService.hdUpscale(input.sourceImage, input.params?.scale);
        break;
      case 'remove':
        result = await aiService.removeBackground(input.sourceImage);
        break;
      case 'aiimage':
        result = await aiService.generateImage(input.prompt, input.params);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    // 保存外部任务 ID
    task.externalTaskId = result.taskId;
    task.progress = 30;
    await task.save();

    // 轮询等待结果
    let attempts = 0;
    const maxAttempts = 60; // 最多等待 5 分钟
    let completed = false;
    let finalResult = null;

    while (attempts < maxAttempts && !completed) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待 5 秒
      
      const status = await aiService.checkTaskStatus(result.taskId);
      task.progress = Math.min(30 + attempts * 2, 90);
      await task.save();

      if (status.status === 'completed') {
        completed = true;
        finalResult = status;
      } else if (status.status === 'failed') {
        throw new Error(status.error || 'AI generation failed');
      }

      attempts++;
    }

    if (!completed) {
      throw new Error('Task timeout');
    }

    // 更新任务完成
    const processingTime = Date.now() - startTime;
    task.status = 'completed';
    task.progress = 100;
    task.output = {
      resultUrl: finalResult.resultUrl,
      thumbnailUrl: finalResult.thumbnailUrl || finalResult.resultUrl,
    };
    task.processingTime = processingTime;
    task.completedAt = new Date();
    await task.save();

    // 创建作品记录
    const work = new Work({
      userId: task.userId,
      taskId: task._id,
      type: task.type,
      resultUrl: task.output.resultUrl,
      thumbnailUrl: task.output.thumbnailUrl,
    });
    await work.save();

    // 更新用户统计
    await User.findByIdAndUpdate(task.userId, {
      $inc: { 'stats.totalWorks': 1 },
    });

    // 统计
    await incrementStats('completedTasks');

    console.log(`[Worker] Job ${job.id} completed in ${processingTime}ms`);

    return { success: true, resultUrl: task.output.resultUrl };

  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error.message);

    // 更新任务失败状态
    task.status = 'failed';
    task.error = error.message;
    task.processingTime = Date.now() - startTime;
    await task.save();

    // 退还金币
    await User.findByIdAndUpdate(task.userId, {
      $inc: { coins: task.costCoins },
    });

    // 统计
    await incrementStats('failedTasks');

    throw error;
  }
}

// 启动 Worker
async function start() {
  try {
    console.log('[Worker] Starting generate worker...');
    
    // 连接数据库
    await connectDB();
    
    // 处理队列任务
    generateQueue.process('generate', 3, processJob); // 最多同时处理 3 个任务

    console.log('[Worker] Generate worker is running!');
    console.log('[Worker] Waiting for jobs...');

  } catch (error) {
    console.error('[Worker] Failed to start:', error);
    process.exit(1);
  }
}

start();
