import { Outlet, NavLink, useLocation } from 'react-router-dom';

// 底部导航图标 - 精确复刻 OnlyCrush

// 首页图标 - 4格布局
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

// 中间图标 - 眼镜图标
const GlassesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="12" r="4" />
    <circle cx="18" cy="12" r="4" />
    <path d="M10 12h4" />
    <path d="M2 12h0" />
    <path d="M22 12h0" />
  </svg>
);

// 保存图标
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 顶部导航 Tab 配置
const topTabs = [
  { path: '/remove', label: 'Remove' },
  { path: '/chat-edit', label: 'Chat Edit' },
  { path: '/ai-image', label: 'AI Image' },
  { path: '/', label: 'AI Video', isMain: true },
  { path: '/hd', label: 'HD' },
  { path: '/watermark', label: 'MaterMark' },
];

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;

  // 显示顶部 Tab 的页面
  const showTopTabs = ['/', '/ai-image', '/ai-video', '/face-swap', '/dress-up', '/hd', '/remove', '/chat-edit', '/watermark'].includes(currentPath);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 顶部导航 Tab */}
      {showTopTabs && (
        <header className="sticky top-0 z-50 bg-black">
          <nav className="top-tabs">
            {topTabs.map((tab) => {
              const isActive = tab.isMain 
                ? (currentPath === '/' || currentPath === '/ai-video')
                : currentPath === tab.path;
              
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`top-tab ${isActive ? 'active' : ''}`}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </header>
      )}

      {/* 主内容区 */}
      <main className="flex-1 safe-area-bottom">
        <Outlet />
      </main>

      {/* 底部导航 */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {/* 首页 */}
          <NavLink 
            to="/" 
            className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
          >
            <HomeIcon />
          </NavLink>

          {/* 中间 - 眼镜图标 + Super 标签 */}
          <NavLink 
            to="/face-swap" 
            className="nav-item nav-item-center"
          >
            <div className="nav-item-center-button">
              <span className="super-badge">Super</span>
              <GlassesIcon />
            </div>
          </NavLink>

          {/* 保存/我的 */}
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
