import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Settings, CreditCard, Image, Video, LogOut, 
  ChevronRight, Coins, Crown, Clock, Heart 
} from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const menuItems = [
    { icon: Image, label: 'My Works', path: '/my-works', badge: works.length || null },
    { icon: Clock, label: 'History', path: '/history' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: CreditCard, label: 'Buy Coins', path: '/pricing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Please login to view your profile</p>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden gradient-border">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            {user.subscription && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.username || 'User'}</h2>
            <p className="text-text-secondary text-sm">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{user.coins || 0}</div>
            <div className="text-text-muted text-xs">Coins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{works.length}</div>
            <div className="text-text-muted text-xs">Works</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.subscription ? 'VIP' : 'Free'}</div>
            <div className="text-text-muted text-xs">Plan</div>
          </div>
        </div>
      </motion.div>

      {/* Coins Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 138, 0.2), rgba(255, 142, 83, 0.2))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 107, 138, 0.3)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-6 h-6 text-yellow-500" />
              <span className="text-text-secondary">Coin Balance</span>
            </div>
            <div className="text-3xl font-bold">{user.coins?.toLocaleString() || 0}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 rounded-2xl font-semibold"
            style={{
              background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
            }}
          >
            Buy More
          </motion.button>
        </div>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        {menuItems.map((item, index) => (
          <motion.button
            key={item.path}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-4 p-4 border-b border-white/5 last:border-none"
          >
            <div className="w-10 h-10 rounded-xl glass-elevated flex items-center justify-center">
              <item.icon className="w-5 h-5 text-accent-start" />
            </div>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-1 rounded-full text-xs bg-accent-start/20 text-accent-start">
                {item.badge}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </motion.button>
        ))}
      </motion.div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full glass-card rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Log Out</span>
      </motion.button>
    </div>
  );
}
