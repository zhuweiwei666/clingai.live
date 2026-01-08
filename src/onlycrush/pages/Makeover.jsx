import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Assets helper
const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Image Face Swap templates
const imageFaceSwapTemplates = [];

// Video Face Swap templates
const videoFaceSwapTemplates = [];

// Dress Up templates are fetched from upstream:
// GET /app/tools/change_clothes_setting?page=1&size=...

// Icons
function FaceSwapIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
      <path d="M8 11v4a2 2 0 0 0 2 2h3" />
      <path d="M16 13v-4a2 2 0 0 0-2-2h-3" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Video Template Card with auto-play
function VideoCard({ template, onClick }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <button
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] group"
      onClick={() => onClick(template)}
    >
      {template.videoUrl ? (
        <video
          ref={videoRef}
          src={assetUrl(template.videoUrl)}
          poster={assetUrl(template.thumbnailUrl)}
          muted
          loop
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(template.thumbnailUrl)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Super badge */}
      {template.isSuper && (
        <span
          className="absolute top-0 right-0 px-2.5 py-1 text-[10px] font-bold text-white z-10"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 16px 0 12px',
          }}
        >
          Super
        </span>
      )}
    </button>
  );
}

// Image Template Card
function ImageCard({ template, onClick }) {
  return (
    <button
      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1a1a1a] group"
      onClick={() => onClick(template)}
    >
      <img
        src={assetUrl(template.thumbnailUrl)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Super badge */}
      {template.isSuper && (
        <span
          className="absolute top-0 right-0 px-2.5 py-1 text-[10px] font-bold text-white z-10"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 16px 0 12px',
          }}
        >
          Super
        </span>
      )}
    </button>
  );
}

export default function Makeover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const type = searchParams.get('type') || 'change_face_image';
  const activeTab = type === 'change_face_video' ? 'video' : type === 'change_clothes' ? 'dressup' : 'image';

  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [dressUpTemplates, setDressUpTemplates] = useState([]);
  const [dressUpLoading, setDressUpLoading] = useState(false);
  const [faceImages, setFaceImages] = useState([]);
  const [faceVideos, setFaceVideos] = useState([]);
  const [faceLoading, setFaceLoading] = useState(false);

  const tabs = [
    { id: 'image', label: 'Image Face Swap', type: 'change_face_image' },
    { id: 'video', label: 'Video Face Swap', type: 'change_face_video' },
    { id: 'dressup', label: 'Dress Up', type: 'change_clothes' },
  ];

  const handleTabChange = (tab) => {
    setSearchParams({ type: tab.type });
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setSourcePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleTemplateClick = useCallback((template) => {
    navigate(`/create?templateId=${template.id}&type=${type}`);
  }, [navigate, type]);

  const handleCustomClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fileInputRef.current?.click();
  }, [isAuthenticated, navigate]);

  // Fetch Dress Up templates from upstream (1:1)
  useEffect(() => {
    if (activeTab !== 'dressup') return;
    let cancelled = false;
    (async () => {
      setDressUpLoading(true);
      try {
        // Target format: { code: 100, msg: "OK", data: { list: [...], total } }
        const res = await api.get('/app/tools/change_clothes_setting?page=1&size=200');
        const list = res?.data?.data?.list;
        if (!Array.isArray(list)) {
          throw new Error('Invalid dressup list');
        }
        const normalized = list
          .filter((it) => it?.url)
          .map((it) => ({
            id: String(it.tools_id ?? it.id),
            thumbnailUrl: it.url,
            // Some entries are paid / super-like
            isSuper: Number(it.coins || 0) >= 20,
            coins: Number(it.coins || 0),
            toolsId: it.tools_id,
            fileType: it.file_type,
          }));
        if (!cancelled) setDressUpTemplates(normalized);
      } catch (e) {
        if (!cancelled) {
          console.error('Fetch dress up templates error:', e);
          setDressUpTemplates([]);
        }
      } finally {
        if (!cancelled) setDressUpLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Fetch system photos for face swap (1:1)
  useEffect(() => {
    if (activeTab !== 'image' && activeTab !== 'video') return;
    let cancelled = false;
    (async () => {
      setFaceLoading(true);
      try {
        const sourceType = activeTab === 'image' ? 'change_face_image' : 'change_face_video';
        const res = await api.post('/app/photos', {
          is_system: true,
          page: 1,
          size: 99,
          type: '',
          source_type: sourceType,
        });
        const list = res?.data?.data?.list;
        if (!Array.isArray(list)) throw new Error('Invalid photos list');
        const normalized = list
          .filter((it) => it?.url)
          .map((it) => ({
            id: String(it.id ?? it.url),
            thumbnailUrl: activeTab === 'image' ? it.url : '',
            videoUrl: activeTab === 'video' ? it.url : '',
            isSuper: false,
            fileType: sourceType,
          }));
        if (cancelled) return;
        if (activeTab === 'image') setFaceImages(normalized);
        else setFaceVideos(normalized);
      } catch (e) {
        console.error('Fetch system photos error:', e);
        if (!cancelled) {
          if (activeTab === 'image') setFaceImages([]);
          else setFaceVideos([]);
        }
      } finally {
        if (!cancelled) setFaceLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Get templates based on active tab
  const templates = activeTab === 'video'
    ? faceVideos
    : activeTab === 'dressup'
    ? dressUpTemplates
    : faceImages;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Tabs - pill style matching target */}
      <div className="sticky top-0 z-50 bg-black pt-4 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'bg-transparent text-white/50 hover:text-white/80'
              }`}
              style={
                activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }
                  : {}
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom upload + Search - matching target design */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={handleCustomClick}
          className="w-full bg-[#1a1a1a] hover:bg-[#222] rounded-2xl py-4 flex items-center justify-center gap-3 text-white font-bold transition-all border border-white/10"
        >
          <FaceSwapIcon />
          <PlusIcon />
          <span>
            Custom{' '}
            {activeTab === 'dressup' ? 'Dress Up' : activeTab === 'video' ? 'Video Face Swap' : 'Image Face Swap'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Search box - matching target */}
      <div className="px-4 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 pl-11 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Template grid - 2 columns, no titles on cards */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {(activeTab === 'dressup' && dressUpLoading) || ((activeTab === 'image' || activeTab === 'video') && faceLoading)
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="aspect-[3/4] rounded-2xl bg-[#1a1a1a] animate-pulse" />
              ))
            : templates.map((template) =>
                activeTab === 'video' ? (
                  <VideoCard key={template.id} template={template} onClick={handleTemplateClick} />
                ) : (
                  <ImageCard key={template.id} template={template} onClick={handleTemplateClick} />
                )
              )}
        </div>
      </div>

      {/* Preview if source selected */}
      {sourcePreview && (
        <div className="fixed bottom-24 right-4 z-40">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-green-500 shadow-lg">
            <img src={sourcePreview} alt="Your photo" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setSourceFile(null);
                setSourcePreview(null);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
