import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);

// 默认配置
export const DEFAULT_SETTINGS = {
  coinPackages: [
    { id: 'pkg_50', coins: 50, price: 4.99, bonus: 0 },
    { id: 'pkg_100', coins: 100, price: 8.99, bonus: 10 },
    { id: 'pkg_200', coins: 200, price: 16.99, bonus: 30 },
    { id: 'pkg_500', coins: 500, price: 39.99, bonus: 100 },
    { id: 'pkg_1000', coins: 1000, price: 69.99, bonus: 300 },
  ],
  subscriptionPlans: [
    { id: 'basic', name: 'Basic', price: 9.99, features: ['100 coins/month', 'Basic support'] },
    { id: 'pro', name: 'Pro', price: 19.99, features: ['300 coins/month', 'Priority support', 'HD quality'] },
    { id: 'unlimited', name: 'Unlimited', price: 49.99, features: ['Unlimited coins', 'VIP support', '4K quality', 'No watermark'] },
  ],
  featureCosts: {
    photo2video: 5,
    faceswap: 3,
    faceswap_video: 8,
    dressup: 3,
    hd: 2,
    remove: 2,
    aiimage: 3,
  },
  maintenance: false,
  announcement: '',
};

// 获取设置
export async function getSetting(key) {
  const setting = await Settings.findOne({ key });
  return setting ? setting.value : DEFAULT_SETTINGS[key];
}

// 设置
export async function setSetting(key, value) {
  return Settings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );
}

// 获取所有设置
export async function getAllSettings() {
  const settings = await Settings.find({});
  const result = { ...DEFAULT_SETTINGS };
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  return result;
}

export default Settings;
