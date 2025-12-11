import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { agentService } from '../services/agentService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import { useCache } from '../hooks/useCache';
import { CACHE_KEYS } from '../utils/cache';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // 使用缓存Hook加载数据
  const { data: featuredStreamers = [], loading, refresh } = useCache(
    CACHE_KEYS.AGENTS_LIST,
    async () => {
      const response = await agentService.getList();
      return response.data || [];
    },
    {
      ttl: 10 * 60 * 1000, // 10分钟缓存
      enableCache: true,
    }
  );

  const handleStreamerClick = (streamerId, e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('请先登录后再开始聊天');
      navigate('/login', { state: { from: { pathname: `/chat/${streamerId}` } } });
    }
  };

  // 下拉刷新处理
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    
    // 只有在顶部且向下滑动时才显示刷新提示
    if (scrollTop === 0 && touchEndY.current > touchStartY.current) {
      const pullDistance = touchEndY.current - touchStartY.current;
      if (pullDistance > 50 && !isRefreshing) {
        // 可以显示刷新提示
      }
    }
  };

  const handleTouchEnd = () => {
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    const pullDistance = touchEndY.current - touchStartY.current;
    
    // 在顶部且下拉超过80px时触发刷新
    if (scrollTop === 0 && pullDistance > 80 && !isRefreshing) {
      handleRefresh();
    }
    
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success('刷新成功');
    } catch (error) {
      toast.error('刷新失败');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };


  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* 下拉刷新指示器 */}
      {isRefreshing && (
        <div className="fixed top-[60px] left-0 right-0 z-50 flex items-center justify-center py-2 bg-dark-primary/95 backdrop-blur-lg">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <div className="w-4 h-4 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
            <span>刷新中...</span>
      </div>
      </div>
      )}

      {/* 主播卡片网格 */}
      <div
        className="flex-1 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={scrollContainerRef}
      >
      {loading ? (
        <div className="grid-cards">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-image skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-cards">
          {featuredStreamers.map((streamer, index) => {
            // 使用后端返回的字段名 (_id, avatarUrl, etc.)
            const streamerId = streamer._id;
            const avatarUrl = streamer.avatarUrl || streamer.avatar;
            
            return (
              <motion.div
                key={streamerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={`/chat/${streamerId}`}
                  onClick={(e) => handleStreamerClick(streamerId, e)}
                  className="card block group"
                >
                  <div className="card-image">
                    <img
                      src={avatarUrl || '/placeholder-avatar.jpg'}
                      alt={streamer.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop';
                      }}
                    />
                    
                    {/* 在线状态 */}
                    {streamer.status === 'online' && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse" />
                      </div>
                    )}
                    
                    {/* 底部渐变覆盖层 */}
                    <div className="card-overlay">
                      <h3 className="card-title line-clamp-1">{streamer.name}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
