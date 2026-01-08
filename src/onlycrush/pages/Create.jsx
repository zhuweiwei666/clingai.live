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

// Mock templates data
const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'Rub her body',
    thumbnail: '/video-resources/1.jpg',
    previewVideo: '/video-resources/video1.mp4',
    isFree: true,
  },
  {
    id: '2',
    name: 'Playing with eggplant',
    thumbnail: '/video-resources/2.jpg',
    previewVideo: '/video-resources/video2.mp4',
    isNew: true,
  },
  {
    id: '3',
    name: 'Milk a cow',
    thumbnail: '/video-resources/3.jpg',
    previewVideo: '/video-resources/video3.mp4',
    isFree: true,
  },
  {
    id: '4',
    name: 'Airy swing',
    thumbnail: '/video-resources/4.jpg',
    previewVideo: '/video-resources/video4.mp4',
  },
  {
    id: '5',
    name: 'Turn Motion',
    thumbnail: '/video-resources/5.jpg',
    previewVideo: '/video-resources/video5.mp4',
    isNew: true,
  },
  {
    id: '6',
    name: 'She had an orgasm',
    thumbnail: '/video-resources/6.jpg',
    previewVideo: '/video-resources/video6.mp4',
    isTrending: true,
  },
];

// Icons
function BackIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function BikiniIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4C9 4 7 6 7 8c0 1.5.5 2.5 1.5 3.5L6 14h12l-2.5-2.5c1-.9 1.5-2 1.5-3.5 0-2-2-4-5-4z"
        fill="url(#bikiniGrad)"
      />
      <path d="M6 14l-1 6M18 14l1 6M12 14v6" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="bikiniGrad" x1="6" y1="4" x2="18" y2="14">
          <stop stopColor="#f472b6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function ProBadge() {
  return (
    <div
      className="px-3 py-1 rounded text-white text-xs font-bold"
      style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
    >
      Pro
    </div>
  );
}

// Template card for bottom sheet
function TemplateCard({ template, onClick }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a]"
    >
      {template.previewVideo ? (
        <video
          ref={videoRef}
          src={assetUrl(template.previewVideo)}
          poster={assetUrl(template.thumbnail)}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(template.thumbnail)}
          alt={template.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Title */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <span className="text-white text-sm font-medium">{template.name}</span>
      </div>

      {/* Badge */}
      {template.isNew && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}>
          <span>🔥</span> New <span>🔥</span>
        </div>
      )}
      {template.isTrending && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>
          <span>🔥</span> Trending <span>🔥</span>
        </div>
      )}
    </button>
  );
}

export default function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId') || searchParams.get('template') || searchParams.get('id') || '1';
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find current template
  useEffect(() => {
    const template = MOCK_TEMPLATES.find((t) => t.id === templateId) || MOCK_TEMPLATES[0];
    setCurrentTemplate(template);
  }, [templateId]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleTransform = async () => {
    if (!imagePreview) {
      handleUpload();
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading('Creating your video...', { id: 'create' });

      let imageUrl = imagePreview;

      if (uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data?.url || uploadRes.url;
        if (!imageUrl) throw new Error('Failed to upload image');
      }

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

  const handleTemplateClick = (template) => {
    navigate(`/create?template=${template.id}`);
  };

  if (!currentTemplate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-white"
        >
          <BackIcon />
        </button>
        <button onClick={() => navigate('/subscribe')}>
          <ProBadge />
        </button>
      </div>

      {/* Main content - tilted cards */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Cycle icon */}
        <div className="text-white/60 mb-6">
          <CycleIcon />
        </div>

        {/* Two tilted preview cards */}
        <div className="relative w-64 h-48 mb-8">
          {/* Left card - rotated */}
          <div
            className="absolute left-0 top-0 w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10"
            style={{ transform: 'rotate(-8deg) translateX(-10px)' }}
          >
            <img
              src={assetUrl(currentTemplate.thumbnail)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right card - rotated opposite */}
          <div
            className="absolute right-0 top-0 w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10"
            style={{ transform: 'rotate(8deg) translateX(10px)' }}
          >
            <img
              src={assetUrl(currentTemplate.thumbnail)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bikini icon */}
        <div className="mb-6">
          <BikiniIcon />
        </div>

        {/* Upload button */}
        <button
          onClick={imagePreview ? handleTransform : handleUpload}
          disabled={isProcessing}
          className="w-full max-w-sm bg-white rounded-full py-4 px-8 flex items-center justify-center gap-3 text-black font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          {imagePreview ? (
            <>Transform Now</>
          ) : (
            <>
              Upload Her Image
              <PlusIcon />
            </>
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
      </div>

      {/* Preview indicator if image uploaded */}
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

      {/* Bottom sheet - More ways to play */}
      <div className="bg-[#1a1a1a] rounded-t-3xl px-4 pt-4 pb-8">
        {/* Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Title */}
        <div className="text-center text-white/70 text-sm mb-4">More ways to play with her</div>

        {/* Template grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {MOCK_TEMPLATES.slice(0, 4).map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => handleTemplateClick(template)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
