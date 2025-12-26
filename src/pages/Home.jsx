import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Flame, Sparkles } from 'lucide-react';
import templateService from '../services/templateService';

// Video Card Component with hover play
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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

  const handleClick = () => {
    navigate(`/create?template=${template.id}`);
  };

  // Get tag badge
  const renderBadge = () => {
    if (template.tags.includes('super')) {
      return <span className="badge badge-super">Super</span>;
    }
    if (template.tags.includes('new')) {
      return <span className="badge badge-new">🔥 New</span>;
    }
    if (template.tags.includes('hot')) {
      return <span className="badge badge-hot">Hot</span>;
    }
    if (template.tags.includes('viral')) {
      return <span className="badge badge-viral">Viral</span>;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="card-image">
        {/* Thumbnail Image */}
        <img
          src={template.thumbnail}
          alt={template.title}
          className={`transition-opacity duration-300 ${isHovering && isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />
        
        {/* Video (shows on hover) */}
        {template.videoUrl && (
          <video
            ref={videoRef}
            src={template.videoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering && isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          />
        )}

        {/* Overlay */}
        <div className="card-overlay">
          {/* Badge */}
          <div className="absolute top-3 right-3">
            {renderBadge()}
          </div>

          {/* Video indicator */}
          {template.videoUrl && (
            <div className="absolute top-3 left-3">
              <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="card-title line-clamp-2">{template.title}</h3>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton Loading
function SkeletonCard() {
  return (
    <div className="skeleton aspect-[3/4] rounded-3xl" />
  );
}

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('trending');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // For now, use sample data since backend might not be running
      const sampleTemplates = [
        {
          id: '1',
          title: 'Rub Her Body',
          thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
          videoUrl: null,
          category: 'photo_to_video',
          tags: ['super'],
          views: 12500,
        },
        {
          id: '2',
          title: 'Dance Motion',
          thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
          videoUrl: null,
          category: 'photo_to_video',
          tags: ['new', 'hot'],
          views: 8300,
        },
        {
          id: '3',
          title: 'Sexy Pose',
          thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
          videoUrl: null,
          category: 'photo_to_video',
          tags: ['viral'],
          views: 15600,
        },
        {
          id: '4',
          title: 'Beach Vibes',
          thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
          videoUrl: null,
          category: 'photo_to_video',
          tags: ['new'],
          views: 9800,
        },
        {
          id: '5',
          title: 'Mirror Selfie',
          thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
          videoUrl: null,
          category: 'photo_to_video',
          tags: ['super'],
          views: 11200,
        },
        {
          id: '6',
          title: 'Bedroom Scene',
          thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
          videoUrl: null,
          category: 'photo_to_video',
          tags: ['hot'],
          views: 7500,
        },
      ];
      setTemplates(sampleTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Section Header */}
      <div className="section-header">
        <Flame className="w-6 h-6 text-orange-500" />
        <span className="gradient-text font-bold">Trending: Photo to Video</span>
      </div>

      {/* Templates Grid */}
      <div className="grid-cards">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : (
          templates.map((template, index) => (
            <VideoCard key={template.id} template={template} index={index} />
          ))
        )}
      </div>

      {/* More sections can be added here */}
      <div className="section-header mt-6">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <span className="gradient-text font-bold">New Releases</span>
      </div>

      <div className="grid-cards">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : (
          templates.filter(t => t.tags.includes('new')).map((template, index) => (
            <VideoCard key={template.id} template={template} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
