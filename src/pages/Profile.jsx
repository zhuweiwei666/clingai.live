import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit2, Save, X, Settings, ChevronRight, LogOut, Heart, History, HelpCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { walletService } from '../services/walletService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // 优先使用store中的用户信息（特别是Google登录的信息）
    if (user) {
      setFormData({
        username: user.username || user.name || '',
        email: user.email || '',
        avatar: user.avatar || user.picture || '',
      });
      // 初始化余额
      setBalance(user.balance || 0);
    }
    // 然后从后端加载最新信息
    loadProfile();
    loadBalance();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data || response;
      // 合并store中的用户信息和后端返回的信息，优先使用后端数据
      const mergedUserData = {
        ...user,
        ...userData,
        // 确保Google登录的信息被保留
        username: userData.username || userData.name || user?.username || user?.name || '',
        email: userData.email || user?.email || '',
        avatar: userData.avatar || userData.picture || user?.avatar || user?.picture || '',
        // 更新余额
        balance: userData.balance !== undefined ? userData.balance : (user?.balance || 0),
      };
      setFormData({
        username: mergedUserData.username || mergedUserData.name || '',
        email: mergedUserData.email || '',
        avatar: mergedUserData.avatar || mergedUserData.picture || '',
      });
      setBalance(mergedUserData.balance || 0);
      setUser(mergedUserData);
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 如果后端加载失败，至少使用store中的信息
      if (user) {
        setFormData({
          username: user.username || user.name || '',
          email: user.email || '',
          avatar: user.avatar || user.picture || '',
        });
        setBalance(user.balance || 0);
      }
    }
  };

  const loadBalance = async () => {
    try {
      const response = await walletService.getBalance();
      // 后端返回格式可能是: { success, data: { balance } } 或 { data: { balance } }
      const actualBalance = response.data?.balance ?? response.data?.balance ?? (response.data ?? 0);
      if (actualBalance !== undefined && actualBalance !== null) {
        setBalance(Number(actualBalance));
        // 同时更新user store中的余额
        if (user) {
          setUser({ ...user, balance: Number(actualBalance) });
        }
      }
    } catch (error) {
      console.error('加载余额失败:', error);
      // 如果获取失败，使用用户store中的余额
      if (user?.balance !== undefined) {
        setBalance(user.balance);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(formData);
      setUser(response.data || formData);
      setIsEditing(false);
      toast.success('保存成功！');
    } catch (error) {
      toast.error(error.message || '保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/');
  };

  const menuItems = [
    { icon: Heart, label: '我的收藏', badge: '12', path: '/favorites' },
    { icon: History, label: '聊天记录', path: '/history' },
    { icon: Settings, label: '设置', path: '/settings' },
    { icon: HelpCircle, label: '帮助中心', path: '/help' },
    { icon: Shield, label: '隐私政策', path: '/privacy' },
  ];

  return (
    <div className="min-h-screen bg-dark-primary pb-24">
      {/* 个人信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent-start/20 to-transparent h-48"></div>
        
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden gradient-border p-[2px]">
                  {(formData.avatar || user?.avatar || user?.picture) ? (
                    <img
                      src={formData.avatar || user?.avatar || user?.picture}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full gradient-bg rounded-2xl flex items-center justify-center">
                      <User className="text-white" size={36} />
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 gradient-bg rounded-lg flex items-center justify-center shadow-lg">
                  <Edit2 size={14} className="text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {formData.username || user?.username || user?.name || '未设置昵称'}
                </h2>
                <p className="text-sm text-text-muted">
                  {formData.email || user?.email || '未绑定邮箱'}
                </p>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-dark-elevated border border-border rounded-xl text-text-secondary text-sm hover:border-accent-start transition-colors"
              >
                编辑资料
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                  className="p-2 bg-dark-elevated rounded-xl text-text-muted"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 gradient-bg rounded-xl text-white text-sm flex items-center gap-1"
                >
                  <Save size={14} />
                  保存
                </button>
              </div>
            )}
          </div>

          {/* 编辑表单 */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 mt-6"
            >
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-dark w-full"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-dark w-full"
                  placeholder="请输入邮箱"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 会员卡片 */}
      <div className="px-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 138, 0.3) 0%, rgba(255, 142, 83, 0.3) 100%)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white/80 text-sm">当前等级</p>
                <h3 className="text-2xl font-bold text-white">普通会员</h3>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">余额</p>
                <h3 className="text-2xl font-bold text-white">{balance.toLocaleString()}</h3>
              </div>
            </div>
            <button 
              onClick={() => navigate('/subscribe')}
              className="w-full py-2.5 rounded-2xl text-white font-medium text-sm transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              升级VIP享更多特权
            </button>
          </div>
        </motion.div>
      </div>

      {/* 菜单列表 */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => toast('功能开发中')}
                className="w-full flex items-center justify-between px-5 py-4 hover:glass-elevated transition-all duration-300 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-text-secondary" />
                  </div>
                  <span className="text-text-primary font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-accent-pink/20 rounded-full text-xs text-accent-pink">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={20} className="text-text-muted" />
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* 退出登录 */}
      <div className="px-4 mt-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 glass-card rounded-3xl text-red-500 font-medium hover:glass-elevated transition-all duration-300"
        >
          <LogOut size={20} />
          退出登录
        </motion.button>
      </div>

      {/* 版本信息 */}
      <p className="text-center text-text-muted text-xs mt-8">
        Clingai v1.0.0
      </p>
    </div>
  );
}
