import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Image, Video, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { streamerService } from '../services/streamerService';
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
      const response = await streamerService.getList({ limit: 6 });
      setFeaturedStreamers(response.data || []);
    } catch (error) {
      console.error('加载推荐主播失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: '智能聊天',
      description: '与AI女友进行自然流畅的对话',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Image,
      title: '图片生成',
      description: 'AI生成精美图片',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Video,
      title: '视频生成',
      description: '创建专属AI视频',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: TrendingUp,
      title: '个性化',
      description: '定制你的专属AI伴侣',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <Sparkles className="text-white" size={40} />
          </motion.div>
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-4">
          遇见你的AI女友
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          智能、温暖、贴心的AI伴侣，陪伴你的每一天
        </p>
        <Link
          to="/streamers"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          开始探索
        </Link>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-6 card-hover"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Featured Streamers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold gradient-text">推荐AI主播</h2>
          <Link
            to="/streamers"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            查看更多 →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass-effect rounded-xl p-4 animate-pulse"
              >
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredStreamers.map((streamer) => (
              <Link
                key={streamer.id}
                to={`/chat/${streamer.id}`}
                onClick={(e) => handleStreamerClick(streamer.id, e)}
                className="glass-effect rounded-xl p-4 card-hover group"
              >
                <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden">
                  <img
                    src={streamer.avatar || '/placeholder-avatar.jpg'}
                    alt={streamer.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200?text=AI';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-semibold text-gray-800 truncate">
                  {streamer.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {streamer.description || 'AI智能伴侣'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

