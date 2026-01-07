import { useState, useEffect, useRef } from 'react';
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

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const VideoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);
const SaveIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// Fallback templates
const fallbackTemplates = {
  image: [
    { _id: 'fs-img-1', name: 'Action Star', thumbnail: 'https://via.placeholder.com/300x400/4c1d95/fff?text=Action', type: 'image', isSuper: true },
    { _id: 'fs-img-2', name: 'Red Carpet', thumbnail: 'https://via.placeholder.com/300x400/6b21a8/fff?text=RedCarpet', type: 'image' },
    { _id: 'fs-img-3', name: 'Vintage', thumbnail: 'https://via.placeholder.com/300x400/7c3aed/fff?text=Vintage', type: 'image' },
  ],
  video: [
    { _id: 'fs-vid-1', name: 'Cyber', thumbnail: 'https://via.placeholder.com/300x400/581c87/fff?text=Cyber', type: 'video', isNew: true },
    { _id: 'fs-vid-2', name: 'Fantasy', thumbnail: 'https://via.placeholder.com/300x400/701a75/fff?text=Fantasy', type: 'video' },
    { _id: 'fs-vid-3', name: 'Business', thumbnail: 'https://via.placeholder.com/300x400/831843/fff?text=Business', type: 'video', isSuper: true },
  ],
  dressup: [
    { _id: 'fs-dress-1', name: 'Evening Gown', thumbnail: 'https://via.placeholder.com/300x400/4c1d95/fff?text=Gown', type: 'dressup', isSuper: true },
    { _id: 'fs-dress-2', name: 'Casual', thumbnail: 'https://via.placeholder.com/300x400/6b21a8/fff?text=Casual', type: 'dressup' },
    { _id: 'fs-dress-3', name: 'Swimsuit', thumbnail: 'https://via.placeholder.com/300x400/7c3aed/fff?text=Swim', type: 'dressup', isNew: true },
  ],
};

// Template Card
function TemplateCard({ template, index, onSelect }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && template.previewVideo) {
      videoRef.current.play().catch(() => {});
    }
  }, [template.previewVideo]);

  const badge = template.isSuper ? 'super' : template.isNew ? 'new' : null;

  return (
    <div
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={() => onSelect(template)}
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
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400'; }}
        />
      )}

      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)' }} />

      {/* Badge */}
      {badge === 'super' && (
        <span className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[16px] rounded-tr-[20px] text-[10px] font-bold text-white z-20 shadow-md">
          Super
        </span>
      )}
      {badge === 'new' && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[10px] font-bold text-white z-20 shadow-lg">
          <span>🔥</span><span>New</span><span>🔥</span>
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 z-20">
        <div className="text-white/90"><VideoIcon /></div>
        <div className="flex-1 text-center text-[11px] font-bold text-white uppercase tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          {template.name}
        </div>
        <div className="text-white/90"><SaveIcon /></div>
      </div>
    </div>
  );
}

export default function FaceSwap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const typeParam = searchParams.get('type');
  const initialTab = typeParam === 'change_face_video' ? 'video' : typeParam === 'dress_up' ? 'dressup' : 'image';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [templates, setTemplates] = useState(fallbackTemplates);
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const t = searchParams.get('type');
    if (t === 'change_face_video') setActiveTab('video');
    else if (t === 'dress_up') setActiveTab('dressup');
    else setActiveTab('image');
  }, [searchParams]);

  // Load templates from API
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [imgRes, vidRes, dressRes] = await Promise.all([
          api.post('/app/tools/get', { category: 'face_swap_image' }).catch(() => null),
          api.post('/app/tools/get', { category: 'face_swap_video' }).catch(() => null),
          api.post('/app/tools/get', { category: 'dress_up' }).catch(() => null),
        ]);
        const imgList = imgRes?.data?.templates || imgRes?.templates || fallbackTemplates.image;
        const vidList = vidRes?.data?.templates || vidRes?.templates || fallbackTemplates.video;
        const dressList = dressRes?.data?.templates || dressRes?.templates || fallbackTemplates.dressup;
        setTemplates({ image: imgList, video: vidList, dressup: dressList });
      } catch (err) {
        console.error('Failed to fetch face-swap templates:', err);
      }
    };
    loadAll();
  }, []);

  const tabs = [
    { id: 'image', label: 'Image Face Swap' },
    { id: 'video', label: 'Video Face Swap' },
    { id: 'dressup', label: 'Dress Up' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSourcePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = async (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!sourceFile) {
      toast.error('Please upload your photo first');
      return;
    }
    setIsProcessing(true);
    try {
      toast.loading('Uploading...', { id: 'faceswap' });
      const formData = new FormData();
      formData.append('image', sourceFile);
      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.url || uploadRes.url;
      if (!imageUrl) throw new Error('Failed to upload image');

      toast.loading('Starting Face Swap...', { id: 'faceswap' });
      let genRes;
      if (activeTab === 'dressup') {
        genRes = await api.post('/generate/dress-up', { imageUrl, templateId: template._id || template.id });
      } else if (activeTab === 'video') {
        genRes = await api.post('/generate/face-swap-video', { imageUrl, templateId: template._id || template.id });
      } else {
        genRes = await api.post('/generate/face-swap-image', { imageUrl, templateId: template._id || template.id });
      }
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
  };

  const displayTemplates = templates[activeTab] || [];

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Face Swap</h1>
      </div>

      {/* Tabs */}
      <div className="sticky top-[56px] z-40 bg-black/95 backdrop-blur-md border-b border-[#262626]">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' : 'bg-[#141414] text-white/60 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="px-4 py-6">
        <button
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-4 flex items-center justify-center gap-2 text-white font-bold disabled:opacity-50"
        >
          {sourcePreview ? (
            <img src={sourcePreview} alt="Source" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <UploadIcon />
          )}
          <span>{sourcePreview ? 'Change Photo' : '+ Custom Image Face Swap'}</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Grid */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {displayTemplates.map((tpl, i) => (
            <TemplateCard key={tpl._id || tpl.id || i} template={tpl} index={i} onSelect={handleTemplateSelect} />
          ))}
        </div>
        {displayTemplates.length === 0 && (
          <div className="text-center py-20 text-white/60">No templates available</div>
        )}
      </div>
    </div>
  );
}

