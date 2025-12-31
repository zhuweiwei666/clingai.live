import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coins, Crown, Check, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import orderService from '../services/orderService';

const coinPackages = [
  { id: 1, coins: 100, price: 4.99, bonus: 0, popular: false },
  { id: 2, coins: 300, price: 9.99, bonus: 50, popular: true },
  { id: 3, coins: 500, price: 14.99, bonus: 100, popular: false },
  { id: 4, coins: 1000, price: 24.99, bonus: 300, popular: false },
];

const subscriptionPlans = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 19.99,
    period: 'month',
    features: [
      '500 coins per month',
      'Priority queue',
      'HD downloads',
      'No watermarks',
    ],
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 149.99,
    period: 'year',
    discount: '37%',
    features: [
      '6000 coins per year',
      'Priority queue',
      'HD downloads',
      'No watermarks',
      'Early access to new features',
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, updateUser } = useUserStore();
  const [activeTab, setActiveTab] = useState('coins');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 处理支付回调
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');

    if (orderId && status === 'success') {
      // 支付成功，刷新用户信息
      // 可以通过重新获取用户信息来更新
      toast.success('Payment successful!');
    } else if (orderId && status === 'cancel') {
      toast.error('Payment cancelled');
    }
  }, [searchParams]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    if (activeTab === 'coins' && !selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    if (activeTab === 'subscription' && !selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      setIsProcessing(true);

      const packageId = activeTab === 'coins' ? selectedPackage : null;
      const planId = activeTab === 'subscription' ? selectedPlan : null;

      // 创建订单
      const result = await orderService.createOrder(
        activeTab === 'coins' ? 'coins' : 'subscription',
        packageId,
        planId,
        'stripe' // 默认使用 Stripe
      );

      if (result.success && result.paymentUrl) {
        // 跳转到支付页面
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Get Coins</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('coins')}
          className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
            activeTab === 'coins'
              ? 'gradient-bg text-white'
              : 'glass-card text-text-secondary'
          }`}
        >
          <Coins className="w-5 h-5 inline mr-2" />
          Buy Coins
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('subscription')}
          className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
            activeTab === 'subscription'
              ? 'gradient-bg text-white'
              : 'glass-card text-text-secondary'
          }`}
        >
          <Crown className="w-5 h-5 inline mr-2" />
          Subscribe
        </motion.button>
      </div>

      {activeTab === 'coins' ? (
        // Coin Packages
        <div className="space-y-4">
          {coinPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`glass-card rounded-3xl p-5 cursor-pointer transition-all relative ${
                selectedPackage === pkg.id
                  ? 'border-accent-start'
                  : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 right-4">
                  <span className="badge badge-super text-xs">Most Popular</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl glass-elevated flex items-center justify-center">
                    <Coins className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {pkg.coins}
                      {pkg.bonus > 0 && (
                        <span className="text-green-400 text-sm ml-2">+{pkg.bonus} bonus</span>
                      )}
                    </div>
                    <div className="text-text-muted text-sm">Coins</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${pkg.price}</div>
                  <div className="text-text-muted text-xs">
                    ${(pkg.price / (pkg.coins + pkg.bonus)).toFixed(3)}/coin
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Subscription Plans
        <div className="space-y-4">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`glass-card rounded-3xl p-6 cursor-pointer transition-all relative ${
                selectedPlan === plan.id
                  ? 'border-accent-start'
                  : ''
              }`}
            >
              {plan.discount && (
                <div className="absolute -top-3 right-4">
                  <span className="badge badge-new text-xs">Save {plan.discount}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="text-text-muted text-sm">
                    Billed {plan.period === 'month' ? 'monthly' : 'annually'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${plan.price}</div>
                  <div className="text-text-muted text-xs">/{plan.period}</div>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Purchase Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePurchase}
        disabled={(activeTab === 'coins' ? !selectedPackage : !selectedPlan) || isProcessing}
        className="w-full btn-primary py-4 text-lg disabled:opacity-50 flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 inline mr-2" />
            {activeTab === 'coins' 
              ? `Buy ${coinPackages.find(p => p.id === selectedPackage)?.coins || ''} Coins`
              : 'Subscribe Now'
            }
          </>
        )}
      </motion.button>

      <p className="text-center text-text-muted text-xs">
        Secure payment powered by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
