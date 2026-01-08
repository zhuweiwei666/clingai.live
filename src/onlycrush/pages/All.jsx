import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  { id: '9', title: 'Dance Floor', thumbnail: '/images/face-swap/face-1.jpg', video: '/videos/all/video-5.mp4', isNew: true },
];

// Assets helper
const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Category tabs - matching target exactly
const categoryTabs = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'cosplay', label: 'CosPlay' },
  { id: 'closeup', label: 'Close-up action' },
  { id: 'charm', label: 'Charm' },
];

// Icons
function HeartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// VideoCard component - 3 column optimized
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const tpl = {
    id: template._id || template.id,
    title: template.name || template.title || '',
    thumbnail: template.thumbnail,
    video: template.previewVideo || template.video,
    badge: template.isTrending ? 'trending' : template.isNew ? 'new' : null,
  };

  useEffect(() => {
    if (videoRef.current && tpl.video) {
      videoRef.current.play().catch(() => {});
    }
  }, [tpl.video]);

  return (
    <div
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] cursor-pointer transition-transform duration-200 active:scale-95"
      onClick={() => navigate(`/create?template=${tpl.id}`)}
    >
      {tpl.video ? (
        <video
          ref={videoRef}
          src={assetUrl(tpl.video)}
          poster={assetUrl(tpl.thumbnail)}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(tpl.thumbnail)}
          alt={tpl.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Hot AI watermark */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className="text-[10px] font-bold italic"
          style={{
            color: 'rgba(255,255,255,0.4)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          Hot AI
        </span>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Badge */}
      {tpl.badge === 'new' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 z-20"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}>
          <span>🔥</span> New <span>🔥</span>
        </div>
      )}
      {tpl.badge === 'trending' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 z-20"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>
          <span>🔥</span> Trending <span>🔥</span>
        </div>
      )}

      {/* Title */}
      <div className="absolute bottom-2 left-0 right-0 text-center z-20 px-1">
        <span className="text-white text-xs font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
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

export default function All() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
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
      if (cat === 'new') {
        res = await api.get(`/templates/new?limit=21&page=${pg}`);
      } else if (cat === 'all') {
        res = await api.get(`/templates?limit=21&page=${pg}`);
      } else {
        res = await api.get(`/templates?category=${cat}&limit=21&page=${pg}`);
      }
      const data = res.data || res;
      const list = data.templates || [];
      if (list.length > 0) {
        if (append) {
          setTemplates((prev) => [...prev, ...list]);
        } else {
          setTemplates(list);
        }
        setHasMore(list.length >= 21);
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
      {/* Category Tabs - sticky at top */}
      <div className="sticky top-0 z-50 bg-black pt-2 pb-3">
        <div className="flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide">
          {/* Heart icon */}
          <button className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-white/40 flex-shrink-0">
            <HeartIcon />
          </button>

          {/* Tabs */}
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === tab.id
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="px-3 pt-2">
        {loading && templates.length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 text-white/60">No templates found</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
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
