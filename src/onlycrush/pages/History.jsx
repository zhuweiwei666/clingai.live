import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
  </svg>
);

// Filter chip
function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
        active
          ? 'text-white shadow-lg'
          : 'bg-white/5 text-white/50 hover:text-white/80'
      }`}
      style={active ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' } : {}}
    >
      {children}
    </button>
  );
}

function isVideoType(t) {
  return t === 'video' || t === 'photo_to_video' || t === 'photo2video';
}

// Work card with hover effect
function WorkCard({ work, onClick }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVideo = isVideoType(work.type);
  const thumb = work.thumbnail || work.outputUrl || work.output?.resultUrl || work.output?.videoUrl;
  
  // Random height for masonry effect (between 1 and 1.5)
  const heightMultiplier = useMemo(() => 1 + Math.random() * 0.5, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <button
      className="relative w-full rounded-2xl overflow-hidden bg-[#1a1a1a] group"
      style={{ aspectRatio: `3/${4 * heightMultiplier}` }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {thumb ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={thumb}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            loop
            playsInline
            poster={thumb}
          />
        ) : (
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Type indicator */}
      <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
        {isVideo ? <PlayIcon /> : <ImageIcon />}
      </div>

      {/* Status badge */}
      {work.status === 'processing' && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-yellow-500/80 text-black text-[10px] font-bold">
          Processing...
        </div>
      )}
      {work.status === 'failed' && (
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500/80 text-white text-[10px] font-bold">
          Failed
        </div>
      )}

      {/* Hover actions */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="text-white text-xs font-medium truncate">
          {work.title || new Date(work.createdAt).toLocaleDateString()}
        </div>
      </div>
    </button>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all | video | image
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState([]);

  const filtered = useMemo(() => {
    if (filter === 'video') return works.filter((w) => isVideoType(w.type));
    if (filter === 'image') return works.filter((w) => !isVideoType(w.type));
    return works;
  }, [filter, works]);

  // Split into two columns for masonry
  const [leftColumn, rightColumn] = useMemo(() => {
    const left = [];
    const right = [];
    filtered.forEach((w, i) => {
      if (i % 2 === 0) left.push(w);
      else right.push(w);
    });
    return [left, right];
  }, [filtered]);

  useEffect(() => {
    (async () => {
      if (!localStorage.getItem('token')) {
        navigate('/login');
        return;
      }
      setLoading(true);
      try {
        const res = await api.get('/user/works', { params: { page: 1, limit: 50 } });
        const list = res?.data?.works || [];
        setWorks(list);
      } catch (e) {
        toast.error(e?.message || 'Failed to load works');
        setWorks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleWorkClick = (work) => {
    const id = work.taskId?._id || work.taskId || work._id || work.id;
    if (id) navigate(`/result?taskId=${id}`);
  };

  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4 pt-[max(12px,env(safe-area-inset-top))]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold">My Works</h1>
        <div className="flex-1" />
        <span className="text-white/50 text-sm">{works.length} items</span>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </Chip>
        <Chip active={filter === 'video'} onClick={() => setFilter('video')}>
          Videos
        </Chip>
        <Chip active={filter === 'image'} onClick={() => setFilter('image')}>
          Images
        </Chip>
      </div>

      {loading ? (
        /* Loading skeleton */
        <div className="px-4 flex gap-3">
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{ aspectRatio: `3/${4 + i * 0.2}` }} />
            ))}
          </div>
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{ aspectRatio: `3/${4.5 - i * 0.2}` }} />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div
            className="w-24 h-24 rounded-3xl mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.2) 100%)' }}
          >
            <svg className="w-10 h-10 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <p className="text-white/60 text-lg mb-6">No works yet</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-full font-bold text-white text-lg shadow-xl active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
          >
            Create Your First Work ✨
          </button>
        </div>
      ) : (
        /* Masonry grid */
        <div className="px-4 flex gap-3">
          <div className="flex-1 space-y-3">
            {leftColumn.map((w) => (
              <WorkCard key={w._id || w.id} work={w} onClick={() => handleWorkClick(w)} />
            ))}
          </div>
          <div className="flex-1 space-y-3">
            {rightColumn.map((w) => (
              <WorkCard key={w._id || w.id} work={w} onClick={() => handleWorkClick(w)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
