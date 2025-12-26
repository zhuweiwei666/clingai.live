import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Sample video templates (mimicking OnlyCrush data)
const sampleTemplates = [
  {
    id: '1',
    title: 'RUB HER BODY',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: null,
  },
  {
    id: '2',
    title: 'PLAYING WITH EGGPLANT',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: 'super',
  },
  {
    id: '3',
    title: 'DANCE MOTION',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: 'new',
  },
  {
    id: '4',
    title: 'BEDROOM SCENE',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: null,
  },
  {
    id: '5',
    title: 'MIRROR SELFIE',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: 'super',
  },
  {
    id: '6',
    title: 'POOL PARTY',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: 'new',
  },
  {
    id: '7',
    title: 'BEACH VIBES',
    thumbnail: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: null,
  },
  {
    id: '8',
    title: 'WORKOUT SESSION',
    thumbnail: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop',
    videoUrl: null,
    type: 'video',
    badge: 'super',
  },
];

// Video Card Component
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = () => {
    navigate(`/create?template=${template.id}`);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && template.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="video-card fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-card-media">
        <img
          src={template.thumbnail}
          alt={template.title}
          loading="lazy"
        />
        
        {template.videoUrl && (
          <video
            ref={videoRef}
            src={template.videoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isHovering ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
          />
        )}

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

          {/* Left icon - Video indicator */}
          <div className="card-icon-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="8" height="16" rx="1" />
              <rect x="14" y="4" width="8" height="16" rx="1" />
            </svg>
          </div>

          {/* Right icon - Save/Add */}
          <div className="card-icon-right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>

          {/* Title */}
          <div className="card-title">{template.title}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [templates, setTemplates] = useState(sampleTemplates);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Section Header */}
      <div className="section-header">
        <span className="fire-emoji">🔥</span>
        <span className="gradient-text-orange font-bold">Trending: Photo to video</span>
      </div>

      {/* Video Cards Grid */}
      <div className="cards-grid">
        {templates.map((template, index) => (
          <VideoCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </div>
  );
}
