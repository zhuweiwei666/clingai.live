import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { generationService } from '../services/generationService';
import { assetUrl } from '../utils/assetUrl';

// User Icon
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

// Pro Icon
const ProIcon = () => (
  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]">
    Pro
  </div>
);

// Edit Icon
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user works
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
        const videoWorks = response.data.works.filter(w => 
          w.type === 'video' || w.type === 'photo_to_video' || w.type === 'photo2video'
        );
        setWorks(videoWorks.slice(0, 1));
      }
    } catch (error) {
      console.error('Failed to load works:', error);
    } finally {
      setLoading(false);
    }
  };

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-white text-2xl font-bold tracking-wider" style={{ fontFamily: 'Notable, sans-serif' }}>HOT</span>
            <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full text-white text-lg font-bold" style={{ fontFamily: 'Notable, sans-serif' }}>AI</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <UserIcon />
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          {/* 3D Logo Effect */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-white" style={{ 
              fontFamily: 'Notable, sans-serif',
              textShadow: '0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(236,72,153,0.3)',
              transform: 'perspective(500px) rotateX(15deg)',
            }}>
              Hot AI
            </div>
          </div>

          {/* Message */}
          <p className="text-white/70 text-lg mb-8 text-center">Experience full functionality</p>

          {/* Login Button */}
          <button 
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state
  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-white text-2xl font-bold tracking-wider" style={{ fontFamily: 'Notable, sans-serif' }}>HOT</span>
          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full text-white text-lg font-bold" style={{ fontFamily: 'Notable, sans-serif' }}>AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/subscribe')} className="hover:scale-105 transition-transform">
            <ProIcon />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <EditIcon />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon />
            )}
          </div>
        </div>
      </header>

      {/* Plan Badge + Subscribe CTA */}
      <div className="px-4 mt-4 mb-6">
        <div className="bg-[#141414] rounded-2xl p-4 border border-[#262626] flex items-center justify-between">
          <div className="text-white text-3xl font-bold" style={{ fontFamily: 'Livvic, sans-serif' }}>
            {user?.plan === 'pro' || user?.plan === 'super' ? 'Pro' : 'Free'}
          </div>
          <button
            onClick={() => navigate('/subscribe')}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
          >
            Subscribe <span>😁</span>
          </button>
        </div>
      </div>

      {/* Two-Card Grid: Work Card + Community Card */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        {/* Work Card (Left) */}
        <div 
          className="relative aspect-[3/4] bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden cursor-pointer group"
          onClick={() => works.length > 0 ? navigate(`/result?taskId=${works[0].taskId || works[0]._id}`) : navigate('/my-works')}
        >
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : works.length > 0 && works[0].outputUrl ? (
            <>
              <video
                src={assetUrl(works[0].outputUrl)}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
              {/* Play button overlay */}
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="9,18 15,12 9,6" />
                </svg>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#262626] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <polygon points="9,18 15,12 9,6" />
                </svg>
              </div>
              <p className="text-white/60 text-xs text-center px-2">No works yet</p>
            </div>
          )}
        </div>

        {/* Community/Agent Card (Right) - Discord style */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-2xl p-4 flex flex-col items-center justify-center overflow-hidden">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }} />
          
          {/* Discord Icon */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-purple-700/50 backdrop-blur-sm flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          
          {/* Title */}
          <div className="relative z-10 text-white font-bold text-sm text-center mb-4">Join Us Now</div>
          
          {/* Button */}
          <button className="relative z-10 mt-auto px-4 py-2 bg-purple-800/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium hover:bg-purple-800/80 transition-colors">
            Create templates with me
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="px-4 mb-6">
        <div className="bg-[#141414] rounded-2xl p-6 border border-[#262626]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-white font-bold">
                  {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.username || user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-white/60 text-sm">{user?.email || ''}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user?.coins || 0}</div>
              <div className="text-xs text-white/60 mt-1">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{works.length || 0}</div>
              <div className="text-xs text-white/60 mt-1">Works</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white capitalize">{user?.plan || 'Free'}</div>
              <div className="text-xs text-white/60 mt-1">Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {[
          { label: 'My Works', path: '/my-works' },
          { label: 'Buy Coins', path: '/coins' },
          { label: 'Payment History', path: '/paylist' },
          { label: 'Settings', path: '/settings' },
        ].map((item) => (
          <button 
            key={item.path}
            className="w-full bg-[#141414] rounded-xl p-4 border border-[#262626] flex items-center justify-between text-left hover:bg-[#1a1a1a] active:bg-[#1a1a1a] transition-colors"
            onClick={() => navigate(item.path)}
          >
            <span className="text-white font-medium">{item.label}</span>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6">
        <button 
          className="w-full bg-[#141414] rounded-xl p-4 border border-[#262626] text-red-400 font-medium hover:bg-[#1a1a1a] active:bg-[#1a1a1a] transition-colors"
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
