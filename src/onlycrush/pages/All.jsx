import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

// Assets helper
const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Category tabs
const categoryTabs = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'New' },
  { id: 'viral', label: 'Viral' },
  { id: 'cosplay', label: 'Cosplay' },
  { id: 'closeup', label: 'Close-up' },
  { id: 'charm', label: 'Charm' },
];

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

// VideoCard component
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const tpl = {
    id: template._id || template.id,
    title: template.name || template.title || '',
    thumbnail: template.thumbnail,
    video: template.previewVideo || template.video,
    badge: template.isSuper ? 'super' : template.isNew ? 'new' : null,
  };

  useEffect(() => {
    if (videoRef.current && tpl.video) {
      videoRef.current.play().catch(() => {});
    }
  }, [tpl.video]);

  return (
    <div
      className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.05}s` }}
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

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)' }}
      />

      {/* Super badge */}
      {tpl.badge === 'super' && (
        <span className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[16px] rounded-tr-[20px] text-[10px] font-bold text-white z-20 shadow-md">
          SUPER
        </span>
      )}

      {/* New badge */}
      {tpl.badge === 'new' && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[10px] font-bold text-white z-20 shadow-lg">
          <span>🔥</span>
          <span className="uppercase tracking-wider">New</span>
          <span>🔥</span>
        </div>
      )}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 z-20">
        <div className="text-white/90">
          <VideoIcon />
        </div>
        <div className="flex-1 text-center text-[11px] font-bold text-white uppercase tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          {tpl.title}
        </div>
        <div className="text-white/90">
          <SaveIcon />
        </div>
      </div>
    </div>
  );
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[#141414] animate-pulse">
      <div className="absolute inset-0 skeleton-shimmer" />
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

  // Fetch templates
  const fetchTemplates = useCallback(async (cat, pg = 1, append = false) => {
    try {
      if (pg === 1) setLoading(true);
      let res;
      if (cat === 'trending') {
        res = await api.get(`/templates/trending?limit=20&page=${pg}`);
      } else if (cat === 'new') {
        res = await api.get(`/templates/new?limit=20&page=${pg}`);
      } else if (cat === 'all') {
        res = await api.get(`/templates?limit=20&page=${pg}`);
      } else {
        res = await api.get(`/templates?category=${cat}&limit=20&page=${pg}`);
      }
      const data = res.data || res;
      const list = data.templates || [];
      if (append) {
        setTemplates((prev) => [...prev, ...list]);
      } else {
        setTemplates(list);
      }
      setHasMore(list.length >= 20);
    } catch (err) {
      console.error('Fetch templates error:', err);
      if (!append) setTemplates([]);
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
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">All Templates</h1>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[56px] z-40 bg-black/95 backdrop-blur-md border-b border-[#262626]">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#141414] text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pt-4">
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

