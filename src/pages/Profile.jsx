import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

// User icon
const UserIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();

  // Not logged in view (matching OnlyCrush exactly)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Header */}
        <header className="profile-header">
          <div className="profile-logo">
            <span className="profile-logo-text profile-logo-hot">HOT</span>
            <span className="profile-logo-ai profile-logo-text">AI</span>
          </div>
          <div className="profile-user-icon">
            <UserIcon />
          </div>
        </header>

        {/* Content */}
        <div className="profile-content">
          {/* 3D Logo Animation */}
          <div className="profile-3d-logo">
            <div className="profile-3d-text">
              <span style={{ opacity: 0.4 }}>Hot AI</span>
              <span style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                fontSize: '12px',
                opacity: 0.3
              }}>
                ✨ ✨ ✨
              </span>
            </div>
          </div>

          {/* Message */}
          <p className="profile-message">Experience full functionality</p>

          {/* Login Button */}
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

  // Logged in view
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-logo">
          <span className="profile-logo-text profile-logo-hot">HOT</span>
          <span className="profile-logo-ai profile-logo-text">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon />
            )}
          </div>
        </div>
      </header>

      {/* User Info */}
      <div className="px-4 py-6">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#333]">
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
              <p className="text-[#737373] text-sm">{user?.email || ''}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user?.coins || 0}</div>
              <div className="text-xs text-[#737373]">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-[#737373]">Works</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Free</div>
              <div className="text-xs text-[#737373]">Plan</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-6 space-y-3">
          <button 
            className="w-full bg-[#1a1a1a] rounded-xl p-4 border border-[#333] flex items-center justify-between text-left"
            onClick={() => navigate('/my-works')}
          >
            <span className="text-white font-medium">My Works</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          
          <button 
            className="w-full bg-[#1a1a1a] rounded-xl p-4 border border-[#333] flex items-center justify-between text-left"
            onClick={() => navigate('/pricing')}
          >
            <span className="text-white font-medium">Buy Coins</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          
          <button 
            className="w-full bg-[#1a1a1a] rounded-xl p-4 border border-[#333] flex items-center justify-between text-left"
            onClick={() => navigate('/settings')}
          >
            <span className="text-white font-medium">Settings</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Logout */}
        <button 
          className="w-full mt-6 bg-[#1a1a1a] rounded-xl p-4 border border-[#333] text-red-400 font-medium"
          onClick={() => {
            useUserStore.getState().logout();
            navigate('/');
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
