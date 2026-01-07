import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  followers: {
    type: Number,
    default: 0,
  },
  works: {
    type: Number,
    default: 0,
  },
  photos: [{
    url: String,
    thumbnail: String,
    createdAt: { type: Date, default: Date.now },
  }],
  enabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
agentSchema.index({ enabled: 1, createdAt: -1 });

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;

