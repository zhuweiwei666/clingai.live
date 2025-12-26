import mongoose from 'mongoose';

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true,
  },
  newUsers: {
    type: Number,
    default: 0,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalTasks: {
    type: Number,
    default: 0,
  },
  tasksByType: {
    photo2video: { type: Number, default: 0 },
    faceswap: { type: Number, default: 0 },
    faceswap_video: { type: Number, default: 0 },
    dressup: { type: Number, default: 0 },
    hd: { type: Number, default: 0 },
    remove: { type: Number, default: 0 },
    aiimage: { type: Number, default: 0 },
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
  failedTasks: {
    type: Number,
    default: 0,
  },
  avgProcessingTime: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// 获取今日日期
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// 增加统计
export async function incrementStats(field, amount = 1, taskType = null) {
  const date = getTodayDate();
  const update = {};
  
  if (field === 'tasksByType' && taskType) {
    update.$inc = { [`tasksByType.${taskType}`]: amount, totalTasks: amount };
  } else {
    update.$inc = { [field]: amount };
  }
  
  return DailyStats.findOneAndUpdate(
    { date },
    update,
    { upsert: true, new: true }
  );
}

const DailyStats = mongoose.model('DailyStats', dailyStatsSchema);

export default DailyStats;
