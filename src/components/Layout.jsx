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
