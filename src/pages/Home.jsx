import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '../utils/assetUrl';
import templateService from '../services/templateService';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

// 视频图标 - 两个矩形 (Consistent with Layout)
const VideoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);

// 保存图标 (Consistent with Layout)
const SaveIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 分类tabs配置（用于首页）
const categoryTabs = [
  { id: 'trending', label: '🔥 Trending', icon: '🔥' },
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'viral', label: 'Viral' },
  { id: 'cosplay', label: 'Cosplay' },
  { id: 'closeup', label: 'Close-up action' },
  { id: 'charm', label: 'Charm' },
];

// 视频卡片组件 - 自动播放视频
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Transform template to match expected format
  const transformedTemplate = {
    id: template._id || template.id,
    title: template.name || template.title,
    thumbnail: template.thumbnail,
    video: template.previewVideo || template.video,
    badge: template.isSuper ? 'super' : (template.isNew ? 'new' : null),
  };

  useEffect(() => {
    // 视频自动播放
    if (videoRef.current && transformedTemplate.video) {
      videoRef.current.play().catch(() => {});
    }
  }, [transformedTemplate.video]);

  return (
    <div
      className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/create?template=${transformedTemplate.id}`)}
    >
      {/* 视频或图片 */}
      {transformedTemplate.video ? (
        <video
          ref={videoRef}
          src={assetUrl(transformedTemplate.video)}
          poster={assetUrl(transformedTemplate.thumbnail)}
          muted
          loop
          playsInline
          autoPlay
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(transformedTemplate.thumbnail)}
          alt={transformedTemplate.title}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setVideoLoaded(true)}
        />
      )}
      
      {/* 渐变遮罩 */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)'
        }}
      />
      
      {/* Super 标签 */}
      {transformedTemplate.badge === 'super' && (
        <span className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[16px] rounded-tr-[20px] text-[10px] font-bold text-white z-20 shadow-md">
          SUPER
        </span>
      )}
      
      {/* New 标签 */}
      {transformedTemplate.badge === 'new' && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[10px] font-bold text-white z-20 shadow-lg shadow-orange-500/20">
          <span>🔥</span>
          <span className="uppercase tracking-wider">New</span>
          <span>🔥</span>
        </div>
      )}
      
      {/* 底部：图标 + 标题 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 z-20">
        <div className="text-white/90">
          <VideoIcon />
        </div>
        <div className="flex-1 text-center text-[11px] font-bold text-white uppercase tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          {transformedTemplate.title}
        </div>
        <div className="text-white/90">
          <SaveIcon />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('trending');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load templates based on category
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        let response;
        
        if (activeCategory === 'trending') {
          response = await templateService.getTrending(79);
        } else if (activeCategory === 'new') {
          response = await templateService.getNew(79);
        } else {
          response = await templateService.getAll({ category: activeCategory, limit: 79 });
        }

        setTemplates(response.templates || []);
              } catch (error) {
                handleApiError(error, {
                  defaultMessage: 'Failed to load templates',
                });
                setTemplates([]);
              } finally {
                setLoading(false);
              }
    };

    loadTemplates();
  }, [activeCategory]);

  return (
    <div className="min-h-screen">
      {/* 分类 Tabs */}
      <div className="sticky top-[calc(60px+env(safe-area-inset-top))] z-40 bg-black/95 backdrop-blur-md border-b border-[#262626] pt-1 pb-1">
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
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <div>
          <span className="fire-emoji">🔥</span>
          <span className="title-text">Trending: Photo to video</span>
        </div>
        <button
          onClick={() => navigate('/all')}
          className="flex items-center gap-1 text-white text-sm font-medium hover:opacity-80 transition-opacity"
        >
          See All
          <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white">Loading templates...</div>
        </div>
      ) : (
        /* 视频卡片网格 */
        <div className="cards-grid">
          {templates.map((template, index) => (
            <VideoCard key={template._id || template.id} template={template} index={index} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && templates.length === 0 && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/60">No templates found</div>
        </div>
      )}
    </div>
  );
}
