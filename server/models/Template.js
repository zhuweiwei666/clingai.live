import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['photo2video', 'faceswap', 'dressup', 'hd', 'remove', 'aiimage'],
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'video',
  },
  thumbnail: {
    type: String,
    required: true,
  },
  previewVideo: {
    type: String,
    default: '',
  },
  costCoins: {
    type: Number,
    default: 5,
  },
  // 标签
  isSuper: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  isHot: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  // 排序和状态
  sortOrder: {
    type: Number,
    default: 0,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  // AI生成参数
  aiParams: {
    prompt: String,
    negativePrompt: String,
    motion: String,
    duration: Number,
  },
  // 统计
  usageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// 索引
templateSchema.index({ category: 1, enabled: 1, sortOrder: -1 });
templateSchema.index({ isTrending: 1, enabled: 1 });
templateSchema.index({ isNew: 1, enabled: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
