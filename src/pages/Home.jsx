import { Link, useNavigate } from 'react-router-dom';
import { Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { agentService } from '../services/agentService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [featuredStreamers, setFeaturedStreamers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedStreamers();
  }, []);

  const handleStreamerClick = (streamerId, e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('请先登录后再开始聊天');
      navigate('/login', { state: { from: { pathname: `/chat/${streamerId}` } } });
    }
  };

  const loadFeaturedStreamers = async () => {
    try {
      setLoading(true);
      const response = await agentService.getList();
      // 后端返回: { success, data: [...] }
      // 显示所有AI伴侣
      const agents = response.data || [];
      setFeaturedStreamers(agents);
    } catch (error) {
      console.error('加载推荐AI伴侣失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟徽章数据
  const getBadge = (index) => {
    const badges = [
      { type: 'super', label: 'Super', icon: Crown },
      { type: 'new', label: '🔥 New 🔥', icon: null },
      { type: 'viral', label: '🔥 火爆 🔥', icon: null },
      { type: 'hot', label: 'HOT', icon: Zap },
      null,
      { type: 'new', label: '✨ 新人 ✨', icon: null },
    ];
    return badges[index % badges.length];
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* 热门推荐区 */}
      <div className="section-header">
        <span className="text-2xl">🔥</span>
        <span className="gradient-text font-bold">热门推荐: AI伴侣</span>
      </div>

      {/* 主播卡片网格 */}
      {loading ? (
        <div className="grid-cards">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-image skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-cards">
          {featuredStreamers.map((streamer, index) => {
            const badge = getBadge(index);
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
                    
                    {/* 顶部徽章 */}
                    {badge && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`badge badge-${badge.type}`}>
                          {badge.icon && <badge.icon size={12} />}
                          {badge.label}
                        </span>
                      </div>
                    )}
                    
                    {/* 在线状态 */}
                    {streamer.status === 'online' && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse" />
                      </div>
                    )}
                    
                    {/* 底部渐变覆盖层 */}
                    <div className="card-overlay">
                      <h3 className="card-title line-clamp-1">{streamer.name}</h3>
                      {index % 3 === 0 && (
                        <span className="badge badge-new w-fit">
                          🔥 New 🔥
                        </span>
                      )}
                      {index % 3 === 1 && (
                        <span className="badge badge-viral w-fit">
                          🔥 火爆 🔥
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
