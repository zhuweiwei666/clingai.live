import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '../utils/assetUrl';
import templateService from '../services/templateService';
import { handleApiError, withLoadingState } from '../utils/errorHandler';
import toast from 'react-hot-toast';

// 视频图标
const VideoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);

// 保存图标
const SaveIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 分类tabs配置
const categoryTabs = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'viral', label: 'Viral' },
  { id: 'cosplay', label: 'Cosplay' },
  { id: 'closeup', label: 'Close-up action' },
  { id: 'charm', label: 'Charm' },
];

// 视频卡片组件
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current && template.video) {
      videoRef.current.play().catch(() => {});
    }
  }, [template.video]);

  // Transform template to match expected format
  const transformedTemplate = {
    id: template._id || template.id,
    title: template.name || template.title,
    thumbnail: template.thumbnail,
    video: template.previewVideo || template.video,
    badge: template.isSuper ? 'super' : (template.isNew ? 'new' : null),
  };

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
        <span className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[14px] rounded-tr-[24px] text-[11px] font-bold text-white z-20">
          Super
        </span>
      )}
      
      {/* New 标签 */}
      {transformedTemplate.badge === 'new' && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[11px] font-bold text-white z-20">
          <span>🔥</span>
          <span>New</span>
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

export default function All() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load templates based on category
  const loadTemplates = async (category, pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;
      if (category === 'all') {
        response = await templateService.getAll({ page: pageNum, limit: 20 });
      } else if (category === 'new') {
        const newResponse = await templateService.getNew(20);
        // Transform to match pagination format
        const templates = newResponse?.templates || [];
        response = { 
          templates, 
          pagination: { 
            page: 1, 
            limit: 20, 
            total: templates.length, 
            pages: 1 
          } 
        };
      } else {
        // For other categories (viral, cosplay, closeup, charm), use tag filter
        response = await templateService.getAll({ page: pageNum, limit: 20, tag: category });
      }

      // apiClient interceptor already extracts data, so response is { templates, pagination }
      const newTemplates = response?.templates || [];
      const pagination = response?.pagination;
      
      if (append) {
        setTemplates(prev => [...prev, ...newTemplates]);
      } else {
        setTemplates(newTemplates);
      }

      // Check if there are more pages
      if (pagination) {
        setHasMore(pageNum < pagination.pages);
      } else {
        // If no pagination info, assume more if we got a full page
        setHasMore(newTemplates.length === 20);
      }
    } catch (error) {
      handleApiError(error, {
        defaultMessage: 'Failed to load templates',
        showToast: !append, // Don't show toast when loading more fails
      });
      if (!append) {
        setTemplates([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load templates when category changes
  useEffect(() => {
    setPage(1);
    setTemplates([]);
    loadTemplates(activeCategory, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Load more when 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadTemplates(activeCategory, nextPage, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeCategory, hasMore, loadingMore, loading]);

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* 分类 Tabs */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#262626]">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-[#141414] text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 加载状态 */}
      {loading && templates.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white">Loading templates...</div>
        </div>
      ) : (
        <>
          {/* 模板网格 */}
          {templates.length > 0 && (
            <div className="cards-grid px-4 py-6">
              {templates.map((template, index) => (
                <VideoCard key={template._id || template.id} template={template} index={index} />
              ))}
            </div>
          )}

          {/* 加载更多指示器 */}
          {loadingMore && (
            <div className="flex items-center justify-center py-6">
              <div className="text-white/60">Loading more...</div>
            </div>
          )}

          {/* 没有更多内容 */}
          {!hasMore && templates.length > 0 && (
            <div className="flex items-center justify-center py-6">
              <div className="text-white/60">No more templates</div>
            </div>
          )}

          {/* 空状态 */}
          {!loading && templates.length === 0 && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-white/60">No templates found</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

