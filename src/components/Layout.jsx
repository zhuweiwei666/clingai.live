import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User, LogOut, LogIn } from 'lucide-react';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/');
  };

  const handleNavClick = (path, requiresAuth) => {
    if (requiresAuth && !isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: path } } });
      return;
    }
    navigate(path);
  };

  const navItems = [
    { icon: Home, label: '首页', path: '/', requiresAuth: false },
    { icon: MessageCircle, label: '消息', path: '/messages', requiresAuth: true },
    { icon: User, label: '个人中心', path: '/profile', requiresAuth: true },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* 顶部导航栏 */}
      <header className="glass-dark sticky top-0 z-50 safe-area-top">
        <div className="flex items-center justify-between px-4 py-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
              <Home className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold gradient-text">Clingai</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center overflow-hidden">
                    {(user.avatar || user.picture) ? (
                      <img 
                        src={user.avatar || user.picture} 
                        alt={user.username || user.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-white text-xs font-semibold">${(user.username || user.name)?.[0]?.toUpperCase() || 'U'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-white text-xs font-semibold">{(user.username || user.name)?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary max-w-[80px] truncate">{user.username || user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 glass-card rounded-xl text-text-muted hover:text-accent-pink transition-all duration-300"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="btn-primary py-1.5 px-3 text-xs"
              >
                <LogIn size={14} />
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 safe-area-bottom">
        <Outlet />
      </main>

      {/* 底部导航栏 */}
      <nav className="bottom-nav">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            const handleClick = (e) => {
              e.preventDefault();
              if (item.requiresAuth && !isAuthenticated) {
                handleNavClick(item.path, true);
              } else {
                navigate(item.path);
              }
            };
            
            return (
              <button
                key={item.path}
                onClick={handleClick}
                className={`bottom-nav-item ${active ? 'active' : ''}`}
              >
                {active && <div className="nav-indicator" />}
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-3 bg-gradient-accent text-[8px] text-white font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={active ? 'font-semibold' : ''}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
