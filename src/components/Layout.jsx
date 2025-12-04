import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Users, MessageCircle, User, Wallet, LogOut, LogIn } from 'lucide-react';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Layout() {
  const navigate = useNavigate();
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
    { icon: Home, label: '首页', path: '/' },
    { icon: Users, label: 'AI主播', path: '/streamers' },
    { icon: MessageCircle, label: '聊天', path: '/streamers' },
    { icon: Wallet, label: '钱包', path: '/wallet' },
    { icon: User, label: '我的', path: '/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="glass-effect sticky top-0 z-50 border-b border-purple-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Clingai</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white text-sm">{user.username?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{user.username || user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                    title="退出登录"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <LogIn size={18} />
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* 底部导航栏（移动端） */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-purple-200/50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const requiresAuth = ['/wallet', '/profile'].includes(item.path) || item.path.startsWith('/chat');
            
            if (requiresAuth && !isAuthenticated) {
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path, true)}
                  className="flex flex-col items-center space-y-1 p-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <Icon size={24} />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center space-y-1 p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Icon size={24} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

