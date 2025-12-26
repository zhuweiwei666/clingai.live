import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Sample templates
const faceSwapTemplates = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    badge: null,
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    badge: 'super',
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
    badge: null,
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    badge: 'new',
  },
  {
    id: '5',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    badge: null,
  },
  {
    id: '6',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
    badge: 'super',
  },
];

// Face swap icon
const FaceSwapIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="4" />
    <circle cx="16" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

// Template Card
function TemplateCard({ template, index, onSelect }) {
  return (
    <div
      className="video-card fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(template)}
    >
      <div className="video-card-media">
        <img
          src={template.thumbnail}
          alt={`Template ${template.id}`}
          loading="lazy"
        />
        
        <div className="video-card-overlay">
          {/* Badge */}
          {template.badge === 'super' && (
            <div className="card-badge">
              <span className="badge-super">Super</span>
            </div>
          )}
          {template.badge === 'new' && (
            <div className="card-badge">
              <span className="badge-new">New</span>
            </div>
          )}

          {/* Left icon - Video */}
          <div className="card-icon-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="8" height="16" rx="1" />
              <rect x="14" y="4" width="8" height="16" rx="1" />
            </svg>
          </div>

          {/* Right icon */}
          <div className="card-icon-right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FaceSwap() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('image');
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);

  const tabs = [
    { id: 'image', label: 'Image Face Swap' },
    { id: 'video', label: 'Video Face Swap' },
    { id: 'dress', label: 'Dress Up' },
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSourceImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = (template) => {
    if (sourceImage) {
      navigate(`/create?type=face_swap&target=${template.id}`);
    } else {
      // Open file picker first
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Function Tabs */}
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

      {/* Upload Button */}
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
              alt="Source" 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <FaceSwapIcon />
          )}
        </div>
        
        <div className="upload-button-text">
          <div className="upload-button-title">
            {sourcePreview ? 'Change Photo' : 'Custom Image Face Swap'}
          </div>
        </div>
        
        <div className="upload-button-plus">+</div>
      </div>

      {/* Templates Grid */}
      <div className="cards-grid">
        {faceSwapTemplates.map((template, index) => (
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
