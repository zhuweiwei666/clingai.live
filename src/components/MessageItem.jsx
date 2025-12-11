import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// 优化的消息列表项组件（使用memo减少重渲染）
const MessageItem = memo(({ conv, index, formatTime }) => {
  const { agent, lastMessage } = conv;
  const avatarUrl = agent.avatarUrl || agent.avatar;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
    >
      <Link
        to={`/chat/${agent._id}`}
        state={{ fromMessages: true }}
        className="block px-4 py-3 glass-card mx-2 my-1.5 rounded-2xl hover:glass-elevated transition-all duration-300 border-b-0"
      >
        <div className="flex items-center gap-3">
          {/* 头像 */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-dark-elevated border-2 border-border">
              <img
                src={avatarUrl || '/placeholder-avatar.jpg'}
                alt={agent.name}
                className="w-full h-full object-cover"
                loading="lazy"
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
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
