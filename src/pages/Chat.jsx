import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Image, Play, Square, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chatService';
import { agentService } from '../services/agentService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [intimacy, setIntimacy] = useState(0);
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
        }, 20); // 打字速度：每20ms一个字符
      } else {
        // 打字完成，更新消息
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
      })));
      setIntimacy(response.data?.intimacy || 0);
    } catch (error) {
      console.error('加载聊天记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发送文字消息
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
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);
    inputRef.current?.focus();

    try {
      const response = await chatService.sendMessage(id, messageContent);
      const responseData = response.data || response || {};
      const aiReply = responseData.message || responseData.reply || responseData.content;
      const audioUrl = responseData.audioUrl || responseData.audio_url || responseData.audio;
      
      const aiMessageId = messageId + 1;
      const aiMessage = {
        id: aiMessageId,
        content: '', // 先设为空，打字效果会填充
        role: 'assistant',
        audioUrl,
        created_at: new Date().toISOString(),
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
      
      // 如果开启了图片模式，额外请求生成图片
      if (requestWithImage) {
        setImageMode(false);
        requestImage();
      }
      
    } catch (error) {
      console.error('❌ 请求失败:', error);
      const errorMessage = error.message || '请求失败，请稍后重试';
      toast.error(errorMessage);
      
      const errorMsg = {
        id: messageId + 1,
        content: `请求失败: ${errorMessage}`,
        role: 'assistant',
        isError: true,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
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
        };
        setMessages(prev => [...prev, imageMessage]);
        toast.success('图片生成成功');
      } else {
        toast.error('图片生成失败：未返回图片');
      }
    } catch (error) {
      console.error('❌ 图片生成失败:', error);
      const errorMsg = error.message || '图片生成失败';
      toast.error(errorMsg);
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
        toast.error('语音生成失败');
      }
    } catch (error) {
      console.error('❌ 语音生成失败:', error);
      toast.error('语音生成失败');
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
        toast.error('播放失败');
      });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const avatarUrl = agent?.avatarUrl || agent?.avatar;
  const backgroundUrl = agent?.backgroundUrl || agent?.coverUrl || avatarUrl;

  if (loading && !agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-primary">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="animate-spin text-accent-pink" size={40} />
          <p className="text-text-secondary text-sm">加载中...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-dark-primary">
      <audio ref={audioRef} className="hidden" />
      
      {/* 全屏背景图 */}
      {backgroundUrl && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={backgroundUrl} 
            alt="" 
            className="w-full h-full object-cover" 
            onError={(e) => e.target.style.display = 'none'} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />
        </motion.div>
      )}
      
      {/* 头部 - 优化设计 */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 safe-area-top bg-black/40 backdrop-blur-xl border-b border-white/10"
      >
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/messages')} 
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
        >
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        {agent && (
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 ring-2 ring-white/10">
              <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">{agent.name}</h2>
              <p className="text-xs text-white/60">在线</p>
            </div>
          </div>
        )}
        <div className="w-10" />
      </motion.div>

      {/* 消息列表 - 优化滚动和间距 */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto relative z-10 scroll-smooth"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent'
        }}
      >
        <div className="px-4 py-6 space-y-4 min-h-full flex flex-col">
          {messages.length === 0 && !loading && agent && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-white/20"
              >
                <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
              </motion.div>
              <p className="text-white/90 text-base mb-6 max-w-xs">{agent.description || '很高兴认识你~'}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['你好呀！', '今天怎么样？', '想和你聊聊天'].map((msg, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setInputMessage(msg);
                      inputRef.current?.focus();
                    }}
                    className="px-5 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-sm text-white hover:bg-white/25 transition-all shadow-lg"
                  >
                    {msg}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isTyping = typingMessage?.messageId === message.id;
              const displayContent = isTyping ? typingMessage.displayText : message.content;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index === messages.length - 1 ? 0.1 : 0
                  }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {message.role !== 'user' && agent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 shadow-lg"
                    >
                      <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                  
                  <div className={`max-w-[75%] flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {displayContent && (
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className={`rounded-2xl px-4 py-3 shadow-xl ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-[#c8e550] to-[#a8d030] text-gray-900 rounded-tr-sm' 
                            : 'bg-white/95 backdrop-blur-sm text-gray-800 rounded-tl-sm'
                        } ${message.isError ? 'bg-red-100 text-red-700' : ''}`}
                      >
                        {message.role === 'user' && message.withImage && (
                          <div className="flex items-center gap-1 text-blue-700 text-xs mb-1.5 font-medium">
                            <Image size={12} /><span>+图片</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                          {displayContent}
                          {isTyping && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-2 h-4 bg-current ml-1"
                            />
                          )}
                        </p>
                      </motion.div>
                    )}
                    
                    {/* 语音按钮 - AI消息 */}
                    {message.role === 'assistant' && displayContent && !message.isError && !isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2"
                      >
                        <button
                          onClick={() => {
                            if (message.audioUrl) {
                              playAudio(message.id, message.audioUrl);
                            } else {
                              requestVoice(message.id, message.content);
                            }
                          }}
                          disabled={loadingVoiceId === message.id}
                          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs text-white hover:bg-white/30 transition-all disabled:opacity-50 shadow-lg border border-white/10"
                        >
                          {loadingVoiceId === message.id ? (
                            <><Loader2 size={14} className="animate-spin" /><span>生成中...</span></>
                          ) : playingAudioId === message.id ? (
                            <><Square size={14} fill="currentColor" /><span>停止</span></>
                          ) : (
                            <><Play size={14} fill="currentColor" /><span>播放语音</span></>
                          )}
                        </button>
                      </motion.div>
                    )}
                    
                    {/* 图片显示 */}
                    {message.imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2 rounded-2xl overflow-hidden max-w-[280px] shadow-2xl border-2 border-white/20"
                      >
                        <img 
                          src={message.imageUrl} 
                          alt="AI生成图片" 
                          className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => window.open(message.imageUrl, '_blank')} 
                        />
                      </motion.div>
                    )}
                    
                    <p className={`text-[11px] mt-1.5 px-2 text-white/50 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8e550] to-[#a8d030] flex items-center justify-center text-gray-900 font-semibold text-sm flex-shrink-0 shadow-lg">
                      {useUserStore.getState().user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* 发送中 - 优化动画 */}
          {sending && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                {agent && <img src={avatarUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-accent-pink rounded-full"
                      animate={{ 
                        y: [0, -8, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 生成图片中 */}
          {generatingImage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                {agent && <img src={avatarUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl flex items-center gap-3 text-gray-700 text-sm">
                <Loader2 className="animate-spin text-accent-pink" size={18} />
                <span>生成图片中...</span>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* 输入框 - 优化设计和交互 */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-4 safe-area-bottom bg-black/40 backdrop-blur-xl border-t border-white/10"
      >
        {imageMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-center text-xs text-blue-300 flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            <span>图片模式已开启 - 发送消息后AI将回复文字和图片</span>
          </motion.div>
        )}
        
        <div className="flex items-end gap-3">
          {/* 图片模式按钮 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setImageMode(!imageMode)}
            disabled={sending || generatingImage}
            className={`p-3 rounded-2xl transition-all disabled:opacity-50 flex-shrink-0 ${
              imageMode 
                ? 'bg-blue-500 ring-2 ring-blue-300 shadow-lg shadow-blue-500/50' 
                : 'bg-white/15 hover:bg-white/25 backdrop-blur-sm'
            }`}
            title={imageMode ? '图片模式已开启' : '点击开启图片模式'}
          >
            <Image size={20} className="text-white" />
          </motion.button>
          
          <div className="flex-1 relative">
            <motion.input
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
              placeholder={imageMode ? '输入消息，AI将回复文字+图片...' : '输入消息...'}
              className={`w-full px-5 py-4 bg-white/15 backdrop-blur-md border-2 rounded-2xl text-white placeholder-white/50 focus:outline-none transition-all text-[15px] ${
                imageMode 
                  ? 'border-blue-400/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30' 
                  : 'border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20'
              } ${sending || generatingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={sending || generatingImage}
            />
            {imageMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-blue-300 text-xs font-medium"
              >
                <Image size={12} /><span>+图片</span>
              </motion.div>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || sending || generatingImage}
            className={`p-4 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-lg ${
              imageMode 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : inputMessage.trim()
                  ? 'bg-gradient-to-br from-accent-start to-accent-end hover:from-accent-pink hover:to-accent-orange'
                  : 'bg-white/15 hover:bg-white/25'
            }`}
          >
            {sending ? (
              <Loader2 className="animate-spin text-white" size={22} />
            ) : (
              <Send size={22} className="text-white" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
