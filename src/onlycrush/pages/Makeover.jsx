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

// Image Face Swap templates
const imageFaceSwapTemplates = [
  { id: 'img-1', thumbnailUrl: '/images/face-swap/face-1.jpg', label: 'Nurse', isSuper: false },
  { id: 'img-2', thumbnailUrl: '/images/face-swap/face-2.jpg', label: 'Bikini', isSuper: false },
  { id: 'img-3', thumbnailUrl: '/images/face-swap/face-3.jpg', label: 'Maid', isSuper: true },
  { id: 'img-4', thumbnailUrl: '/images/face-swap/face-4.jpg', label: 'Teacher', isSuper: false },
  { id: 'img-5', thumbnailUrl: '/images/face-swap/face-5.jpg', label: 'Office', isSuper: false },
  { id: 'img-6', thumbnailUrl: '/images/face-swap/face-6.jpg', label: 'Gym', isSuper: true },
  { id: 'img-7', thumbnailUrl: '/images/face-swap/face-7.jpg', label: 'Beach', isSuper: false },
  { id: 'img-8', thumbnailUrl: '/images/face-swap/face-8.jpg', label: 'Pool', isSuper: false },
];

// Video Face Swap templates
const videoFaceSwapTemplates = [
  { id: 'vid-1', videoUrl: '/videos/video-faceswap/video-1.mp4', thumbnailUrl: '/images/face-swap/face-1.jpg', isSuper: false },
  { id: 'vid-2', videoUrl: '/videos/video-faceswap/video-2.mp4', thumbnailUrl: '/images/face-swap/face-2.jpg', isSuper: true },
  { id: 'vid-3', videoUrl: '/videos/video-faceswap/video-3.mp4', thumbnailUrl: '/images/face-swap/face-3.jpg', isSuper: false },
  { id: 'vid-4', videoUrl: '/videos/video-faceswap/video-4.mp4', thumbnailUrl: '/images/face-swap/face-4.jpg', isSuper: false },
];

// Dress Up templates
const dressUpTemplates = [
  { id: 'dress-1', videoUrl: '/videos/trending/video-1.mp4', thumbnailUrl: '/images/face-swap/face-5.jpg', isSuper: false },
  { id: 'dress-2', videoUrl: '/videos/trending/video-2.mp4', thumbnailUrl: '/images/face-swap/face-6.jpg', isSuper: true },
  { id: 'dress-3', videoUrl: '/videos/trending/video-3.mp4', thumbnailUrl: '/images/face-swap/face-7.jpg', isSuper: false },
  { id: 'dress-4', videoUrl: '/videos/trending/video-4.mp4', thumbnailUrl: '/images/face-swap/face-8.jpg', isSuper: false },
];

// Icons
function FaceSwapIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
      <path d="M8 11v4a2 2 0 0 0 2 2h3" />
      <path d="M16 13v-4a2 2 0 0 0-2-2h-3" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Video Template Card with auto-play
function VideoCard({ template, onClick }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <button
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] group"
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
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(template.thumbnailUrl)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Super badge */}
      {template.isSuper && (
        <span
          className="absolute top-0 right-0 px-2.5 py-1 text-[10px] font-bold text-white z-10"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 16px 0 12px',
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
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] group"
      onClick={() => onClick(template)}
    >
      <img
        src={assetUrl(template.thumbnailUrl)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Super badge */}
      {template.isSuper && (
        <span
          className="absolute top-0 right-0 px-2.5 py-1 text-[10px] font-bold text-white z-10"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 16px 0 12px',
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

  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);

  const tabs = [
    { id: 'image', label: 'Image Face Swap', type: 'change_face_image' },
    { id: 'video', label: 'Video Face Swap', type: 'change_face_video' },
    { id: 'dressup', label: 'Dress Up', type: 'change_clothes' },
  ];

  const handleTabChange = (tab) => {
    setSearchParams({ type: tab.type });
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
    navigate(`/create?templateId=${template.id}&type=${type}`);
  }, [navigate, type]);

  const handleCustomClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fileInputRef.current?.click();
  }, [isAuthenticated, navigate]);

  // Get templates based on active tab
  const templates = activeTab === 'video'
    ? videoFaceSwapTemplates
    : activeTab === 'dressup'
    ? dressUpTemplates
    : imageFaceSwapTemplates;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Tabs - pill style matching target */}
      <div className="sticky top-0 z-50 bg-black pt-4 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'bg-transparent text-white/50 hover:text-white/80'
              }`}
              style={
                activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom button - matching target design */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={handleCustomClick}
          className="w-full bg-[#1a1a1a] hover:bg-[#222] rounded-2xl py-4 flex items-center justify-center gap-3 text-white font-bold transition-all border border-white/10"
        >
          <FaceSwapIcon />
          <PlusIcon />
          <span>Custom {activeTab === 'dressup' ? 'Dress Up' : 'Image Face Swap'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Template grid - 2 columns, no titles on cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) =>
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
          )}
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
