import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, Users, MessageCircle, User, Wallet, LogOut } from 'lucide-react';
import useUserStore from '../store/userStore';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              <span className="text-2xl font-bold gradient-text">Honey AI</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">{user.username?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="text-sm text-gray-700">{user.username}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                title="退出登录"
              >
                <LogOut size={20} />
              </button>
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

