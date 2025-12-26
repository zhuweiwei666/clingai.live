// Database configuration
// For now, we'll use in-memory storage
// Later can be replaced with MongoDB, PostgreSQL, etc.

// In-memory data stores
export const users = new Map();
export const videos = new Map();
export const images = new Map();
export const templates = new Map();
export const works = new Map();

// Initialize with sample templates
const sampleTemplates = [
  {
    id: '1',
    title: 'Rub Her Body',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    videoUrl: 'https://sample-videos.com/video123.mp4',
    category: 'photo_to_video',
    tags: ['super', 'trending'],
    views: 12500,
    likes: 890,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Dance Motion',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    videoUrl: 'https://sample-videos.com/video456.mp4',
    category: 'photo_to_video',
    tags: ['new', 'hot'],
    views: 8300,
    likes: 650,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Face Swap Pro',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    videoUrl: null,
    category: 'face_swap',
    tags: ['super'],
    views: 15600,
    likes: 1200,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'AI Portrait',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    videoUrl: null,
    category: 'ai_image',
    tags: ['new'],
    views: 9800,
    likes: 780,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Dress Up Magic',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    videoUrl: null,
    category: 'dress_up',
    tags: ['viral'],
    views: 11200,
    likes: 920,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    title: 'HD Enhance',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    videoUrl: null,
    category: 'hd',
    tags: [],
    views: 7500,
    likes: 540,
    createdAt: new Date().toISOString()
  }
];

// Initialize templates
sampleTemplates.forEach(t => templates.set(t.id, t));

export default {
  users,
  videos,
  images,
  templates,
  works
};
