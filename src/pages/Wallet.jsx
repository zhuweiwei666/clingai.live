import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon, Plus, History, Coins, CreditCard, ChevronRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { walletService } from '../services/walletService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Wallet() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const [balance, setBalance] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: '/wallet' } } });
      return;
    }
    loadBalance();
    loadHistory();
  }, [isAuthenticated, navigate]);

  const loadBalance = async () => {
    try {
      const response = await walletService.getBalance();
      // 后端返回: { success, data: { balance } }
      setBalance(response.data?.balance || 0);
    } catch (error) {
      console.error('加载余额失败:', error);
      // 如果获取失败，使用用户store中的余额
      setBalance(user?.balance || 0);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await walletService.getTransactions();
      // 后端返回: { success, data: { transactions: [], pagination: {...} } }
      setHistory(response.data?.transactions || []);
    } catch (error) {
      console.error('加载交易记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const rechargeOptions = [
    { amount: 6, coins: 60, bonus: 0 },
    { amount: 30, coins: 300, bonus: 30 },
    { amount: 68, coins: 680, bonus: 100, popular: true },
    { amount: 128, coins: 1280, bonus: 200 },
    { amount: 328, coins: 3280, bonus: 600 },
    { amount: 648, coins: 6480, bonus: 1500 },
  ];

  const handleRecharge = (option) => {
    toast('充值功能开发中');
    setShowRecharge(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'recharge': return { icon: Plus, color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'consume': return { icon: Coins, color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'bonus': return { icon: Sparkles, color: 'text-accent-start', bg: 'bg-accent-start/10' };
      default: return { icon: Coins, color: 'text-text-muted', bg: 'bg-dark-elevated' };
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary pb-24">
      {/* 余额卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 gradient-bg rounded-3xl p-6 relative overflow-hidden"
      >
        {/* 装饰元素 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <WalletIcon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">我的钱包</p>
                <p className="text-white font-medium">Clingai Wallet</p>
              </div>
            </div>
            <CreditCard size={32} className="text-white/40" />
          </div>
          
          <div className="mb-6">
            <p className="text-white/70 text-sm mb-1">金币余额</p>
            <p className="text-4xl font-bold text-white flex items-center gap-3">
              <Coins size={32} className="text-yellow-400" />
              {balance.toLocaleString()}
            </p>
          </div>
          
          <button
            onClick={() => setShowRecharge(true)}
            className="w-full py-3.5 bg-white rounded-2xl text-accent-start font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
          >
            <Plus size={20} />
            充值金币
          </button>
        </div>
      </motion.div>

      {/* 快捷功能 */}
      <div className="grid grid-cols-3 gap-3 mx-4 mt-6">
        {[
          { icon: '💎', label: 'VIP特权', desc: '更多权益' },
          { icon: '🎁', label: '每日签到', desc: '领取奖励' },
          { icon: '🎫', label: '优惠券', desc: '查看优惠' },
        ].map((item, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            onClick={() => toast('功能开发中')}
            className="bg-dark-card rounded-2xl p-4 text-center hover:bg-dark-elevated transition-colors"
          >
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <p className="text-text-primary text-sm font-medium">{item.label}</p>
            <p className="text-text-muted text-xs">{item.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* 交易记录 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className="text-accent-start" />
            <h2 className="text-lg font-bold text-text-primary">交易记录</h2>
          </div>
          <button className="text-sm text-text-muted flex items-center gap-1">
            全部 <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="bg-dark-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-text-muted">加载中...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-text-muted">暂无交易记录</p>
            </div>
          ) : (
            history.map((item, index) => {
              const typeInfo = getTypeIcon(item.type);
              const Icon = typeInfo.icon;
              return (
                <div
                  key={item._id || item.id || index}
                  className={`flex items-center justify-between px-4 py-4 ${
                    index < history.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.bg}`}>
                      <Icon size={20} className={typeInfo.color} />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{item.description || item.desc}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(item.createdAt || item.created_at).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.amount > 0 ? '+' : ''}{item.amount} 金币
                  </p>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* 充值弹窗 */}
      <AnimatePresence>
        {showRecharge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
            onClick={() => setShowRecharge(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-card rounded-t-3xl w-full max-w-lg p-6 pb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">充值金币</h3>
                <button
                  onClick={() => setShowRecharge(false)}
                  className="p-2 hover:bg-dark-elevated rounded-full transition-colors"
                >
                  <X size={20} className="text-text-muted" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {rechargeOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecharge(option)}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      option.popular
                        ? 'border-accent-start bg-accent-start/10'
                        : 'border-border bg-dark-elevated hover:border-accent-start/50'
                    }`}
                  >
                    {option.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent-start rounded-full text-[10px] text-white font-bold">
                        最受欢迎
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Coins size={16} className="text-yellow-400" />
                      <span className="font-bold text-text-primary">{option.coins}</span>
                    </div>
                    {option.bonus > 0 && (
                      <p className="text-xs text-accent-start mb-2">+{option.bonus} 赠送</p>
                    )}
                    <p className="text-lg font-bold text-text-primary">¥{option.amount}</p>
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-text-muted text-center mb-4">
                充值即表示同意《用户协议》和《隐私政策》
              </p>
              
              <button className="w-full btn-primary py-4">
                确认充值
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
