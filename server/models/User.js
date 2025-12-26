import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
  },
  username: {
    type: String,
    trim: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  coins: {
    type: Number,
    default: 10, // 新用户赠送10金币
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'unlimited'],
    default: 'free',
  },
  planExpireAt: {
    type: Date,
    default: null,
  },
  stats: {
    totalWorks: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// 密码加密
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 扣除金币
userSchema.methods.deductCoins = async function(amount) {
  if (this.coins < amount) {
    throw new Error('Insufficient coins');
  }
  this.coins -= amount;
  this.stats.totalSpent += amount;
  await this.save();
  return this.coins;
};

// 增加金币
userSchema.methods.addCoins = async function(amount) {
  this.coins += amount;
  await this.save();
  return this.coins;
};

const User = mongoose.model('User', userSchema);

export default User;
