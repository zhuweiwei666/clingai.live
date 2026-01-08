import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock templates for fallback when API is unavailable
const MOCK_TEMPLATES = [
  { id: '1', title: 'Bikini Beach', thumbnail: '/images/face-swap/face-1.jpg', video: '/videos/trending/video-1.mp4', isTrending: true },
  { id: '2', title: 'Summer Pool', thumbnail: '/images/face-swap/face-2.jpg', video: '/videos/trending/video-2.mp4', isTrending: true },
  { id: '3', title: 'Sunset Dance', thumbnail: '/images/face-swap/face-3.jpg', video: '/videos/trending/video-3.mp4', isNew: true },
  { id: '4', title: 'Night Club', thumbnail: '/images/face-swap/face-4.jpg', video: '/videos/trending/video-4.mp4' },
  { id: '5', title: 'Beach Party', thumbnail: '/images/face-swap/face-5.jpg', video: '/videos/all/video-1.mp4', isTrending: true },
  { id: '6', title: 'Poolside', thumbnail: '/images/face-swap/face-6.jpg', video: '/videos/all/video-2.mp4', isNew: true },
  { id: '7', title: 'Glamour', thumbnail: '/images/face-swap/face-7.jpg', video: '/videos/all/video-3.mp4' },
  { id: '8', title: 'Elegant', thumbnail: '/images/face-swap/face-8.jpg', video: '/videos/all/video-4.mp4' },
];

// Assets helper
const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Category tabs - no emojis in button, matching target
const categoryTabs = [
  { id: 'trending', label: 'Trending', isDefault: true },
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'cosplay', label: 'CosPlay' },
  { id: 'closeup', label: 'Close-up action' },
  { id: 'charm', label: 'Charm' },
];

// Icons
function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// VideoCard component - matching target design exactly
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const tpl = {
    id: template._id || template.id,
    title: template.name || template.title || '',
    thumbnail: template.thumbnail,
    video: template.previewVideo || template.video,
    badge: template.isTrending ? 'trending' : template.isNew ? 'new' : null,
    isSuper: template.isSuper,
  };

  // IntersectionObserver for lazy video play
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {});
        } else if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="video-card relative aspect-[3/4] overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/create?template=${tpl.id}`)}
      style={{
        borderRadius: '16px',
        background: '#0a0a0a',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {tpl.video ? (
        <video
          ref={videoRef}
          src={assetUrl(tpl.video)}
          poster={assetUrl(tpl.thumbnail)}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={assetUrl(tpl.thumbnail)}
          alt={tpl.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Super badge - top right corner */}
      {tpl.isSuper && (
        <span
          className="absolute top-0 right-0 px-2 py-1 text-[9px] font-bold text-white z-20"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 16px 0 8px',
          }}
        >
          Super
        </span>
      )}

      {/* Hot AI watermark */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className="text-[10px] font-bold"
          style={{
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'Notable, sans-serif',
            letterSpacing: '0.5px',
          }}
        >
          Hot AI
        </span>
      </div>

      {/* Gradient overlay - more subtle */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 30%, transparent 60%)',
        }}
      />

      {/* Badge - New or Trending - pill style */}
      {tpl.badge === 'new' && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 z-20"
          style={{ 
            background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
            boxShadow: '0 2px 10px rgba(249,115,22,0.4)',
          }}
        >
          <span>🔥</span> New <span>🔥</span>
        </div>
      )}
      {tpl.badge === 'trending' && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 z-20"
          style={{ 
            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            boxShadow: '0 2px 10px rgba(236,72,153,0.4)',
          }}
        >
          <span>🔥</span> Trending <span>🔥</span>
        </div>
      )}

      {/* Title at bottom */}
      <div className="absolute bottom-2.5 left-0 right-0 text-center z-20 px-2">
        <span
          className="text-white text-xs font-bold uppercase tracking-wider"
          style={{ 
            textShadow: '0 2px 10px rgba(0,0,0,1)',
            fontFamily: 'Livvic, sans-serif',
          }}
        >
          {tpl.title}
        </span>
      </div>
    </div>
  );
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] to-[#1a1a1a]" />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('trending');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  // Fetch templates - with fallback to mock data
  const fetchTemplates = useCallback(async (cat, pg = 1, append = false) => {
    // Only fetch page 1, disable infinite scroll when using mock data
    if (pg > 1) {
      setHasMore(false);
      return;
    }
    
    try {
      if (pg === 1) setLoading(true);
      let res;
      if (cat === 'trending') {
        res = await api.get(`/templates/trending?limit=20&page=${pg}`);
      } else if (cat === 'new') {
        res = await api.get(`/templates/new?limit=20&page=${pg}`);
      } else {
        res = await api.get(`/templates?category=${cat}&limit=20&page=${pg}`);
      }
      const data = res.data || res;
      const list = data.templates || [];
      if (list.length > 0) {
        if (append) {
          setTemplates((prev) => [...prev, ...list]);
        } else {
          setTemplates(list);
        }
        setHasMore(list.length >= 20);
      } else {
        // API returned empty, use mock data
        setTemplates(MOCK_TEMPLATES);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
      // Use mock data on error
      if (!append) {
        setTemplates(MOCK_TEMPLATES);
      }
      setHasMore(false); // Stop infinite scroll on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchTemplates(activeCategory, 1, false);
  }, [activeCategory, fetchTemplates]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTemplates(activeCategory, nextPage, true);
        }
      },
      { rootMargin: '200px' }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, activeCategory, fetchTemplates]);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Section Header */}
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <span className="text-white text-sm font-bold">Trending: Photo to video</span>
        </div>
        <button
          onClick={() => navigate('/all')}
          className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white transition-colors"
        >
          See All
          <span className="text-purple-400">
            <ArrowRightIcon />
          </span>
        </button>
      </div>

      {/* Category Tabs - hidden as they're now part of the All page per target */}
      {/* The home page on target doesn't show category tabs, just trending */}

      {/* 2-Column Grid */}
      <div className="px-4">
        {loading && templates.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 text-white/60">No templates found</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl, i) => (
              <VideoCard key={tpl._id || tpl.id || i} template={tpl} index={i} />
            ))}
          </div>
        )}
        {/* Infinite scroll sentinel */}
        {hasMore && <div ref={observerRef} className="h-10" />}
      </div>
    </div>
  );
}
