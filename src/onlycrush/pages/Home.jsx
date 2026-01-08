import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

// VideoCard component - matching target design
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
          className="text-xs font-bold italic"
          style={{
            color: 'rgba(255,255,255,0.3)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            fontFamily: 'Notable, sans-serif',
          }}
        >
          Hot AI
        </span>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Badge - New or Trending */}
      {tpl.badge === 'new' && (
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 z-20"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' }}
        >
          <span>🔥</span> New <span>🔥</span>
        </div>
      )}
      {tpl.badge === 'trending' && (
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 z-20"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}
        >
          <span>🔥</span> Trending <span>🔥</span>
        </div>
      )}

      {/* Title at bottom - sentence case */}
      <div className="absolute bottom-3 left-0 right-0 text-center z-20 px-2">
        <span
          className="text-white text-sm font-bold uppercase tracking-wide"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
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

  // Fetch templates
  const fetchTemplates = useCallback(async (cat, pg = 1, append = false) => {
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
