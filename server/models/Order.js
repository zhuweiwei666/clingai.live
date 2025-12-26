import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD${Date.now()}${uuidv4().slice(0, 8).toUpperCase()}`,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['coins', 'subscription'],
  },
  // 金币套餐
  packageId: {
    type: String,
    default: '',
  },
  coins: {
    type: Number,
    default: 0,
  },
  bonusCoins: {
    type: Number,
    default: 0,
  },
  // 订阅
  plan: {
    type: String,
    enum: ['basic', 'pro', 'unlimited', ''],
    default: '',
  },
  planDuration: {
    type: Number, // 月数
    default: 0,
  },
  // 金额
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  // 支付信息
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'apple', 'google', ''],
    default: '',
  },
  paymentId: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  paidAt: {
    type: Date,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// 索引
orderSchema.index({ userId: 1, status: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ paymentId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
