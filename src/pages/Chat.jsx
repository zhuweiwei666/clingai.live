import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Image, Play, Square, Check, CheckCheck, Smile, Paperclip, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chatService';
import { agentService } from '../services/agentService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState(null);
  const [typingMessage, setTypingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: `/chat/${id}` } } });
      return;
    }
    loadAgent();
    loadHistory();
  }, [id, isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMessage]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setPlayingAudioId(null);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  // 打字效果
  useEffect(() => {
    if (typingMessage) {
      const { messageId, fullText, currentIndex } = typingMessage;
      if (currentIndex < fullText.length) {
        typingTimeoutRef.current = setTimeout(() => {
          setTypingMessage({
            messageId,
            fullText,
            currentIndex: currentIndex + 1,
            displayText: fullText.slice(0, currentIndex + 1)
          });
        }, 15); // WhatsApp风格：稍快一点
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, content: fullText } : msg
        ));
        setTypingMessage(null);
      }
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [typingMessage]);

  const loadAgent = async () => {
    try {
      const response = await agentService.getDetail(id);
      setAgent(response.data);
    } catch (error) {
      console.error('加载AI伴侣信息失败:', error);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await chatService.getHistory(id);
      const historyData = response.data?.history || [];
      setMessages(historyData.map((msg, idx) => ({
        id: `history-${idx}`,
        content: msg.content,
        role: msg.role,
        audioUrl: msg.audioUrl,
        imageUrl: msg.imageUrl,
        created_at: msg.created_at || new Date().toISOString(),
        status: 'read', // WhatsApp风格：已读状态
      })));
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: `/chat/${id}` } } });
      return;
    }

    const messageContent = inputMessage.trim();
    if (!messageContent || sending) return;

    const requestWithImage = imageMode;
    const messageId = Date.now();

    const userMessage = {
      id: messageId,
      content: messageContent,
      role: 'user',
      withImage: requestWithImage,
      created_at: new Date().toISOString(),
      status: 'sending', // 发送中
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);
    inputRef.current?.focus();

    // 模拟发送成功，更新状态
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    try {
      const response = await chatService.sendMessage(id, messageContent);
      const responseData = response.data || response || {};
      const aiReply = responseData.message || responseData.reply || responseData.content;
      const audioUrl = responseData.audioUrl || responseData.audio_url || responseData.audio;
      
      // 更新用户消息为已读
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      
      const aiMessageId = messageId + 1;
      const aiMessage = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        audioUrl,
        created_at: new Date().toISOString(),
        status: 'read',
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // 启动打字效果
      if (aiReply) {
        setTypingMessage({
          messageId: aiMessageId,
          fullText: aiReply,
          currentIndex: 0,
          displayText: ''
        });
      }
      
      // 更新localStorage中的最近聊天记录
      updateRecentChats(userMessage, aiReply);
      
      if (requestWithImage) {
        setImageMode(false);
        requestImage();
      }
      
    } catch (error) {
      console.error('❌ 请求失败:', error);
      const errorMessage = error.message || '请求失败，请稍后重试';
      toast.error(errorMessage);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  // 请求生成图片
  const requestImage = async () => {
    setGeneratingImage(true);
    
    try {
      const response = await chatService.generateImage(id);
      const responseData = response.data || response || {};
      const imageUrl = responseData.imageUrl || responseData.image_url || responseData.image || responseData.url;
      const message = responseData.message || responseData.content || '';
      
      if (imageUrl) {
        const imageMessage = {
          id: Date.now() + 2,
          content: message,
          role: 'assistant',
          imageUrl,
          created_at: new Date().toISOString(),
          status: 'read',
        };
        setMessages(prev => [...prev, imageMessage]);
      }
    } catch (error) {
      console.error('❌ 图片生成失败:', error);
    } finally {
      setGeneratingImage(false);
    }
  };

  // 请求生成语音
  const requestVoice = async (messageId, text) => {
    if (loadingVoiceId === messageId || !text) return;
    
    setLoadingVoiceId(messageId);
    
    try {
      const response = await chatService.generateVoice(id, text);
      const responseData = response.data || response || {};
      const audioUrl = responseData.audioUrl || responseData.audio_url || responseData.audio;
      
      if (audioUrl) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, audioUrl } : msg
        ));
        playAudio(messageId, audioUrl);
      } else {
        toast.error('语音生成失败：未返回音频URL');
      }
    } catch (error) {
      console.error('❌ 语音生成失败:', error);
      const errorMsg = error.response?.data?.message || error.message || '语音生成失败';
      toast.error(errorMsg);
    } finally {
      setLoadingVoiceId(null);
    }
  };

  // 播放音频
  const playAudio = (messageId, audioUrl) => {
    if (!audioRef.current || !audioUrl) return;
    
    if (playingAudioId === messageId) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingAudioId(null);
      return;
    }
    
    audioRef.current.src = audioUrl;
    audioRef.current.play()
      .then(() => setPlayingAudioId(messageId))
      .catch((err) => {
        console.error('播放失败:', err);
      });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 更新最近聊天记录到localStorage
  const updateRecentChats = (userMessage, aiReply) => {
    try {
      const recentChats = JSON.parse(localStorage.getItem('recentChats') || '{}');
      const lastMessage = aiReply ? {
        content: aiReply,
        role: 'assistant',
        created_at: new Date().toISOString(),
      } : {
        content: userMessage.content,
        role: 'user',
        created_at: userMessage.created_at,
      };
      
      recentChats[id] = {
        lastMessage,
        updatedAt: Date.now(),
      };
      
      localStorage.setItem('recentChats', JSON.stringify(recentChats));
      
      // 清除消息列表缓存，强制刷新
      localStorage.removeItem('messages_cache');
    } catch (e) {
      console.error('更新最近聊天记录失败:', e);
    }
  };

  const formatTime = (dateString) => {
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

  const avatarUrl = agent?.avatarUrl || agent?.avatar;

  if (loading && !agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-dark-elevated animate-pulse" />
          <p className="text-text-secondary text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-primary">
      <audio ref={audioRef} className="hidden" />
      
      {/* 统一风格头部 - 移动端优化 */}
      <div className="glass-dark px-2 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 safe-area-top border-b border-border sticky top-0 z-50">
        {/* 返回按钮 - 移动端优化，更大更明显 */}
        <button 
          onClick={() => navigate('/messages', { state: { fromChat: true } })} 
          className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary active:bg-dark-elevated rounded-xl transition-all touch-manipulation"
          aria-label="返回"
        >
          <ArrowLeft size={26} className="sm:w-6 sm:h-6" />
        </button>
        {agent && (
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
              <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-text-primary text-base sm:text-lg truncate">{agent.name}</h2>
              <p className="text-xs text-text-muted">在线</p>
            </div>
          </div>
        )}
      </div>

      {/* 消息列表 - 统一风格背景 */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto bg-dark-primary"
      >
        <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-1.5 sm:space-y-1 min-h-full flex flex-col">
          {messages.length === 0 && !loading && agent && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-border">
                <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-text-secondary text-base mb-6 max-w-xs">{agent.description || '很高兴认识你~'}</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isTyping = typingMessage?.messageId === message.id;
              const displayContent = isTyping ? typingMessage.displayText : message.content;
              const isUser = message.role === 'user';
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end`}
                  style={{ gap: '6px' }}
                >
                  {!isUser && agent && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border" style={{ marginBottom: '2px' }}>
                      <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {displayContent && (
                      <div className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                        isUser 
                          ? 'bg-gradient-to-br from-accent-start to-accent-end text-white' // 统一渐变
                          : 'bg-dark-card text-text-primary border border-border' // 统一卡片样式
                      }`}>
                        
                        <p className="text-[15px] leading-[21px] whitespace-pre-wrap break-words relative z-10">
                          {displayContent}
                          {isTyping && (
                            <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* 图片显示 */}
                    {message.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden max-w-[280px] border border-border shadow-lg">
                        <img 
                          src={message.imageUrl} 
                          alt="AI生成图片" 
                          className="w-full h-auto cursor-pointer" 
                          onClick={() => window.open(message.imageUrl, '_blank')} 
                        />
                  </div>
                )}
                    
                    {/* 时间戳和状态 */}
                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[11px] text-text-muted">
                        {formatTime(message.created_at)}
                      </span>
                      {isUser && (
                        <span className="text-text-muted">
                          {message.status === 'sending' ? (
                            <span className="text-text-muted">⏱</span>
                          ) : message.status === 'sent' ? (
                            <Check size={14} className="text-text-muted" />
                          ) : message.status === 'read' ? (
                            <CheckCheck size={14} className="text-accent-pink" />
                          ) : (
                            <span className="text-red-500">✕</span>
                          )}
                        </span>
                      )}
                    </div>
                
                {/* 语音按钮 - AI消息 */}
                    {!isUser && displayContent && !isTyping && (
                    <button
                      onClick={() => {
                        if (message.audioUrl) {
                          playAudio(message.id, message.audioUrl);
                        } else {
                          requestVoice(message.id, message.content);
                        }
                      }}
                      disabled={loadingVoiceId === message.id}
                        className="mt-1.5 px-3 py-1.5 bg-dark-elevated hover:bg-dark-card border border-border rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingVoiceId === message.id ? (
                          <>⏳ 生成中...</>
                      ) : playingAudioId === message.id ? (
                          <><Square size={12} fill="currentColor" /> 停止</>
                      ) : (
                          <><Play size={12} fill="currentColor" /> 播放语音</>
                      )}
                    </button>
                    )}
                  </div>
                  
                  {/* 用户头像 - 显示在消息右侧 */}
                  {isUser && user && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border" style={{ marginBottom: '2px' }}>
                      {user.avatar || user.picture ? (
                        <img 
                          src={user.avatar || user.picture} 
                          alt={user.username || user.name || '我'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-white text-xs font-semibold flex items-center justify-center w-full h-full gradient-bg">${(user.username || user.name || '我')?.[0]?.toUpperCase() || 'U'}</span>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full gradient-bg flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {(user.username || user.name || '我')?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>
        
          {/* 发送中指示器 */}
        {sending && (
            <div className="flex justify-start items-end" style={{ gap: '6px' }}>
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border" style={{ marginBottom: '2px' }}>
              {agent && <img src={avatarUrl} alt="" className="w-full h-full object-cover" />}
            </div>
              <div className="bg-dark-card border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
              <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-[#8696a0] rounded-full"
                      style={{
                        animation: `typing 1.4s infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
        
        {/* 生成图片中 */}
        {generatingImage && (
            <div className="flex justify-start items-end" style={{ gap: '6px' }}>
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-border" style={{ marginBottom: '2px' }}>
              {agent && <img src={avatarUrl} alt="" className="w-full h-full object-cover" />}
            </div>
              <div className="bg-dark-card border border-border rounded-2xl rounded-tl-md px-4 py-3 text-text-secondary text-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-accent-pink" size={14} />
                生成图片中...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* 输入框 - 统一风格，移动端优化 */}
      <div className="glass-dark px-2 sm:px-4 py-2 sm:py-3 chat-input-area safe-area-bottom border-t border-border sticky bottom-0 z-50">
        {imageMode && (
          <div className="px-3 py-1.5 mb-2 text-xs text-text-secondary bg-dark-elevated border border-border rounded-lg mx-2">
            📷 图片模式已开启
          </div>
        )}
        
        <div className="flex items-end gap-2 sm:gap-3">
          {/* 附件按钮 - 移动端优化 */}
          <button
            onClick={() => setImageMode(!imageMode)}
            className="p-3 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary active:bg-dark-elevated rounded-xl transition-all touch-manipulation"
            aria-label={imageMode ? "关闭图片模式" : "附件"}
          >
            {imageMode ? <Image size={24} className="text-accent-pink" /> : <Paperclip size={24} />}
          </button>
          
          {/* 输入框 - 移动端优化 */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  sendMessage(); 
                } 
              }}
              placeholder="输入消息"
              className="w-full px-4 py-3 sm:py-2.5 bg-dark-elevated border border-border text-text-primary placeholder-text-muted rounded-2xl text-[15px] sm:text-base focus:outline-none focus:ring-2 focus:ring-accent-start/50 focus:border-accent-start transition-all"
              disabled={sending || generatingImage}
            />
          </div>
          
          {/* 发送按钮 - 移动端优化 */}
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || sending || generatingImage}
            className={`p-3 sm:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-95 ${
              inputMessage.trim()
                ? 'gradient-bg text-white shadow-lg'
                : 'bg-dark-elevated border border-border text-text-muted'
            }`}
            aria-label="发送"
          >
            {sending ? (
              <Loader2 className="animate-spin text-white" size={20} />
            ) : (
              <Send size={22} className={inputMessage.trim() ? 'text-white' : 'text-text-muted'} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
