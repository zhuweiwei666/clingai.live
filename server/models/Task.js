import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null,
  },
  type: {
    type: String,
    required: true,
    enum: ['photo2video', 'faceswap', 'faceswap_video', 'dressup', 'hd', 'remove', 'aiimage'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  input: {
    sourceImage: String,
    targetImage: String,
    prompt: String,
    params: mongoose.Schema.Types.Mixed,
  },
  output: {
    resultUrl: String,
    thumbnailUrl: String,
  },
  costCoins: {
    type: Number,
    default: 0,
  },
  processingTime: {
    type: Number, // 毫秒
    default: 0,
  },
  // 第三方 API 任务 ID
  externalTaskId: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// 索引
taskSchema.index({ userId: 1, status: 1, createdAt: -1 });
taskSchema.index({ status: 1, createdAt: 1 });
taskSchema.index({ externalTaskId: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
