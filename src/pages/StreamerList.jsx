import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { agentService } from '../services/agentService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

// 带悬停播放视频的卡片组件
function StreamerCard({ streamer, index, onStreamerClick }) {
  const [isHovering, setIsHovering] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  
  const streamerId = streamer._id;
  const avatarUrl = streamer.avatarUrl || streamer.avatar;
  // 获取视频URL - 优先使用coverVideoUrl，然后是coverVideoUrls数组，最后是previewVideos
  const videoUrl = streamer.coverVideoUrl || 
    (streamer.coverVideoUrls && streamer.coverVideoUrls[0]) ||
    (streamer.previewVideos && streamer.previewVideos[0]);
  
  const hasVideo = videoUrl && !videoError;
  
  // 处理鼠标进入
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // 自动播放失败（可能是浏览器策略）
        setVideoError(true);
      });
    }
  };
  
  // 处理鼠标离开
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  
  // 处理触摸开始（移动端）
  const handleTouchStart = () => {
    if (!isHovering) {
      handleMouseEnter();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link
        to={`/chat/${streamerId}`}
        onClick={(e) => onStreamerClick(streamerId, e)}
        className="block relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
      >
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-dark-elevated">
          {/* 静态图片 - 默认显示 */}
          <img
            src={avatarUrl || '/placeholder-avatar.jpg'}
            alt={streamer.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isHovering && hasVideo && videoLoaded ? 'opacity-0' : 'opacity-100'
            } group-hover:scale-105`}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop';
            }}
          />
          
          {/* 视频 - 悬停时播放 */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovering && videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          
          {/* 视频播放指示器 */}
          {hasVideo && !isHovering && (
            <div className="absolute top-3 left-3 z-10">
              <div className="w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play size={14} className="text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          
          {/* 在线状态指示器 */}
          {streamer.status === 'online' && (
            <div className="absolute top-3 right-3 z-10">
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block shadow-lg shadow-green-500/50" />
            </div>
          )}
          
          {/* 底部信息覆盖层 */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles size={12} className="text-[#b8e986]" />
              <h3 className="font-semibold text-white text-sm">{streamer.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white/80">
                {streamer.style === 'realistic' ? 'realistic' : 'anime'}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-red-500/80 rounded-full text-white font-medium">
                AI
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function StreamerList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [streamers, setStreamers] = useState([]);
  const [allStreamers, setAllStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadStreamers();
  }, []);

  useEffect(() => {
    // 前端过滤
    if (filter === 'all') {
      setStreamers(allStreamers);
    } else {
      setStreamers(allStreamers.filter(a => a.style === filter));
    }
  }, [filter, allStreamers]);

  const handleStreamerClick = (streamerId, e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('请先登录后再开始聊天');
      navigate('/login', { state: { from: { pathname: `/chat/${streamerId}` } } });
    }
  };

  const loadStreamers = async () => {
    try {
      setLoading(true);
      const response = await agentService.getList();
      const agents = response.data || [];
      console.log('🎬 加载AI伴侣列表，检查视频URL:', agents.map(a => ({
        name: a.name,
        coverVideoUrl: a.coverVideoUrl,
        previewVideos: a.previewVideos
      })));
      setAllStreamers(agents);
      setStreamers(agents);
    } catch (error) {
      console.error('加载AI伴侣列表失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 筛选选项 - 参考iOS App设计
  const filterTabs = [
    { value: 'all', label: 'Popular', icon: '🔥' },
    { value: 'anime', label: 'Anime', icon: '✨' },
    { value: 'realistic', label: 'Realistic', icon: '📸' },
  ];

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* 标签筛选栏 - iOS风格 */}
      <div className="sticky top-[60px] z-40 bg-dark-primary/95 backdrop-blur-lg">
        <div className="p-4">
          <div className="flex items-center bg-dark-elevated/80 rounded-2xl p-1.5 border border-border/50">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  filter === tab.value
                    ? 'bg-[#b8e986] text-dark-primary shadow-lg'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主播列表 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 p-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />
          ))}
        </div>
      ) : streamers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-text-secondary text-lg mb-2">暂无AI伴侣</p>
          <p className="text-text-muted text-sm">换个分类试试吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4 pb-24">
          {streamers.map((streamer, index) => (
            <StreamerCard
              key={streamer._id}
              streamer={streamer}
              index={index}
              onStreamerClick={handleStreamerClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
