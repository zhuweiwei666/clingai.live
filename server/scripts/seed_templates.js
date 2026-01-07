import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Template from '../models/Template.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clingai';
const R2_BASE_URL = process.env.R2_PUBLIC_URL || 'https://pub-17497f33464648bdb5f47bbbdbf732e7.r2.dev';

// Sample data generators
const categories = ['photo2video', 'faceswap', 'dressup', 'hd', 'remove', 'aiimage'];
const tags = ['new', 'hot', 'trending', 'viral', 'cosplay', 'closeup', 'charm'];

const sampleImages = [
  'templates/1.jpg',
  'templates/2.jpg',
  'templates/3.jpg',
  'templates/4.jpg',
  'templates/5.jpg',
];

const sampleVideos = [
  'templates/1.mp4',
  'templates/2.mp4',
];

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
      thumbnail: `${R2_BASE_URL}/${getRandom(sampleImages)}`,
      previewVideo: isVideo ? `${R2_BASE_URL}/${getRandom(sampleVideos)}` : '',
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

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

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

