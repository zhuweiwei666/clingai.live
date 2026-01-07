import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-full text-[16px] font-extrabold ${
        active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/10 text-white/60'
      }`}
    >
      {children}
    </button>
  );
}

function isVideoType(t) {
  return t === 'video' || t === 'photo_to_video' || t === 'photo2video';
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

  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      <div className="px-5 pt-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          aria-label="Back"
        >
          <BackIcon />
        </button>
        <div className="text-[26px] font-extrabold">My Works</div>
      </div>

      <div className="px-5 mt-5 flex gap-3">
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
        <div className="px-5 mt-8 grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-[22px] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 mt-20 text-center">
          <div className="text-white/60 text-[18px] mb-6">No works yet</div>
          <button
            onClick={() => navigate('/create')}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[18px] font-extrabold"
          >
            Create Your First Work
          </button>
        </div>
      ) : (
        <div className="px-5 mt-6 grid grid-cols-2 gap-4">
          {filtered.map((w) => {
            const id = w.taskId?._id || w.taskId || w._id || w.id;
            const thumb = w.thumbnail || w.outputUrl || w.output?.resultUrl || w.output?.videoUrl;
            return (
              <button
                key={w._id || w.id}
                className="relative aspect-[3/4] rounded-[22px] overflow-hidden bg-white/5"
                onClick={() => id && navigate(`/result?taskId=${id}`)}
              >
                {thumb ? (
                  isVideoType(w.type) ? (
                    <video src={thumb} className="w-full h-full object-cover" muted loop playsInline />
                  ) : (
                    <img src={thumb} alt={w.title || 'Work'} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                )}
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  {isVideoType(w.type) ? '▶' : '▢'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


