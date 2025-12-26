import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['photo2video', 'faceswap', 'faceswap_video', 'dressup', 'hd', 'remove', 'aiimage'],
  },
  resultUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// 索引
workSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
workSchema.index({ userId: 1, isFavorite: 1 });

const Work = mongoose.model('Work', workSchema);

export default Work;
