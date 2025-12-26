import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

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
            { label: 'Buy Coins', path: '/pricing' },
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
