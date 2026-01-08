import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Template from '../models/Template.js';
import { getSetting, setSetting } from '../models/Settings.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clingai';

// 使用本地静态资源
const sampleImages = [
  '/images/face-swap/face-1.jpg',
  '/images/face-swap/face-2.jpg',
  '/images/face-swap/face-3.jpg',
  '/images/face-swap/face-4.jpg',
  '/images/face-swap/face-5.jpg',
  '/images/face-swap/face-6.jpg',
  '/images/face-swap/face-7.jpg',
  '/images/face-swap/face-8.jpg',
];

const sampleVideos = [
  '/videos/trending/video-1.mp4',
  '/videos/trending/video-2.mp4',
  '/videos/trending/video-3.mp4',
  '/videos/trending/video-4.mp4',
  '/videos/all/video-1.mp4',
  '/videos/all/video-2.mp4',
  '/videos/all/video-3.mp4',
  '/videos/all/video-4.mp4',
  '/videos/all/video-5.mp4',
  '/videos/video-faceswap/video-1.mp4',
  '/videos/video-faceswap/video-2.mp4',
  '/videos/video-faceswap/video-3.mp4',
  '/videos/video-faceswap/video-4.mp4',
];

// Sample data generators
const categories = ['photo2video', 'faceswap', 'dressup', 'hd', 'remove', 'aiimage'];
const tags = ['new', 'hot', 'trending', 'viral', 'cosplay', 'closeup', 'charm'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSubset(arr, count) {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const generateTemplates = (count) => {
  const templates = [];
  for (let i = 0; i < count; i++) {
    const isVideo = Math.random() > 0.3;
    const category = getRandom(categories);
    
    templates.push({
      name: `Template ${i + 1} - ${category}`,
      category: category,
      type: isVideo ? 'video' : 'image',
      thumbnail: getRandom(sampleImages),
      previewVideo: isVideo ? getRandom(sampleVideos) : '',
      costCoins: Math.floor(Math.random() * 10) + 1,
      isSuper: Math.random() > 0.8,
      isNew: Math.random() > 0.7,
      isHot: Math.random() > 0.7,
      isTrending: Math.random() > 0.6,
      tags: getRandomSubset(tags, Math.floor(Math.random() * 3)),
      sortOrder: Math.floor(Math.random() * 100),
      enabled: true,
      usageCount: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 500),
    });
  }
  return templates;
};

// 默认设置数据
const defaultSettings = {
  subscriptionPlans: [
    { id: 'super', name: 'SUPER', period: 'Yearly access', fullPrice: 59.99, price: 1.15, priceUnit: 'per week', gradient: true },
    { id: 'monthly', name: 'MONTHLY ACCESS', period: 'just $19.99 per month', fullPrice: 19.99, price: 0.60, priceUnit: 'per day', gradient: false },
  ],
  coinPackages: [
    { id: 'starter', name: 'Starter', coins: 100, bonus: 10, price: 4.99 },
    { id: 'popular', name: 'Popular', coins: 500, bonus: 100, price: 19.99, isPopular: true },
    { id: 'pro', name: 'Pro', coins: 1200, bonus: 300, price: 39.99 },
  ],
  featureCosts: {
    photo2video: 10,
    faceswap: 5,
    faceswap_video: 15,
    dressup: 8,
    hd: 3,
    remove: 2,
    aiimage: 10,
    chatedit: 12,
  },
  maintenance: false,
  announcement: '',
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // Seed settings
    console.log('Seeding settings...');
    for (const [key, value] of Object.entries(defaultSettings)) {
      try {
        const existing = await getSetting(key);
        if (!existing || (Array.isArray(existing) && existing.length === 0) || Object.keys(existing).length === 0) {
          await setSetting(key, value);
          console.log(`  - Set ${key}`);
        } else {
          console.log(`  - ${key} already configured, skipping`);
        }
      } catch (err) {
        // Setting doesn't exist, create it
        await setSetting(key, value);
        console.log(`  - Created ${key}`);
      }
    }

    console.log('Clearing existing templates...');
    await Template.deleteMany({});

    console.log('Generating seed data...');
    const seedData = generateTemplates(50); // Generate 50 templates

    console.log('Inserting templates...');
    await Template.insertMany(seedData);

    console.log('✅ Seed complete!');
    console.log(`Inserted ${seedData.length} templates.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

