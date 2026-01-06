import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

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

// Infinity Icon for Create
const InfinityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18.178 8c5.096 0 5.096 8 0 8-2.548 0-5.096-4-7.644-4-2.548 0-5.096 4-7.644 4-5.096 0-5.096-8 0-8 2.548 0 5.096 4 7.644 4 2.548 0 5.096-4 7.644-4z" />
  </svg>
);

// Pro Icon
const ProIcon = () => (
  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)] cursor-pointer">
    Pro
  </div>
);

// Notification Icon
const NotificationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Dress Icon
const DressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
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
  { path: '/ai-image', label: 'AI Image', icon: AIImageIcon, badge: '19' },
  { path: '/', label: 'AI Video', icon: AIVideoIcon, isMain: true, superBadge: true },
  { path: '/face-swap', label: 'Face Swap', icon: GlassesIcon, superBadge: true },
  { path: '/dress-up', label: 'Dress Up', icon: DressIcon, superBadge: true },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { isAuthenticated, user } = useUserStore();

  // 显示顶部 Header 的页面
  const showHeader = ['/', '/ai-image', '/ai-video', '/remove', '/chat-edit', '/face-swap', '/makeover', '/dress-up', '/create'].includes(currentPath);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 顶部 Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md">
          {/* Logo + Actions */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="text-white text-2xl font-bold tracking-wider" style={{ fontFamily: 'Notable, sans-serif' }}>HOT</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full text-white text-lg font-bold" style={{ fontFamily: 'Notable, sans-serif' }}>AI</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/subscribe')} className="hover:scale-105 transition-transform">
                <ProIcon />
                </button>
              <button className="text-white/80 hover:text-white transition-colors">
                <NotificationIcon />
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
            to="/create" 
            className="nav-item nav-item-center"
          >
            <div className="nav-item-center-button">
              <span className="super-badge">Super</span>
              <InfinityIcon />
            </div>
          </NavLink>

          <NavLink 
            to="/my" 
            className={`nav-item ${(currentPath === '/profile' || currentPath === '/my') ? 'active' : ''}`}
          >
            <SaveIcon />
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
