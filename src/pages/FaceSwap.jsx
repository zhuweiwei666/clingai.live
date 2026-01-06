import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { generationService } from '../services/generationService';
import { uploadService } from '../services/uploadService';
import useUserStore from '../store/userStore';
import { assetUrl } from '../utils/assetUrl';

// Icons
const FaceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="4" />
    <circle cx="16" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// Sample templates
const templates = [
  { id: '1', title: 'Action Star', thumbnail: '/templates/9.jpg', type: 'image', badge: null },
  { id: '2', title: 'Red Carpet', thumbnail: '/templates/10.jpg', type: 'image', badge: 'super' },
  { id: '3', title: 'Vintage', thumbnail: '/templates/11.jpg', type: 'image', badge: null },
  { id: '4', title: 'Cyber', thumbnail: '/templates/12.jpg', type: 'video', badge: 'new' },
  { id: '5', title: 'Fantasy', thumbnail: '/templates/13.jpg', type: 'video', badge: null },
  { id: '6', title: 'Business', thumbnail: '/templates/14.jpg', type: 'video', badge: 'super' },
];

function TemplateCard({ template, index, onSelect }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="video-card fade-in"
      style={{ animationDelay: `${index * 0.04}s` }}
      onClick={() => onSelect(template)}
    >
      <div className="video-card-media">
        <img
          src={assetUrl(template.thumbnail)}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
          onError={(e) => e.target.src = 'https://via.placeholder.com/300x400'}
        />
        <div className="video-card-overlay" />
        
        {/* Badges */}
        {template.badge === 'super' && (
          <span className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[14px] rounded-tr-[24px] text-[11px] font-bold text-white z-20">
            Super
          </span>
        )}
          {template.badge === 'new' && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[11px] font-bold text-white z-20">
            <span>🔥</span>
              <span>New</span>
            <span>🔥</span>
            </div>
          )}

        {/* Bottom Info */}
        <div className="card-bottom">
          <div className="card-icon-left"><VideoIcon /></div>
          <div className="card-title">{template.title}</div>
          <div className="card-icon-right"><SaveIcon /></div>
        </div>
      </div>
    </div>
  );
}

export default function FaceSwap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  
  // Parse URL param to set initial tab (benchmark: /makeover?type=change_face_image)
  const typeParam = searchParams.get('type');
  const initialTab = typeParam === 'change_face_video' ? 'video' 
    : typeParam === 'dress_up' ? 'dressup' 
    : 'image';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update tab when URL param changes
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'change_face_video') setActiveTab('video');
    else if (type === 'dress_up') setActiveTab('dressup');
    else setActiveTab('image');
  }, [searchParams]);

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
    reader.onload = (e) => setSourcePreview(e.target.result);
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
      // 1. Upload Source Image
      toast.loading('Uploading source image...', { id: 'faceswap' });
      const uploadResult = await uploadService.uploadImage(sourceFile);
      
      if (!uploadResult || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }

      // 2. Generate
      toast.loading('Starting Face Swap...', { id: 'faceswap' });
      
      let result;
      if (activeTab === 'dressup') {
        // Dress Up (Virtual Try-On)
        result = await generationService.dressUp(uploadResult.url, template.id);
      } else if (template.type === 'video' || activeTab === 'video') {
        // Video Face Swap (Template is target video)
        // Since templates have thumbnails only in mock, we assume template.id maps to a video url in backend or use a mock url
        // For real implementation, template should have .video url
        const targetVideoUrl = template.video || `https://example.com/videos/${template.id}.mp4`; // Mock
        result = await generationService.videoFaceSwap(uploadResult.url, targetVideoUrl);
      } else {
        // Image Face Swap
        const targetImageUrl = template.image || template.thumbnail; // Use thumbnail as target for now
        result = await generationService.imageFaceSwap(uploadResult.url, targetImageUrl);
      }

      if (result && result.taskId) {
        toast.success('Task created! Check My Works later.', { id: 'faceswap' });
        navigate('/profile');
      } else {
        toast.error('Failed to create task', { id: 'faceswap' });
      }
    } catch (error) {
      console.error('Face Swap error:', error);
      toast.error(error.message || 'Failed to create task', { id: 'faceswap' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter templates based on active tab
  const displayTemplates = activeTab === 'dressup'
    ? [
        { id: '1', title: 'Elegant Dress', thumbnail: '/templates/1.jpg', type: 'dressup', badge: 'super' },
        { id: '2', title: 'Casual Style', thumbnail: '/templates/2.jpg', type: 'dressup', badge: 'new' },
        { id: '3', title: 'Swimwear', thumbnail: '/templates/3.jpg', type: 'dressup', badge: null },
        { id: '4', title: 'Lingerie', thumbnail: '/templates/4.jpg', type: 'dressup', badge: null },
        { id: '5', title: 'Office Wear', thumbnail: '/templates/5.jpg', type: 'dressup', badge: null },
        { id: '6', title: 'Party Dress', thumbnail: '/templates/6.jpg', type: 'dressup', badge: 'super' },
      ]
    : templates.filter(t => 
        activeTab === 'video' ? t.type === 'video' : t.type === 'image'
      );

  return (
    <div className="min-h-screen pb-24">
      {/* 功能 Tab */}
      <div className="function-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`function-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 上传按钮 */}
      <div
        className="upload-button"
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="upload-button-icon">
          {sourcePreview ? (
            <img 
              src={sourcePreview} 
              alt="" 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            activeTab === 'dressup' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
              </svg>
            ) : (
              <FaceIcon />
            )
          )}
        </div>
        
        <div className="upload-button-text">
          {isProcessing ? 'Processing...' : activeTab === 'dressup' ? 'Upload Your Photo' : 'Upload Your Face'}
        </div>
        
        {!isProcessing && <div className="upload-button-plus">+</div>}
      </div>

      {/* 模板网格 */}
      <div className="cards-grid">
        {displayTemplates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            onSelect={handleTemplateSelect}
          />
        ))}
      </div>
    </div>
  );
}
