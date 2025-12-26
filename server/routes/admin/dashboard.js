import { Router } from 'express';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Task from '../../models/Task.js';
import DailyStats from '../../models/DailyStats.js';
import { getQueueStats } from '../../services/queue.js';

const router = Router();

// 获取今日日期
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// 获取日期范围
function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

// Dashboard 概览
router.get('/overview', async (req, res) => {
  try {
    const today = getTodayDate();
    const { start: weekStart } = getDateRange(7);
    const { start: monthStart } = getDateRange(30);

    // 今日统计
    const todayStats = await DailyStats.findOne({ date: today }) || {
      newUsers: 0,
      activeUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalTasks: 0,
    };

    // 总用户数
    const totalUsers = await User.countDocuments();
    
    // 总订单金额
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 本周/本月新用户
    const weeklyNewUsers = await User.countDocuments({
      createdAt: { $gte: weekStart },
    });
    const monthlyNewUsers = await User.countDocuments({
      createdAt: { $gte: monthStart },
    });

    // 本周/本月收入
    const weeklyRevenue = await Order.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // 任务统计
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const processingTasks = await Task.countDocuments({ status: 'processing' });
    
    // 队列状态
    const queueStats = await getQueueStats();

    res.json({
      success: true,
      data: {
        today: {
          newUsers: todayStats.newUsers,
          activeUsers: todayStats.activeUsers,
          orders: todayStats.totalOrders,
          revenue: todayStats.totalRevenue,
          tasks: todayStats.totalTasks,
        },
        total: {
          users: totalUsers,
          revenue: totalRevenue[0]?.total || 0,
        },
        weekly: {
          newUsers: weeklyNewUsers,
          revenue: weeklyRevenue[0]?.total || 0,
        },
        monthly: {
          newUsers: monthlyNewUsers,
          revenue: monthlyRevenue[0]?.total || 0,
        },
        tasks: {
          pending: pendingTasks,
          processing: processingTasks,
        },
        queue: queueStats,
      },
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// 获取统计趋势
router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const { start } = getDateRange(Number(days));
    const startDate = start.toISOString().split('T')[0];

    const stats = await DailyStats.find({
      date: { $gte: startDate },
    }).sort({ date: 1 });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

// 功能使用统计
router.get('/usage', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const { start } = getDateRange(Number(days));

    const usage = await Task.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, usage });
  } catch (error) {
    console.error('Dashboard usage error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

export default router;
