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
  { id: '1', name: 'Bikini Beach', thumbnail: '/images/face-swap/face-1.jpg', previewVideo: '/videos/trending/video-1.mp4', isFree: true },
  { id: '2', name: 'Summer Pool', thumbnail: '/images/face-swap/face-2.jpg', previewVideo: '/videos/trending/video-2.mp4', isNew: true },
  { id: '3', name: 'Sunset Dance', thumbnail: '/images/face-swap/face-3.jpg', previewVideo: '/videos/trending/video-3.mp4', isFree: true },
  { id: '4', name: 'Night Club', thumbnail: '/images/face-swap/face-4.jpg', previewVideo: '/videos/trending/video-4.mp4' },
  { id: '5', name: 'Beach Party', thumbnail: '/images/face-swap/face-5.jpg', previewVideo: '/videos/all/video-1.mp4', isNew: true },
  { id: '6', name: 'Poolside', thumbnail: '/images/face-swap/face-6.jpg', previewVideo: '/videos/all/video-2.mp4', isTrending: true },
];

// Icons
function BackIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M15 18l-6-6 6-6" />
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

function CameraIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="14" rx="3" />
      <circle cx="12" cy="13" r="4" />
      <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
    </svg>
  );
}

function TransformIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

// Mini template card for bottom carousel
function MiniTemplateCard({ template, isActive, onClick }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  return (
    <button
      onClick={onClick}
      className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden transition-all ${
        isActive ? 'ring-2 ring-purple-500 scale-105' : 'opacity-60'
      }`}
    >
      {template.previewVideo ? (
        <video
          ref={videoRef}
          src={assetUrl(template.previewVideo)}
          poster={assetUrl(template.thumbnail)}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(template.thumbnail)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
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
  const mainVideoRef = useRef(null);

  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Find current template
  useEffect(() => {
    const template = MOCK_TEMPLATES.find((t) => t.id === templateId) || MOCK_TEMPLATES[0];
    setCurrentTemplate(template);
  }, [templateId]);

  // Auto-play main video
  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.play().catch(() => {});
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
    navigate(`/create?template=${template.id}`, { replace: true });
  };

  if (!currentTemplate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Full-screen video preview */}
      <div className="absolute inset-0 z-0">
        {currentTemplate.previewVideo ? (
          <video
            ref={mainVideoRef}
            src={assetUrl(currentTemplate.previewVideo)}
            poster={assetUrl(currentTemplate.thumbnail)}
            muted
            loop
            playsInline
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={assetUrl(currentTemplate.thumbnail)}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
      </div>

      {/* Top bar - floating */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-[max(16px,env(safe-area-inset-top))]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-white bg-black/30 backdrop-blur-sm rounded-full"
        >
          <BackIcon />
        </button>
        
        {/* Template name */}
        <div className="absolute left-1/2 -translate-x-1/2 text-white text-lg font-bold">
          {currentTemplate.name}
        </div>

        <button 
          onClick={() => navigate('/subscribe')}
          className="px-4 py-1.5 rounded-full text-white text-sm font-bold bg-black/30 backdrop-blur-sm"
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
        >
          Pro
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom area - upload + templates */}
      <div className="relative z-10 pb-[max(24px,env(safe-area-inset-bottom))]">
        {/* Upload section */}
        <div className="px-6 mb-6">
          {/* Uploaded image preview */}
          {imagePreview && (
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-24 rounded-xl overflow-hidden border-2 border-green-500 shadow-lg">
                <img src={imagePreview} alt="Your photo" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setUploadedImage(null);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center shadow"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Main action button */}
          <button
            onClick={imagePreview ? handleTransform : handleUpload}
            disabled={isProcessing}
            className="w-full py-4 rounded-full flex items-center justify-center gap-3 text-black font-bold text-lg shadow-xl active:scale-95 transition-all disabled:opacity-50"
            style={{ 
              background: imagePreview 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' 
                : 'white',
              color: imagePreview ? 'white' : 'black',
            }}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : imagePreview ? (
              <>
                <TransformIcon />
                Transform your photo
              </>
            ) : (
              <>
                <CameraIcon />
                Upload your photo
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

        {/* Template carousel */}
        <div className="px-4">
          <div className="text-white/60 text-xs text-center mb-3">More templates</div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 justify-center">
            {MOCK_TEMPLATES.map((template) => (
              <MiniTemplateCard
                key={template.id}
                template={template}
                isActive={template.id === currentTemplate.id}
                onClick={() => handleTemplateClick(template)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
