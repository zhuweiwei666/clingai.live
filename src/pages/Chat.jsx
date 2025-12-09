import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Image, Play, Square, Volume2 } from 'lucide-react';
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
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(null);

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
  }, [messages]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setPlayingAudioId(null);
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

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
        id: idx,
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

    const userMessage = {
      id: Date.now(),
      content: messageContent,
      role: 'user',
      withImage: requestWithImage,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      console.log('📤 发送消息:', messageContent);
      const response = await chatService.sendMessage(id, messageContent);
      console.log('📥 后端响应:', response);
      
      const responseData = response.data || response || {};
      const aiReply = responseData.message || responseData.reply || responseData.content;
      const audioUrl = responseData.audioUrl || responseData.audio_url || responseData.audio;
      
      const aiMessage = {
        id: Date.now() + 1,
        content: aiReply || '...',
        role: 'assistant',
        audioUrl,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
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
        id: Date.now() + 1,
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
      console.log('🖼️ 请求生成图片, agentId:', id);
      const response = await chatService.generateImage(id);
      console.log('📥 图片响应:', JSON.stringify(response, null, 2));
      
      const responseData = response.data || response || {};
      console.log('📥 解析后的数据:', JSON.stringify(responseData, null, 2));
      
      const imageUrl = responseData.imageUrl || responseData.image_url || responseData.image || responseData.url;
      const message = responseData.message || responseData.content || '';
      
      console.log('🖼️ 提取的imageUrl:', imageUrl);
      
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
        console.error('❌ 响应中没有图片URL:', responseData);
        toast.error('图片生成失败：未返回图片');
      }
    } catch (error) {
      console.error('❌ 图片生成失败:', error);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      const errorMsg = error.message || error.responseData?.message || '图片生成失败';
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
      console.log('🔊 请求语音生成...');
      const response = await chatService.generateVoice(id, text);
      console.log('📥 语音响应:', response);
      
      const responseData = response.data || response || {};
      const audioUrl = responseData.audioUrl || responseData.audio_url || responseData.audio;
      
      if (audioUrl) {
        // 更新消息的 audioUrl
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, audioUrl } : msg
        ));
        // 自动播放
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

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingAudioId(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const avatarUrl = agent?.avatarUrl || agent?.avatar;
  const backgroundUrl = agent?.backgroundUrl || agent?.coverUrl || avatarUrl;

  if (loading && !agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-primary">
        <Loader2 className="animate-spin text-accent-pink" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      <audio ref={audioRef} className="hidden" />
      
      {/* 全屏背景图 */}
      {backgroundUrl && (
        <div className="absolute inset-0 z-0">
          <img src={backgroundUrl} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>
      )}
      
      {/* 头部 */}
      <div className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 safe-area-top bg-black/30 backdrop-blur-sm">
        <button onClick={() => navigate('/streamers')} className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-white" />
        </button>
        {agent && <div className="flex-1 text-center"><h2 className="font-semibold text-white text-base">{agent.name}</h2></div>}
        <div className="w-10" />
      </div>

      {/* 消息列表 */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.length === 0 && !loading && agent && (
          <div className="text-center py-8">
            <p className="text-white/80 text-sm mb-4">{agent.description || '很高兴认识你~'}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['你好呀！', '今天怎么样？', '想和你聊聊天'].map((msg, idx) => (
                <button key={idx} onClick={() => setInputMessage(msg)} className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white hover:bg-white/20 transition-all">
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role !== 'user' && agent && (
                <div className="w-9 h-9 rounded-full overflow-hidden mr-2 flex-shrink-0 border-2 border-white/30">
                  <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="max-w-[75%] flex flex-col">
                {message.content && (
                  <div className={`rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-[#c8e550] text-black rounded-tr-md' : 'bg-white/95 text-gray-800 rounded-tl-md shadow-lg'} ${message.isError ? 'bg-red-100 text-red-600' : ''}`}>
                    {message.role === 'user' && message.withImage && (
                      <div className="flex items-center gap-1 text-blue-600 text-xs mb-1">
                        <Image size={12} /><span>+图片</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  </div>
                )}
                
                {/* 语音按钮 - AI消息 */}
                {message.role === 'assistant' && message.content && !message.isError && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (message.audioUrl) {
                          playAudio(message.id, message.audioUrl);
                        } else {
                          requestVoice(message.id, message.content);
                        }
                      }}
                      disabled={loadingVoiceId === message.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white hover:bg-white/30 transition-all disabled:opacity-50"
                    >
                      {loadingVoiceId === message.id ? (
                        <><Loader2 size={12} className="animate-spin" /><span>生成中...</span></>
                      ) : playingAudioId === message.id ? (
                        <><Square size={12} fill="currentColor" /><span>停止</span></>
                      ) : (
                        <><Play size={12} fill="currentColor" /><span>播放语音</span></>
                      )}
                    </button>
                  </div>
                )}
                
                {/* 图片显示 */}
                {message.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden max-w-[200px] shadow-lg">
                    <img src={message.imageUrl} alt="AI生成图片" className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(message.imageUrl, '_blank')} />
                  </div>
                )}
                
                <p className={`text-[10px] mt-1 px-1 text-white/60 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(message.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 发送中 */}
        {sending && (
          <div className="flex justify-start">
            <div className="w-9 h-9 rounded-full overflow-hidden mr-2 border-2 border-white/30">
              {agent && <img src={avatarUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="bg-white/95 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-accent-start rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        {/* 生成图片中 */}
        {generatingImage && (
          <div className="flex justify-start">
            <div className="w-9 h-9 rounded-full overflow-hidden mr-2 border-2 border-white/30">
              {agent && <img src={avatarUrl} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="bg-white/95 rounded-2xl rounded-tl-md px-4 py-3 shadow-lg flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="animate-spin" size={16} />
              <span>生成图片中...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="relative z-10 p-3 safe-area-bottom bg-black/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* 图片模式按钮 */}
          <button
            onClick={() => setImageMode(!imageMode)}
            disabled={sending || generatingImage}
            className={`p-3 rounded-full transition-all disabled:opacity-50 ${imageMode ? 'bg-blue-500 ring-2 ring-blue-300 shadow-lg shadow-blue-500/50' : 'bg-white/20 hover:bg-white/30'}`}
            title={imageMode ? '图片模式已开启' : '点击开启图片模式'}
          >
            <Image size={20} className="text-white" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={imageMode ? '输入消息，AI将回复文字+图片...' : '输入消息...'}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-full text-white placeholder-white/50 focus:outline-none transition-colors ${imageMode ? 'border-blue-400/50 focus:border-blue-400' : 'border-white/20 focus:border-white/40'}`}
              disabled={sending || generatingImage}
            />
            {imageMode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-blue-400 text-xs">
                <Image size={12} /><span>+图片</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || sending || generatingImage}
            className={`p-3 rounded-full transition-colors disabled:opacity-30 ${imageMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/20 hover:bg-white/30'}`}
          >
            {sending ? <Loader2 className="animate-spin text-white" size={20} /> : <Send size={20} className="text-white" />}
          </button>
        </div>
        
        {imageMode && (
          <div className="mt-2 text-center text-xs text-blue-300">
            📷 图片模式已开启 - 发送消息后AI将回复文字和图片
          </div>
        )}
      </div>
    </div>
  );
}
