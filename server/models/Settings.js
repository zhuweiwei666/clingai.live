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
  // Benchmark parity: exact pricing from /coins page
  coinPackages: [
    { id: 1, coins: 10, price: 5, bonus: 10 },
    { id: 2, coins: 100, price: 10, bonus: 100 },
    { id: 3, coins: 210, price: 20, bonus: 210 },
    { id: 4, coins: 550, price: 50, bonus: 550 },
    { id: 5, coins: 1200, price: 100, bonus: 1200 },
    { id: 6, coins: 2500, price: 200, bonus: 2500 },
  ],
  // Benchmark parity: exact pricing from /subscribe page
  subscriptionPlans: [
    {
      id: 'super',
      name: 'SUPER',
      period: 'Yearly access',
      price: 59.99,
      pricePerWeek: 1.15,
      gradient: true,
    },
    {
      id: 'monthly',
      name: 'MONTHLY ACCESS',
      period: 'just $19.99 per month',
      price: 19.99,
      pricePerDay: 0.60,
      gradient: false,
    },
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
  tools: {
    enabled: true,
    categories: ['photo2video', 'faceswap', 'dressup', 'hd', 'remove', 'aiimage'],
  },
  adConfig: {
    enabled: true,
    interval: 5, // show ad every 5 actions
    type: 'interstitial',
    banners: [],
    interstitials: [],
  },
  change_clothes_tips: [
    'Upload a clear photo for best results',
    'Ensure good lighting',
    'Face should be clearly visible',
  ],
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
