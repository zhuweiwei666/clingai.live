import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { agentService } from '../services/agentService';
import { chatService } from '../services/chatService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import { useCache } from '../hooks/useCache';
import { CACHE_KEYS, cacheManager } from '../utils/cache';

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // 使用缓存Hook加载数据
  const { data: conversationsData, loading, refresh, error } = useCache(
    CACHE_KEYS.MESSAGES_LIST,
    async () => {
      if (!isAuthenticated) {
        return [];
      }
      try {
        // 获取所有AI伴侣
        const response = await agentService.getList();
        const agents = response.data || [];
        
        // 为每个agent检查是否有聊天历史
        const conversationsWithHistory = await Promise.all(
          agents.map(async (agent) => {
            try {
              const historyResponse = await chatService.getHistory(agent._id);
              const history = historyResponse.data?.history || [];
              
              if (history.length === 0) {
                // 没有历史记录，检查localStorage
                const recentChats = JSON.parse(localStorage.getItem('recentChats') || '{}');
                const chatData = recentChats[agent._id];
                if (chatData && chatData.lastMessage) {
                  return {
                    agent,
                    lastMessage: chatData.lastMessage,
                    hasHistory: true,
                  };
                }
                return null; // 没有对话历史，不显示
              }
              
              // 有历史记录，获取最后一条消息
              const lastMessage = history[history.length - 1];
              return {
                agent,
                lastMessage: {
                  content: lastMessage.content,
                  role: lastMessage.role,
                  created_at: lastMessage.created_at,
                },
                hasHistory: true,
              };
            } catch (error) {
              // 如果API调用失败，检查localStorage
              const recentChats = JSON.parse(localStorage.getItem('recentChats') || '{}');
              const chatData = recentChats[agent._id];
              if (chatData && chatData.lastMessage) {
                return {
                  agent,
                  lastMessage: chatData.lastMessage,
                  hasHistory: true,
                };
              }
              return null; // 没有对话历史，不显示
            }
          })
        );
        
        // 过滤掉null值（没有对话历史的）
        const validConversations = conversationsWithHistory.filter(conv => conv !== null);
        
        // 按最后消息时间排序
        validConversations.sort((a, b) => {
          if (a.lastMessage && b.lastMessage) {
            return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
          }
          return 0;
        });
        
        return validConversations;
      } catch (error) {
        console.error('加载消息列表失败:', error);
        return [];
      }
    },
    {
      ttl: 5 * 60 * 1000, // 5分钟缓存
      enableCache: true,
      immediate: isAuthenticated, // 只在已登录时立即加载
    }
  );

  // 确保 conversations 总是数组
  const conversations = Array.isArray(conversationsData) ? conversationsData : [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/messages' } } });
    }
  }, [isAuthenticated, navigate]);

  // 监听路由变化，从聊天页面返回时刷新缓存
  useEffect(() => {
    if (location.state?.fromChat) {
      // 从聊天页面返回，清除缓存并刷新
      cacheManager.delete(CACHE_KEYS.MESSAGES_LIST);
      refresh();
    }
  }, [location.state, refresh]);

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

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.agent.name?.toLowerCase().includes(query) ||
      conv.lastMessage?.content?.toLowerCase().includes(query)
    );
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // 如果未登录，显示加载状态
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-accent-pink" size={32} />
          <p className="text-text-secondary text-sm">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col" style={{ minHeight: '100vh' }}>
      {/* 下拉刷新指示器 */}
      {isRefreshing && (
        <div className="fixed top-[60px] left-0 right-0 z-50 flex items-center justify-center py-2 bg-dark-primary/95 backdrop-blur-lg">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <div className="w-4 h-4 border-2 border-accent-pink border-t-transparent rounded-full animate-spin" />
            <span>刷新中...</span>
          </div>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="sticky top-[60px] z-40 bg-dark-primary/95 backdrop-blur-lg border-b border-border/50">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索AI伴侣或消息..."
              className="w-full pl-10 pr-4 py-3 bg-dark-elevated border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-start transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <MessageCircle className="text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg mb-2">加载失败</p>
          <p className="text-text-muted text-sm text-center mb-4">
            {error.message || '请稍后重试'}
          </p>
          <button
            onClick={() => refresh()}
            className="px-6 py-2 gradient-bg rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
          >
            重试
          </button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-accent-pink" size={32} />
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <MessageCircle className="text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg mb-2">
            {searchQuery ? '没有找到匹配的对话' : '还没有消息'}
          </p>
          <p className="text-text-muted text-sm text-center">
            {searchQuery ? '试试其他关键词' : '去首页选择一个AI伴侣开始聊天吧'}
          </p>
          {!searchQuery && (
            <Link
              to="/"
              className="mt-4 px-6 py-2 gradient-bg rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            >
              去首页
            </Link>
          )}
        </div>
      ) : (
        <div 
          className="pb-24 flex-1 overflow-y-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={scrollContainerRef}
        >
          {filteredConversations.map((conv, index) => {
            const { agent, lastMessage } = conv;
            const avatarUrl = agent.avatarUrl || agent.avatar;
            
            return (
              <motion.div
                key={agent._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={`/chat/${agent._id}`}
                  state={{ fromMessages: true }}
                  className="block px-4 py-3 hover:bg-dark-elevated/50 transition-colors border-b border-border/30"
                >
                  <div className="flex items-center gap-3">
                    {/* 头像 */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-dark-elevated border-2 border-border">
                        <img
                          src={avatarUrl || '/placeholder-avatar.jpg'}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop';
                          }}
                        />
                      </div>
                      {agent.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-primary" />
                      )}
                    </div>
                    
                    {/* 消息内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-text-primary truncate">{agent.name}</h3>
                        {lastMessage && (
                          <span className="text-xs text-text-muted flex-shrink-0 ml-2">
                            {formatTime(lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      {lastMessage ? (
                        <p className="text-sm text-text-secondary line-clamp-1">
                          {lastMessage.role === 'user' ? '你: ' : ''}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-text-muted italic">点击开始聊天</p>
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
