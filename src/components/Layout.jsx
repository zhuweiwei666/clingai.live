import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';

// ========== 顶部功能 Tab 图标 ==========

// Remove 图标
const RemoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h18" />
    <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" />
  </svg>
);

// Chat Edit 图标
const ChatEditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 7h10M7 12h6" />
    <path d="M16 16l2-2-2-2" strokeWidth="2" />
  </svg>
);

// AI Image 图标
const AIImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8" cy="8" r="2" />
    <path d="M21 15l-5-5-8 8" />
  </svg>
);

// AI Video 图标
const AIVideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polygon points="10,8 16,12 10,16" fill="currentColor" />
  </svg>
);

// HD 图标
const HDIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 9v6M7 12h3M10 9v6M14 9v6h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2" />
  </svg>
);

// MaterMark 图标
const WatermarkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18" strokeDasharray="2 2" />
  </svg>
);

// ========== 底部导航图标 ==========

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);

const GlassesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="6" cy="12" r="4" />
    <circle cx="18" cy="12" r="4" />
    <path d="M10 12h4" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 功能 Tab 配置
const featureTabs = [
  { path: '/remove', label: 'Remove', icon: RemoveIcon, badge: '19' },
  { path: '/chat-edit', label: 'Chat Edit', icon: ChatEditIcon, badge: '19' },
  { path: '/ai-image', label: 'AI Image', icon: AIImageIcon, badge: '19', superBadge: true },
  { path: '/', label: 'AI Video', icon: AIVideoIcon, isMain: true, superBadge: true },
  { path: '/hd', label: 'HD', icon: HDIcon },
  { path: '/watermark', label: 'MaterMark', icon: WatermarkIcon },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // 显示顶部 Header 的页面
  const showHeader = ['/', '/ai-image', '/ai-video', '/hd', '/remove', '/chat-edit', '/watermark', '/face-swap'].includes(currentPath);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 顶部 Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-black">
          {/* Logo + Login */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="text-white text-2xl font-bold tracking-wider" style={{ fontFamily: 'Notable, sans-serif' }}>HOT</span>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full text-white text-lg font-bold" style={{ fontFamily: 'Notable, sans-serif' }}>AI</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-1.5 bg-[#2a2a2a] rounded-full text-white text-sm font-medium"
              >
                Log in
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-white/70">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 7h10M7 12h10M7 17h10" />
                </svg>
              </button>
            </div>
          </div>

          {/* 功能 Tab - 图标卡片样式 */}
          <div className="feature-tabs">
            {featureTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.isMain 
                ? (currentPath === '/' || currentPath === '/ai-video')
                : currentPath === tab.path;
              
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`feature-tab ${isActive ? 'active' : ''}`}
                >
                  {/* 红色角标 */}
                  {tab.badge && (
                    <span className="feature-tab-badge">{tab.badge}</span>
                  )}
                  {/* Super 标签 */}
                  {tab.superBadge && (
                    <span className="feature-tab-super">Super</span>
                  )}
                  <div className="feature-tab-icon">
                    <Icon />
                  </div>
                  <span className="feature-tab-label">{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </header>
      )}

      {/* 主内容区 */}
      <main className="flex-1 safe-area-bottom">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <NavLink 
            to="/" 
            className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
          >
            <VideoIcon />
          </NavLink>

          <NavLink 
            to="/face-swap" 
            className="nav-item nav-item-center"
          >
            <div className="nav-item-center-button">
              <span className="super-badge">Super</span>
              <GlassesIcon />
            </div>
          </NavLink>

          <NavLink 
            to="/profile" 
            className={`nav-item ${currentPath === '/profile' ? 'active' : ''}`}
          >
            <SaveIcon />
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
