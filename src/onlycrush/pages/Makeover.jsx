import { useState, useRef, useEffect, useCallback } from 'react';
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

// Image Face Swap templates - 使用下载的图片资源
const imageFaceSwapTemplates = [
  { id: 'img-1', thumbnailUrl: '/images/face-swap/face-1.jpg', isSuper: false },
  { id: 'img-2', thumbnailUrl: '/images/face-swap/face-2.jpg', isSuper: false },
  { id: 'img-3', thumbnailUrl: '/images/face-swap/face-3.jpg', isSuper: true },
  { id: 'img-4', thumbnailUrl: '/images/face-swap/face-4.jpg', isSuper: false },
  { id: 'img-5', thumbnailUrl: '/images/face-swap/face-5.jpg', isSuper: false },
  { id: 'img-6', thumbnailUrl: '/images/face-swap/face-6.jpg', isSuper: true },
  { id: 'img-7', thumbnailUrl: '/images/face-swap/face-7.jpg', isSuper: false },
  { id: 'img-8', thumbnailUrl: '/images/face-swap/face-8.jpg', isSuper: false },
];

// Video Face Swap templates - 使用下载的视频资源
const videoFaceSwapTemplates = [
  { id: 'vid-1', videoUrl: '/videos/video-faceswap/video-1.mp4', thumbnailUrl: '/images/face-swap/face-1.jpg', isSuper: false },
  { id: 'vid-2', videoUrl: '/videos/video-faceswap/video-2.mp4', thumbnailUrl: '/images/face-swap/face-2.jpg', isSuper: true },
  { id: 'vid-3', videoUrl: '/videos/video-faceswap/video-3.mp4', thumbnailUrl: '/images/face-swap/face-3.jpg', isSuper: false },
  { id: 'vid-4', videoUrl: '/videos/video-faceswap/video-4.mp4', thumbnailUrl: '/images/face-swap/face-4.jpg', isSuper: false },
];

// Dress Up templates - 使用视频资源
const dressUpTemplates = [
  { id: 'dress-1', videoUrl: '/videos/trending/video-1.mp4', thumbnailUrl: '/images/face-swap/face-5.jpg', isSuper: false },
  { id: 'dress-2', videoUrl: '/videos/trending/video-2.mp4', thumbnailUrl: '/images/face-swap/face-6.jpg', isSuper: true },
  { id: 'dress-3', videoUrl: '/videos/trending/video-3.mp4', thumbnailUrl: '/images/face-swap/face-7.jpg', isSuper: false },
  { id: 'dress-4', videoUrl: '/videos/trending/video-4.mp4', thumbnailUrl: '/images/face-swap/face-8.jpg', isSuper: false },
];

// Icons
const FaceSwapIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="13" width="8" height="8" rx="2" />
    <path d="M8 11v4a2 2 0 0 0 2 2h3" />
    <path d="M16 13v-4a2 2 0 0 0-2-2h-3" />
    <circle cx="7" cy="7" r="1" fill="currentColor" />
    <circle cx="17" cy="17" r="1" fill="currentColor" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Video Template Card with auto-play
function VideoCard({ template, onClick }) {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible]);

  return (
    <button
      ref={cardRef}
      className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-[#1a1a1a] group"
      onClick={() => onClick(template)}
    >
      {template.videoUrl ? (
        <video
          ref={videoRef}
          src={assetUrl(template.videoUrl)}
          poster={assetUrl(template.thumbnailUrl)}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(template.thumbnailUrl)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {/* Super badge */}
      {template.isSuper && (
        <span
          className="absolute top-0 right-0 px-3 py-1.5 text-[11px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 18px 0 14px',
          }}
        >
          Super
        </span>
      )}
    </button>
  );
}

// Image Template Card
function ImageCard({ template, onClick }) {
  return (
    <button
      className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-[#1a1a1a] group"
      onClick={() => onClick(template)}
    >
      <img
        src={assetUrl(template.thumbnailUrl)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {/* Super badge */}
      {template.isSuper && (
        <span
          className="absolute top-0 right-0 px-3 py-1.5 text-[11px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 18px 0 14px',
          }}
        >
          Super
        </span>
      )}
    </button>
  );
}

export default function Makeover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const type = searchParams.get('type') || 'change_face_image';
  const activeTab = type === 'change_face_video' ? 'video' : type === 'change_clothes' ? 'dressup' : 'image';

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: 'image', label: 'Image Face Swap', type: 'change_face_image' },
    { id: 'video', label: 'Video Face Swap', type: 'change_face_video' },
    { id: 'dressup', label: 'Dress Up', type: 'change_clothes' },
  ];

  const handleTabChange = (tab) => {
    setSearchParams({ type: tab.type });
    setSelectedTemplate(null);
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSourcePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleTemplateClick = useCallback((template) => {
    // Navigate to create page with template ID
    navigate(`/create?templateId=${template.id}&type=${type}`);
  }, [navigate, type]);

  const handleCustomClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!sourceFile) {
      fileInputRef.current?.click();
      return;
    }
    // Navigate to create page for custom face swap
    navigate(`/create?type=${type}`);
  }, [isAuthenticated, navigate, sourceFile, type]);

  // Get templates based on active tab
  const templates = activeTab === 'video' 
    ? videoFaceSwapTemplates 
    : activeTab === 'dressup' 
    ? dressUpTemplates 
    : imageFaceSwapTemplates;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Tabs */}
      <div className="sticky top-0 z-50 bg-black pt-4 px-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-[#1f1f1f] text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom button */}
      <div className="px-4 pt-5 pb-4">
        <button
          onClick={handleCustomClick}
          disabled={isProcessing}
          className="w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-2xl py-5 flex items-center justify-center gap-4 text-white font-bold text-lg transition-all border border-white/10"
        >
          <FaceSwapIcon />
          <PlusIcon />
          <span>Custom {activeTab === 'image' ? 'Image' : activeTab === 'video' ? 'Video' : 'Dress Up'} Face Swap</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Template grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            activeTab === 'video' || activeTab === 'dressup' ? (
              <VideoCard
                key={template.id}
                template={template}
                onClick={handleTemplateClick}
              />
            ) : (
              <ImageCard
                key={template.id}
                template={template}
                onClick={handleTemplateClick}
              />
            )
          ))}
        </div>
      </div>

      {/* Preview if source selected */}
      {sourcePreview && (
        <div className="fixed bottom-24 right-4 z-40">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-green-500 shadow-lg">
            <img src={sourcePreview} alt="Your photo" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setSourceFile(null);
                setSourcePreview(null);
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
