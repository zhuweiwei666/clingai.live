import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Check, Coins, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';

export default function Subscribe() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [activeTab, setActiveTab] = useState('subscribe'); // 'subscribe' or 'coins'
  const [selectedPlan, setSelectedPlan] = useState(null);

  const features = [
    '解锁高清导出',
    '50个视频 + 100金币！(1个视频=10金币)',
    '解锁所有精美视频模板',
    '移除水印',
  ];

  const subscribePlans = [
    {
      id: 'yearly',
      name: 'SUPER',
      period: '年度订阅',
      price: 59.99,
      periodPrice: 1.15,
      periodUnit: '周',
      badge: 'Best Offer',
      popular: true,
    },
    {
      id: 'monthly',
      name: '月度订阅',
      period: '月度访问',
      price: 19.99,
      periodPrice: 0.60,
      periodUnit: '天',
      badge: null,
      popular: false,
    },
  ];

  const coinPackages = [
    {
      id: 'package1',
      coins: 500,
      bonus: 100,
      price: 50.00,
      popular: false,
    },
    {
      id: 'package2',
      coins: 200,
      bonus: 50,
      price: 20.00,
      popular: true,
      badge: 'Best Offer',
    },
    {
      id: 'package3',
      coins: 20,
      bonus: 0,
      price: 5.00,
      popular: false,
    },
  ];

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: '/subscribe' } } });
      return;
    }
    setSelectedPlan(plan);
    toast.success('订阅功能开发中，敬请期待');
    // TODO: 实现订阅支付逻辑
  };

  const handlePurchaseCoins = (packageItem) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login', { state: { from: { pathname: '/subscribe' } } });
      return;
    }
    toast.success('充值功能开发中，敬请期待');
    // TODO: 实现金币购买逻辑
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* 返回按钮 */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="px-6 pb-24">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto gradient-bg rounded-3xl flex items-center justify-center shadow-2xl mb-4">
              <Sparkles className="text-white" size={48} />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Hot AI Pro+</h1>
            <p className="text-text-secondary text-sm">解锁所有增强功能和AI视频</p>
          </div>

          {/* 功能列表 */}
          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-left"
              >
                <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-text-primary text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 标签切换 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6 glass-card rounded-2xl p-1"
        >
          <button
            onClick={() => setActiveTab('subscribe')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'subscribe'
                ? 'gradient-bg text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Crown size={18} />
            <span className="font-medium">订阅</span>
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'coins'
                ? 'gradient-bg text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Coins size={18} />
            <span className="font-medium">金币</span>
          </button>
        </motion.div>

        {/* 订阅方案 */}
        {activeTab === 'subscribe' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {subscribePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative rounded-3xl p-5 overflow-hidden cursor-pointer transition-all duration-300 ${
                  plan.popular
                    ? 'ring-2 ring-accent-pink'
                    : 'glass-card hover:glass-elevated'
                }`}
                onClick={() => handleSubscribe(plan)}
                style={
                  plan.popular
                    ? {
                        background: 'linear-gradient(135deg, rgba(255, 107, 138, 0.2) 0%, rgba(255, 142, 83, 0.2) 100%)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '2px solid rgba(255, 107, 138, 0.3)',
                      }
                    : {}
                }
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3 px-3 py-1 gradient-bg rounded-full">
                    <span className="text-white text-xs font-bold">{plan.badge}</span>
                  </div>
                )}
                {plan.popular && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                )}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                      <p className="text-text-muted text-sm">{plan.period}</p>
                    </div>
                    {plan.popular && <Crown size={24} className="text-accent-pink" />}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold gradient-text">${plan.price}</span>
                      <span className="text-text-muted text-sm">/{plan.period.includes('年') ? '年' : '月'}</span>
                    </div>
                    <p className="text-text-secondary text-xs">
                      相当于 ${plan.periodPrice}/{plan.periodUnit}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 金币套餐 */}
        {activeTab === 'coins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {coinPackages.map((packageItem, index) => (
              <motion.div
                key={packageItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative rounded-3xl p-5 overflow-hidden cursor-pointer transition-all duration-300 ${
                  packageItem.popular
                    ? 'ring-2 ring-accent-pink'
                    : 'glass-card hover:glass-elevated'
                }`}
                onClick={() => handlePurchaseCoins(packageItem)}
                style={
                  packageItem.popular
                    ? {
                        background: 'linear-gradient(135deg, rgba(255, 107, 138, 0.2) 0%, rgba(255, 142, 83, 0.2) 100%)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '2px solid rgba(255, 107, 138, 0.3)',
                      }
                    : {}
                }
              >
                {packageItem.badge && (
                  <div className="absolute top-3 right-3 px-3 py-1 gradient-bg rounded-full">
                    <span className="text-white text-xs font-bold">{packageItem.badge}</span>
                  </div>
                )}
                {packageItem.popular && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                )}
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins size={24} className="text-accent-pink" />
                      <div>
                        <h3 className="text-lg font-bold text-text-primary">
                          {packageItem.coins} 金币
                          {packageItem.bonus > 0 && (
                            <span className="text-accent-pink ml-2">+ {packageItem.bonus} 金币</span>
                          )}
                        </h3>
                        {packageItem.bonus > 0 && (
                          <p className="text-text-muted text-xs">赠送 {packageItem.bonus} 金币</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold gradient-text">${packageItem.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 继续按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <button
            onClick={() => {
              if (activeTab === 'subscribe' && subscribePlans.length > 0) {
                handleSubscribe(subscribePlans[0]);
              } else if (activeTab === 'coins' && coinPackages.length > 0) {
                handlePurchaseCoins(coinPackages[0]);
              }
            }}
            className="w-full py-4 gradient-bg rounded-2xl text-white font-bold text-lg shadow-xl hover:opacity-90 transition-opacity"
          >
            继续
          </button>
        </motion.div>

        {/* 说明文字 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-text-muted text-xs mt-6"
        >
          订阅将自动续费，可随时取消
        </motion.p>
      </div>
    </div>
  );
}
