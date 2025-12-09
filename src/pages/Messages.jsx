import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { agentService } from '../services/agentService';
import { chatService } from '../services/chatService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Messages() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: '/messages' } } });
      return;
    }
    loadConversations();
  }, [isAuthenticated, navigate]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // 获取所有AI伴侣
      const response = await agentService.getList();
      const agents = response.data || [];
      
      // 简化版本：只显示所有AI伴侣，不加载历史记录（避免性能问题）
      // 用户点击进入聊天页面时会自动加载历史记录
      const conversationsList = agents.map((agent) => ({
        agent,
        lastMessage: null,
        hasHistory: false,
      }));
      
      // 尝试从localStorage获取最近聊天的记录
      try {
        const recentChats = JSON.parse(localStorage.getItem('recentChats') || '{}');
        conversationsList.forEach((conv) => {
          const chatData = recentChats[conv.agent._id];
          if (chatData && chatData.lastMessage) {
            conv.lastMessage = chatData.lastMessage;
            conv.hasHistory = true;
          }
        });
      } catch (e) {
        // localStorage读取失败，忽略
      }
      
      // 按最后消息时间排序，有消息的在前
      conversationsList.sort((a, b) => {
        if (a.hasHistory && !b.hasHistory) return -1;
        if (!a.hasHistory && b.hasHistory) return 1;
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
        }
        return 0;
      });
      
      setConversations(conversationsList);
    } catch (error) {
      console.error('加载消息列表失败:', error);
      toast.error('加载失败，请稍后重试');
    } finally {
      setLoading(false);
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
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-primary">
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
      {loading ? (
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
              className="mt-4 px-6 py-2 bg-gradient-accent rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            >
              去首页
            </Link>
          )}
        </div>
      ) : (
        <div className="pb-24">
          {filteredConversations.map((conv, index) => {
            const { agent, lastMessage, hasHistory } = conv;
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
