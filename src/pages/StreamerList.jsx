import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { streamerService } from '../services/streamerService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function StreamerList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [streamers, setStreamers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, real, cartoon

  useEffect(() => {
    loadStreamers();
  }, [filter]);

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
      const params = {};
      if (filter !== 'all') {
        params.style = filter;
      }
      const response = await streamerService.getList(params);
      setStreamers(response.data || []);
    } catch (error) {
      console.error('加载主播列表失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (id, isFavorite, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: '/streamers' } } });
      return;
    }
    try {
      await streamerService.toggleFavorite(id);
      setStreamers(streamers.map(s => 
        s.id === id ? { ...s, is_favorite: !isFavorite } : s
      ));
      toast.success(isFavorite ? '已取消收藏' : '已收藏');
    } catch (error) {
      toast.error('操作失败，请稍后重试');
    }
  };

  const filteredStreamers = streamers.filter(streamer =>
    streamer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    streamer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* 搜索和筛选栏 */}
      <div className="glass-effect rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索AI主播..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="all">全部</option>
              <option value="real">真人风格</option>
              <option value="cartoon">卡通风格</option>
            </select>
          </div>
        </div>
      </div>

      {/* 主播列表 */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-effect rounded-xl p-4 animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredStreamers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无AI主播</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStreamers.map((streamer, index) => (
            <motion.div
              key={streamer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-effect rounded-xl p-4 card-hover group relative"
            >
              <Link 
                to={`/chat/${streamer.id}`}
                onClick={(e) => handleStreamerClick(streamer.id, e)}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm line-clamp-2">
                      {streamer.description || 'AI智能伴侣'}
                    </p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 truncate mb-1">
                  {streamer.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {streamer.style === 'real' ? '真人风格' : '卡通风格'}
                </p>
              </Link>
              <button
                onClick={(e) => handleFavorite(streamer.id, streamer.is_favorite, e)}
                className="absolute top-6 right-6 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  className={streamer.is_favorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

