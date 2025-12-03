import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chatService';
import { streamerService } from '../services/streamerService';
import toast from 'react-hot-toast';

export default function Chat() {
  const { id } = useParams();
  const [streamer, setStreamer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    loadStreamer();
    loadHistory();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadStreamer = async () => {
    try {
      const response = await streamerService.getDetail(id);
      setStreamer(response.data);
    } catch (error) {
      console.error('加载主播信息失败:', error);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await chatService.getHistory(id);
      setMessages(response.data || []);
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage = {
      id: Date.now(),
      message: inputMessage,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await chatService.sendMessage(id, inputMessage);
      const aiMessage = {
        id: response.data?.id || Date.now() + 1,
        message: response.data?.message || response.message || '抱歉，我暂时无法回复。',
        role: 'assistant',
        created_at: response.data?.created_at || new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('发送失败，请稍后重试');
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !streamer) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* 聊天头部 */}
      <div className="glass-effect rounded-t-2xl p-4 flex items-center gap-4 border-b border-purple-200/50">
        <Link to="/streamers" className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        {streamer && (
          <>
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={streamer.avatar || '/placeholder-avatar.jpg'}
                alt={streamer.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200?text=AI';
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800">{streamer.name}</h2>
              <p className="text-sm text-gray-500">在线</p>
            </div>
          </>
        )}
      </div>

      {/* 消息列表 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/50 to-pink-50/50"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'glass-effect text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                  {new Date(message.created_at).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start">
            <div className="glass-effect rounded-2xl px-4 py-2">
              <Loader2 className="animate-spin text-purple-600" size={16} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="glass-effect rounded-b-2xl p-4 border-t border-purple-200/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="输入消息..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || sending}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

