import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { generationService } from '../services/generationService';
import { uploadService } from '../services/uploadService';
import useUserStore from '../store/userStore';
import { assetUrl } from '../utils/assetUrl';

// Icons
const ShirtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// Sample dress-up templates
const templates = [
  { id: '1', title: 'Elegant Dress', thumbnail: '/templates/1.jpg', badge: 'super' },
  { id: '2', title: 'Casual Style', thumbnail: '/templates/2.jpg', badge: 'new' },
  { id: '3', title: 'Swimwear', thumbnail: '/templates/3.jpg', badge: 'hot' },
  { id: '4', title: 'Lingerie', thumbnail: '/templates/4.jpg', badge: 'viral' },
  { id: '5', title: 'Office Wear', thumbnail: '/templates/5.jpg', badge: null },
  { id: '6', title: 'Party Dress', thumbnail: '/templates/6.jpg', badge: 'super' },
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
          <div className="card-icon-left"><ShirtIcon /></div>
          <div className="card-title">{template.title}</div>
          <div className="card-icon-right"><SaveIcon /></div>
        </div>
      </div>
    </div>
  );
}

export default function DressUp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('All');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDressUp = async (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload your photo first');
      return;
    }

      setIsProcessing(true);
    try {
      // 1. Upload image
      toast.loading('Uploading image...', { id: 'dressup' });
      const uploadResult = await uploadService.uploadImage(uploadedImage);
      
      if (!uploadResult || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }
      
      // 2. Start task
      toast.loading('Starting Dress Up...', { id: 'dressup' });
      const result = await generationService.dressUp(uploadResult.url, template.id);
      
      if (result && result.taskId) {
        toast.success('Task created! Check My Works later.', { id: 'dressup' });
        navigate('/profile');
      } else {
        toast.error('Failed to create task', { id: 'dressup' });
      }
    } catch (error) {
      console.error('Dress up failed:', error);
      toast.error(error.message || 'Dress up failed', { id: 'dressup' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="section-header">
        <span className="fire-emoji">👗</span>
        <span className="title-text">Virtual Try-On</span>
      </div>

      {/* Upload Area */}
      <div className="px-4 mb-6">
        <div
          className="upload-button m-0"
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
            {imagePreview ? (
          <img 
            src={imagePreview} 
                alt="" 
                className="w-full h-full object-cover rounded-xl"
          />
            ) : (
              <ShirtIcon />
            )}
          </div>
          
          <div className="upload-button-text">
            {isProcessing ? 'Processing...' : 'Upload Your Photo'}
          </div>
          
          {!isProcessing && <div className="upload-button-plus">+</div>}
        </div>
      </div>

      {/* Categories */}
      <div className="function-tabs mb-2">
            {['All', 'Dress', 'Casual', 'Swimwear', 'Lingerie'].map((category) => (
              <button
                key={category}
            onClick={() => setActiveTab(category)}
            className={`function-tab ${activeTab === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

      {/* Templates Grid */}
      <div className="cards-grid">
            {templates.map((template, index) => (
          <TemplateCard
                key={template.id}
            template={template}
            index={index}
            onSelect={handleDressUp}
          />
            ))}
          </div>
    </div>
  );
}
