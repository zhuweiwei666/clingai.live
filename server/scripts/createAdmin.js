/**
 * Create Admin User Script
 * Run: node server/scripts/createAdmin.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clingai';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  username: String,
  googleId: String,
  avatar: String,
  coins: { type: Number, default: 1000 },
  plan: { type: String, default: 'free' },
  planExpireAt: Date,
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  lastLoginAt: Date,
  stats: {
    totalWorks: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@clingai.live';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.password = hashedPassword;
      existing.isAdmin = true;
      existing.coins = 9999;
      existing.plan = 'unlimited';
      await existing.save();
      console.log('✅ Admin user updated');
    } else {
      await User.create({
        email,
        password: hashedPassword,
        username: 'Admin',
        isAdmin: true,
        coins: 9999,
        plan: 'unlimited',
      });
      console.log('✅ Admin user created');
    }

    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
