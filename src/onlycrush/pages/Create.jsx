import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Assets helper
const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Mock templates data (使用下载的视频资源)
const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'RUB HER BODY',
    tag: 'Gesture',
    creator: '@zoe_pearl',
    creatorAvatar: '/images/face-swap/face-1.jpg',
    previewVideo: '/videos/trending/video-1.mp4',
    thumbnail: '/images/face-swap/face-1.jpg',
    isFree: true,
    coins: 0,
  },
  {
    id: '2',
    name: 'PLAYING WITH EGGPLANT',
    tag: 'Gesture',
    creator: '@luna_star',
    creatorAvatar: '/images/face-swap/face-2.jpg',
    previewVideo: '/videos/trending/video-2.mp4',
    thumbnail: '/images/face-swap/face-2.jpg',
    isFree: false,
    coins: 10,
  },
  {
    id: '3',
    name: 'MILK A COW',
    tag: 'Action',
    creator: '@emma_rose',
    creatorAvatar: '/images/face-swap/face-3.jpg',
    previewVideo: '/videos/trending/video-3.mp4',
    thumbnail: '/images/face-swap/face-3.jpg',
    isFree: true,
    coins: 0,
  },
  {
    id: '4',
    name: 'AIRY SWING',
    tag: 'Motion',
    creator: '@sophia_lee',
    creatorAvatar: '/images/face-swap/face-4.jpg',
    previewVideo: '/videos/trending/video-4.mp4',
    thumbnail: '/images/face-swap/face-4.jpg',
    isFree: false,
    coins: 15,
  },
  {
    id: '5',
    name: 'TURN MOTION',
    tag: 'Pose',
    creator: '@olivia_jones',
    creatorAvatar: '/images/face-swap/face-5.jpg',
    previewVideo: '/videos/all/video-1.mp4',
    thumbnail: '/images/face-swap/face-5.jpg',
    isFree: true,
    coins: 0,
  },
  {
    id: '6',
    name: 'ROLE PERFORMANCE',
    tag: 'Dance',
    creator: '@mia_wilson',
    creatorAvatar: '/images/face-swap/face-6.jpg',
    previewVideo: '/videos/all/video-2.mp4',
    thumbnail: '/images/face-swap/face-6.jpg',
    isFree: false,
    coins: 20,
  },
];

// Sample images for "Try one of these"
const SAMPLE_IMAGES = [
  '/images/face-swap/face-1.jpg',
  '/images/face-swap/face-2.jpg',
  '/images/face-swap/face-3.jpg',
  '/images/face-swap/face-4.jpg',
  '/images/face-swap/face-5.jpg',
  '/images/face-swap/face-6.jpg',
];

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
  </svg>
);

export default function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || searchParams.get('template') || searchParams.get('id') || '1';
  const { isAuthenticated, user } = useUserStore();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);

  // Find current template
  useEffect(() => {
    const template = MOCK_TEMPLATES.find(t => t.id === templateId) || MOCK_TEMPLATES[0];
    setCurrentTemplate(template);
  }, [templateId]);

  // Auto play video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentTemplate]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setShowSampleModal(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSampleSelect = useCallback((sampleUrl) => {
    setImagePreview(sampleUrl);
    setUploadedImage(null); // Using sample URL directly
    setShowSampleModal(false);
    toast.success('Sample image selected!');
  }, []);

  const handleTransform = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Open file picker if no image
    if (!imagePreview) {
      fileInputRef.current?.click();
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading('Creating your video...', { id: 'create' });

      let imageUrl = imagePreview;

      // If we have an uploaded file, upload it first
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data?.url || uploadRes.url;
        if (!imageUrl) throw new Error('Failed to upload image');
      }

      // Create video task
      const genRes = await api.post('/generate/video', {
        imageUrl,
        templateId: currentTemplate?.id,
      });

      const taskId = genRes.data?.taskId || genRes.taskId;
      if (taskId) {
        toast.success('Task created!', { id: 'create' });
        navigate(`/result?taskId=${taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Create error:', err);
      toast.error(err.message || 'Failed to create task', { id: 'create' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentTemplate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Full screen video preview */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src={assetUrl(currentTemplate.previewVideo)}
          poster={assetUrl(currentTemplate.thumbnail)}
          muted
          loop
          playsInline
          autoPlay
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Back button */}
        <div className="p-4 safe-area-top">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <BackIcon />
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom content */}
        <div className="p-4 pb-8 safe-area-bottom">
          {/* Template info */}
          <div className="flex items-end justify-between mb-6">
            {/* Left: Creator info */}
            <div className="flex items-center gap-3">
              {/* Creator avatar */}
              <div className="w-14 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                <img
                  src={assetUrl(currentTemplate.creatorAvatar)}
                  alt={currentTemplate.creator}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Creator name and tag */}
              <div className="flex flex-col gap-1.5">
                <span className="text-white/70 text-sm font-medium">{currentTemplate.creator}</span>
                <span className="px-3 py-1 rounded-lg text-white text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                    boxShadow: '0 2px 12px rgba(147, 51, 234, 0.4)',
                  }}
                >
                  {currentTemplate.tag}
                </span>
                <span className="text-white font-bold text-lg tracking-tight">{currentTemplate.name}</span>
              </div>
            </div>

            {/* Right: Favorite button */}
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isFavorited
                  ? 'bg-pink-500/20 text-pink-500'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <HeartIcon filled={isFavorited} />
            </button>
          </div>

          {/* Transform button */}
          <button
            onClick={handleTransform}
            disabled={isProcessing}
            className="relative w-full bg-white rounded-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-lg text-black hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
          >
            <SparkleIcon />
            <span>{imagePreview ? 'Transform your photo' : 'Upload your photo'}</span>

            {/* Free/Coins badge */}
            {currentTemplate.isFree ? (
              <span
                className="absolute right-4 px-4 py-1 rounded-full text-white text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
                }}
              >
                Free
              </span>
            ) : (
              <span
                className="absolute right-4 px-4 py-1 rounded-full text-white text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                }}
              >
                {currentTemplate.coins} 💎
              </span>
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Try sample images link */}
          <button
            onClick={() => setShowSampleModal(true)}
            className="mt-4 w-full text-center text-white/80 text-sm font-medium hover:text-white transition-colors"
          >
            👍 No image?<span className="underline ml-1">Try one of these</span>
          </button>
        </div>
      </div>

      {/* Sample images modal */}
      {showSampleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowSampleModal(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-t-3xl w-full max-w-md p-6 pb-10 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-bold">Choose a sample image</h3>
              <button
                onClick={() => setShowSampleModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSampleSelect(img)}
                  className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
                >
                  <img
                    src={assetUrl(img)}
                    alt={`Sample ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 w-full py-3 rounded-full border-2 border-dashed border-white/30 text-white/60 text-sm font-medium hover:border-white/50 hover:text-white/80 transition-all"
            >
              + Upload from device
            </button>
          </div>
        </div>
      )}

      {/* Image preview indicator */}
      {imagePreview && (
        <div className="fixed top-20 right-4 z-20">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-green-500 shadow-lg">
            <img src={imagePreview} alt="Your photo" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setImagePreview(null);
                setUploadedImage(null);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
