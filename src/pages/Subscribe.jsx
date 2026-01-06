import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import orderService from '../services/orderService';

// Benchmark parity: "Hot AI Pro+" subscription plans
const subscriptionPlans = [
  {
    id: 'super',
    name: 'SUPER',
    period: 'Yearly access',
    price: 59.99,
    pricePerWeek: 1.15,
    gradient: true, // Pink/purple gradient with sparkle texture
  },
  {
    id: 'monthly',
    name: 'MONTHLY ACCESS',
    period: 'just $19.99 per month',
    price: 19.99,
    pricePerDay: 0.60,
    gradient: false, // Dark gray
  },
];

const features = [
  'Unlock HD Export',
  '100 Videos + 200 Coins! (1 video=10 coins)',
  'Unlock All Aesthetic Video Templates',
  'Remove Watermark',
];

export default function Subscribe() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState(subscriptionPlans);

  // Fetch VIP prices from API (benchmark: /app/get_vip_price)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await orderService.getPlans();
        if (response.success && response.data.plans) {
          setPlans(response.data.plans);
        }
      } catch (error) {
        console.error('Failed to fetch VIP prices:', error);
      }
    };
    fetchPrices();
  }, []);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await orderService.createOrder('subscription', null, selectedPlan, 'stripe');

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-24 relative overflow-hidden">
      {/* Background video (benchmark: login-BsmNReAx.mp4) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      >
        <source src="/assets/login-BsmNReAx.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10">
        {/* Close button (top-left X) */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-white mb-6"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title: "Hot AI Pro+" */}
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Hot AI Pro+</h1>
        <p className="text-white/70 text-sm text-center mb-8">
          UNLOCK ALL ENHANCEMENT FEATURES AND AI VIDEOS
        </p>

        {/* Features list with red checkmarks */}
        <div className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-white text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action buttons: SUBSCRIBE (left) + COINS (right) */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setSelectedPlan(plans[0]?.id)}
            className={`flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 ${
              selectedPlan === plans[0]?.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                : 'bg-gradient-to-r from-pink-600 to-purple-600'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            SUBSCRIBE
          </button>
          <button
            onClick={() => navigate('/coins')}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm bg-[#262626] flex items-center justify-center gap-2"
          >
            <span>$</span>
            COINS
          </button>
        </div>

        {/* Subscription Plans (2 cards side-by-side) */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-2xl p-4 cursor-pointer transition-all ${
                selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''
              } ${
                plan.gradient
                  ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600'
                  : 'bg-[#141414]'
              }`}
            >
              {/* Crown icon (for SUPER plan, bottom-right, semi-transparent) */}
              {plan.gradient && (
                <div className="absolute bottom-2 right-2 opacity-30">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              )}

              <div className="relative z-10">
                <div className="text-white font-bold text-sm mb-1">{plan.name}</div>
                <div className="text-white/80 text-xs mb-2">{plan.period}</div>
                <div className="text-white font-bold text-lg">Just ${plan.price}</div>
                {plan.pricePerWeek && (
                  <div className="text-white/70 text-xs">${plan.pricePerWeek} per week</div>
                )}
                {plan.pricePerDay && (
                  <div className="text-white/70 text-xs">${plan.pricePerDay} per day</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stripe payment button (full-width, red/pink gradient) */}
        <button
          onClick={handlePurchase}
          disabled={!selectedPlan || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg uppercase flex items-center justify-center gap-2 ${
            !selectedPlan || isProcessing
              ? 'bg-[#262626] text-[#666] cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-900/20'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            'stripe'
          )}
        </button>
      </div>
    </div>
  );
}

