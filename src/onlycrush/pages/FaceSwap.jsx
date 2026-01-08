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

// Face Swap templates - 使用下载的图片资源
const faceSwapTemplates = [
  { id: 'fs-1', thumbnailUrl: '/images/face-swap/face-1.jpg', name: 'Nurse', isSuper: false },
  { id: 'fs-2', thumbnailUrl: '/images/face-swap/face-2.jpg', name: 'Bikini', isSuper: false },
  { id: 'fs-3', thumbnailUrl: '/images/face-swap/face-3.jpg', name: 'Blonde', isSuper: true },
  { id: 'fs-4', thumbnailUrl: '/images/face-swap/face-4.jpg', name: 'Lingerie', isSuper: false },
  { id: 'fs-5', thumbnailUrl: '/images/face-swap/face-5.jpg', name: 'Casual', isSuper: false },
  { id: 'fs-6', thumbnailUrl: '/images/face-swap/face-6.jpg', name: 'Elegant', isSuper: true },
  { id: 'fs-7', thumbnailUrl: '/images/face-swap/face-7.jpg', name: 'Natural', isSuper: false },
  { id: 'fs-8', thumbnailUrl: '/images/face-swap/face-8.jpg', name: 'Glamour', isSuper: false },
];

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

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

// Template Card
function TemplateCard({ template, onClick }) {
  return (
    <button
      className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-[#1a1a1a] group"
      onClick={() => onClick(template)}
    >
      <img
        src={assetUrl(template.thumbnailUrl)}
        alt={template.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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

export default function FaceSwap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSourcePreview(ev.target.result);
      setShowUploadModal(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleTemplateClick = useCallback(async (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!sourceFile && !sourcePreview) {
      // Navigate to full-screen template view
      navigate(`/create?templateId=${template.id}&type=face_swap`);
      return;
    }

    // If user already has a source image, start processing
    setIsProcessing(true);
    try {
      toast.loading('Uploading...', { id: 'faceswap' });

      let imageUrl = sourcePreview;
      if (sourceFile) {
        const formData = new FormData();
        formData.append('image', sourceFile);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data?.url || uploadRes.url;
        if (!imageUrl) throw new Error('Failed to upload image');
      }

      toast.loading('Starting Face Swap...', { id: 'faceswap' });
      const genRes = await api.post('/generate/face-swap-image', {
        imageUrl,
        templateId: template.id,
      });

      const taskId = genRes.data?.taskId || genRes.taskId;
      if (taskId) {
        toast.success('Task created!', { id: 'faceswap' });
        navigate(`/result?taskId=${taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Face Swap error:', err);
      toast.error(err.message || 'Failed to create task', { id: 'faceswap' });
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, navigate, sourceFile, sourcePreview]);

  const handleCustomClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fileInputRef.current?.click();
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Face Swap</h1>
      </div>

      {/* Custom upload button */}
      <div className="px-4 pt-5 pb-4">
        <button
          onClick={handleCustomClick}
          disabled={isProcessing}
          className="w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-2xl py-5 flex items-center justify-center gap-4 text-white font-bold text-lg transition-all border border-white/10 disabled:opacity-50"
        >
          {sourcePreview ? (
            <img src={sourcePreview} alt="Your photo" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <FaceSwapIcon />
          )}
          <PlusIcon />
          <span>{sourcePreview ? 'Change Photo' : 'Custom Face Swap'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Hint text */}
      {sourcePreview && (
        <div className="px-4 pb-4">
          <p className="text-white/60 text-sm text-center">
            Select a template below to swap your face
          </p>
        </div>
      )}

      {/* Template grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {faceSwapTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={handleTemplateClick}
            />
          ))}
        </div>
      </div>

      {/* Preview indicator */}
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
