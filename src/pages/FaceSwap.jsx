import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';

// 图标
const FaceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="4" />
    <circle cx="16" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="3" width="8" height="18" rx="2" />
    <rect x="14" y="3" width="8" height="18" rx="2" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 模板 - 使用本地资源
const templates = [
  { id: '1', thumbnail: '/templates/9.jpg', badge: null },
  { id: '2', thumbnail: '/templates/10.jpg', badge: 'super' },
  { id: '3', thumbnail: '/templates/11.jpg', badge: null },
  { id: '4', thumbnail: '/templates/12.jpg', badge: 'new' },
  { id: '5', thumbnail: '/templates/13.jpg', badge: null },
  { id: '6', thumbnail: '/templates/14.jpg', badge: 'super' },
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
          src={template.thumbnail}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
        <div className="video-card-overlay" />
        <div className="video-card-content">
          {template.badge === 'super' && <span className="badge-super">Super</span>}
          {template.badge === 'new' && (
            <div className="badge-new">
              <span className="fire">🔥</span>
              <span>New</span>
              <span className="fire">🔥</span>
            </div>
          )}
          <div className="card-icon-left"><VideoIcon /></div>
          <div className="card-icon-right"><SaveIcon /></div>
        </div>
      </div>
    </div>
  );
}

export default function FaceSwap() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('image');
  const [sourcePreview, setSourcePreview] = useState(null);

  const tabs = [
    { id: 'image', label: 'Image Face Swap' },
    { id: 'video', label: 'Video Face Swap' },
    { id: 'dress', label: 'Dress Up' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = async (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!sourcePreview) {
      toast.error('Please upload your photo first');
      return;
    }

    // Navigate to create page with face swap parameters
    navigate(`/create?type=face_swap&target=${template.id}&source=${encodeURIComponent(sourcePreview)}`);
  };

  return (
    <div className="min-h-screen">
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
        onClick={() => fileInputRef.current?.click()}
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
            <FaceIcon />
          )}
        </div>
        
        <div className="upload-button-text">
          Custom Image Face Swap
        </div>
        
        <div className="upload-button-plus">+</div>
      </div>

      {/* 模板网格 */}
      <div className="cards-grid">
        {templates.map((template, index) => (
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
