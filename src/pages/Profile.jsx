import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { generationService } from '../services/generationService';
import { assetUrl } from '../utils/assetUrl';

// 用户图标
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user works (benchmark: /app/tools/undress/get)
  useEffect(() => {
    if (isAuthenticated) {
      loadWorks();
    }
  }, [isAuthenticated]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const response = await generationService.getMyWorks();
      if (response.success && response.data?.works) {
        // Get first video work for display
        const videoWorks = response.data.works.filter(w => 
          w.type === 'video' || w.type === 'photo_to_video'
        );
        setWorks(videoWorks.slice(0, 1)); // Show first video
      }
    } catch (error) {
      console.error('Failed to load works:', error);
    } finally {
      setLoading(false);
    }
  };

  // 未登录视图
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        {/* 顶部 Header */}
        <header className="profile-header">
          <div className="profile-logo">
            <span className="profile-logo-hot">HOT</span>
            <span className="profile-logo-ai">AI</span>
          </div>
          <div className="profile-user-icon">
            <UserIcon />
          </div>
        </header>

        {/* 中间内容 */}
        <div className="profile-content">
          {/* 3D Logo 效果 */}
          <div className="profile-3d-logo">
            <div className="profile-3d-text">
              Hot AI
            </div>
          </div>

          {/* 提示文字 */}
          <p className="profile-message">Experience full functionality</p>

          {/* 登录按钮 */}
          <button 
            className="login-button"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  // 已登录视图
  return (
    <div className="min-h-screen bg-black">
      {/* 顶部 Header */}
      <header className="profile-header">
        <div className="profile-logo">
          <span className="profile-logo-hot">HOT</span>
          <span className="profile-logo-ai">AI</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserIcon />
          )}
        </div>
      </header>

      {/* Plan Badge + Subscribe CTA (benchmark parity) */}
      <div className="px-4 mb-6">
        <div className="bg-[#141414] rounded-2xl p-4 border border-[#262626] flex items-center justify-between">
          <div className="text-white text-2xl font-bold">Free</div>
          <button
            onClick={() => navigate('/subscribe')}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold flex items-center gap-1"
          >
            Subscribe <span>🤩</span>
          </button>
        </div>
      </div>

      {/* Content Cards (benchmark: work card + Discord card) */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {/* Work card (show first video work) */}
        <div 
          className="relative aspect-[3/4] bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden cursor-pointer"
          onClick={() => works.length > 0 ? navigate(`/result?taskId=${works[0].taskId}`) : navigate('/my-works')}
        >
          {works.length > 0 && works[0].outputUrl ? (
            <>
              <video
                src={works[0].outputUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Delete work
                }}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white bg-black/50 rounded-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <button className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Discord community card */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-4 w-12 h-12 rounded-full bg-purple-700/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <div className="text-white font-bold text-sm mt-2 text-center">Join Us Now</div>
          <button className="mt-4 px-3 py-1.5 bg-purple-800/50 rounded-lg text-white text-xs font-medium">
            Create templates with me
          </button>
        </div>
      </div>

      {/* 用户信息卡片 */}
      <div className="px-4 py-6">
        <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-white font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username || 'User'}</h2>
              <p className="text-[#6b7280] text-sm">{user?.email || ''}</p>
            </div>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user?.coins || 0}</div>
              <div className="text-xs text-[#6b7280]">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-[#6b7280]">Works</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white capitalize">{user?.plan || 'Free'}</div>
              <div className="text-xs text-[#6b7280]">Plan</div>
            </div>
          </div>
        </div>

        {/* 菜单选项 */}
        <div className="mt-6 space-y-3">
          {[
            { label: 'My Works', path: '/my-works' },
            { label: 'Buy Coins', path: '/coins' },
            { label: 'Settings', path: '/settings' },
          ].map((item) => (
            <button 
              key={item.path}
              className="w-full bg-[#141414] rounded-xl p-4 border border-[#262626] flex items-center justify-between text-left hover:bg-[#1a1a1a] transition-colors"
              onClick={() => navigate(item.path)}
            >
              <span className="text-white font-medium">{item.label}</span>
              <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* 登出按钮 */}
        <button 
          className="w-full mt-6 bg-[#141414] rounded-xl p-4 border border-[#262626] text-red-400 font-medium hover:bg-[#1a1a1a] transition-colors"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
