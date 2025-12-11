import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Loader2, Search } from 'lucide-react';
import { agentService } from '../services/agentService';
import { chatService } from '../services/chatService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import { useCache } from '../hooks/useCache';
import { CACHE_KEYS, cacheManager } from '../utils/cache';
import MessageItem from '../components/MessageItem';

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // 优化：先快速加载localStorage数据，然后后台更新
  const [localConversations, setLocalConversations] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 快速加载localStorage数据
  useEffect(() => {
    if (!isAuthenticated) return;
    
    try {
      const recentChats = JSON.parse(localStorage.getItem('recentChats') || '{}');
      const cachedList = cacheManager.get(CACHE_KEYS.MESSAGES_LIST);
      
      if (cachedList && Array.isArray(cachedList) && cachedList.length > 0) {
        // 如果有缓存，立即显示
        setLocalConversations(cachedList);
        setIsInitialLoad(false);
      } else if (Object.keys(recentChats).length > 0) {
        // 从localStorage快速构建列表
        agentService.getList().then((response) => {
          const agents = response.data || [];
          const quickList = agents
            .filter(agent => {
              const chatData = recentChats[agent._id];
              return chatData && chatData.lastMessage;
            })
            .map(agent => ({
              agent,
              lastMessage: recentChats[agent._id].lastMessage,
              hasHistory: true,
            }))
            .sort((a, b) => {
              if (a.lastMessage && b.lastMessage) {
                return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
              }
              return 0;
            });
          
          if (quickList.length > 0) {
            setLocalConversations(quickList);
            setIsInitialLoad(false);
          }
        }).catch(() => {
          // 忽略错误，继续等待API加载
        });
      }
    } catch (error) {
      console.error('快速加载localStorage失败:', error);
    }
  }, [isAuthenticated]);

  // 使用缓存Hook加载完整数据（后台更新）
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
        
        // 优化：先检查localStorage，减少API调用
        const recentChats = JSON.parse(localStorage.getItem('recentChats') || '{}');
        
        // 为每个agent检查是否有聊天历史（并行处理，但优先使用localStorage）
        const conversationsWithHistory = await Promise.allSettled(
          agents.map(async (agent) => {
            // 先检查localStorage
            const chatData = recentChats[agent._id];
            if (chatData && chatData.lastMessage) {
              // 有localStorage数据，先返回，后台验证
              const quickResult = {
                agent,
                lastMessage: chatData.lastMessage,
                hasHistory: true,
              };
              
              // 后台验证API（不阻塞）
              chatService.getHistory(agent._id).then((historyResponse) => {
                const history = historyResponse.data?.history || [];
                if (history.length > 0) {
                  const lastMessage = history[history.length - 1];
                  // 更新缓存
                  const updated = {
                    agent,
                    lastMessage: {
                      content: lastMessage.content,
                      role: lastMessage.role,
                      created_at: lastMessage.created_at,
                    },
                    hasHistory: true,
                  };
                  // 异步更新，不阻塞当前渲染
                  setTimeout(() => {
                    const current = cacheManager.get(CACHE_KEYS.MESSAGES_LIST) || [];
                    const updatedList = current.map(c => 
                      c.agent._id === agent._id ? updated : c
                    );
                    cacheManager.set(CACHE_KEYS.MESSAGES_LIST, updatedList, 5 * 60 * 1000);
                  }, 0);
                }
              }).catch(() => {
                // 忽略错误，使用localStorage数据
              });
              
              return quickResult;
            }
            
            // 没有localStorage，调用API
            try {
              const historyResponse = await chatService.getHistory(agent._id);
              const history = historyResponse.data?.history || [];
              
              if (history.length === 0) {
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
              return null; // 没有对话历史，不显示
            }
          })
        );
        
        // 处理Promise.allSettled结果
        const validConversations = conversationsWithHistory
          .map(result => result.status === 'fulfilled' ? result.value : null)
          .filter(conv => conv !== null);
        
        // 按最后消息时间排序
        validConversations.sort((a, b) => {
          if (a.lastMessage && b.lastMessage) {
            return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
          }
          return 0;
        });
        
        // 更新本地状态
        if (validConversations.length > 0) {
          setLocalConversations(validConversations);
          setIsInitialLoad(false);
        }
        
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

  // 优先使用本地快速加载的数据，如果没有则使用API数据
  const conversations = (localConversations.length > 0 && isInitialLoad) 
    ? localConversations 
    : (Array.isArray(conversationsData) ? conversationsData : []);
  
  // 当API数据加载完成后，更新本地状态
  useEffect(() => {
    if (conversationsData && Array.isArray(conversationsData) && conversationsData.length > 0) {
      setLocalConversations(conversationsData);
      setIsInitialLoad(false);
    }
  }, [conversationsData]);

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
      <div className="sticky top-[60px] z-40 glass-dark border-b border-border/50">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索AI伴侣或消息..."
              className="w-full pl-12 pr-4 py-3.5 glass-card rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-start transition-all duration-300"
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
      ) : (loading && isInitialLoad && conversations.length === 0) ? (
        // 骨架屏 - 立即显示
        <div className="pb-24 px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card mx-2 my-1.5 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-dark-elevated flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-dark-elevated rounded mb-2 w-3/4" />
                  <div className="h-3 bg-dark-elevated rounded w-full" />
                </div>
              </div>
            </div>
          ))}
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
          {filteredConversations.map((conv, index) => (
            <MessageItem
              key={conv.agent._id}
              conv={conv}
              index={index}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
