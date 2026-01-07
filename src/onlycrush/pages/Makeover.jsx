import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-[14px] py-4 text-[20px] font-extrabold ${
        active ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/40'
      }`}
    >
      {children}
    </button>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function Makeover() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const type = sp.get('type') || 'change_face_image';

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeTab = useMemo(() => {
    if (type === 'change_face_video') return 'video';
    if (type === 'dress_up') return 'dress';
    return 'image';
  }, [type]);

  const fallbackTemplates = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: `fallback-${activeTab}-${i}`,
        name: 'Template',
        thumbnail: '',
        isSuper: i % 3 === 0,
      })),
    [activeTab]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (activeTab === 'dress') {
          const res = await api.get('/tools/change_clothes_setting', { params: { page: 1, size: 99 } });
          setTemplates(res?.data?.templates || []);
        } else {
          const res = await api.post('/tools/get_by_file_type', { type: activeTab === 'video' ? 'video' : 'image', page: 1, size: 99 });
          setTemplates(res?.data?.templates || []);
        }
      } catch {
        setTemplates(fallbackTemplates);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab, fallbackTemplates]);

  const goTab = (t) => setSp({ type: t });

  return (
    <div className="min-h-screen bg-black px-5 pt-4 pb-24 text-white">
      <div className="flex items-center justify-between">
        <button className="text-white/90" onClick={() => navigate(-1)} aria-label="Back">
          <BackIcon />
        </button>
        <div className="w-7 h-7" />
      </div>

      <div className="mt-8 flex gap-4">
        <TabButton active={activeTab === 'image'} onClick={() => goTab('change_face_image')}>
          Image Face Swap
        </TabButton>
        <TabButton active={activeTab === 'video'} onClick={() => goTab('change_face_video')}>
          Video Face Swap
        </TabButton>
        <TabButton active={activeTab === 'dress'} onClick={() => goTab('dress_up')}>
          Dress Up
        </TabButton>
      </div>

      <button
        className="mt-8 w-full rounded-[18px] border border-white/15 bg-white/10 py-5 text-[26px] font-extrabold flex items-center justify-center gap-4"
        onClick={() => navigate('/create')}
      >
        <span className="text-white/80 text-[28px]">＋</span> Custom Image Face Swap
      </button>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[22px] bg-white/5 animate-pulse" />
            ))
          : templates.map((t) => (
              <button
                key={t._id || t.id}
                className="relative aspect-[3/4] rounded-[22px] overflow-hidden bg-white/5"
                onClick={() => navigate(`/create?templateId=${t._id || t.id}`)}
              >
                {t.thumbnail ? (
                  <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/10 via-white/5 to-white/0" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {t.isSuper ? (
                  <div className="absolute top-0 right-0 px-4 py-2 rounded-bl-[18px] bg-gradient-to-r from-pink-500 to-red-500 text-white font-extrabold">
                    Super
                  </div>
                ) : null}
              </button>
            ))}
      </div>
    </div>
  );
}


