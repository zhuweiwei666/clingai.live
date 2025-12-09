import { Link, useNavigate } from 'react-router-dom';
import { Crown, Zap, Heart, ChevronRight } from 'lucide-react';
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
      // 取前8个作为推荐
      const agents = response.data || [];
      setFeaturedStreamers(agents.slice(0, 8));
    } catch (error) {
      console.error('加载推荐AI伴侣失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 顶部分类标签
  const categories = [
    { id: 'all', label: 'AI伴侣', active: true },
    { id: 'chat', label: '私密聊天', active: false },
    { id: 'video', label: '视频生成', active: false },
    { id: 'image', label: '图片生成', active: false },
  ];

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
      {/* 分类标签栏 */}
      <div className="tab-nav">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`tab-item ${cat.active ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

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

      {/* 查看更多按钮 */}
      <div className="px-4 py-6">
        <Link
          to="/streamers"
          className="flex items-center justify-center gap-2 w-full py-4 bg-dark-elevated border border-border rounded-2xl text-text-secondary hover:text-text-primary hover:border-accent-start transition-all"
        >
          <span>查看更多AI伴侣</span>
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* 功能特色区 */}
      <div className="px-4 pb-8">
        <div className="section-header px-0 mb-4">
          <span className="text-2xl">✨</span>
          <span className="gradient-text font-bold">特色功能</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '💬', title: '私密聊天', desc: '专属AI伴侣对话', color: 'from-pink-500 to-rose-500' },
            { icon: '🎬', title: '视频生成', desc: '生成专属视频', color: 'from-purple-500 to-indigo-500' },
            { icon: '🖼️', title: '图片创作', desc: 'AI图片生成', color: 'from-orange-500 to-amber-500' },
            { icon: '💝', title: '个性定制', desc: '打造专属伴侣', color: 'from-cyan-500 to-blue-500' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
              className="bg-dark-card border border-border rounded-2xl p-4 hover:border-accent-start/50 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-text-muted">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
