import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useUserStore from '../../store/userStore';

function CloseIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1-3-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  'Unlock HD Export',
  { text: '100 Videos + 200 Coins!', sub: '(1 video=10 conins)' },
  'Unlock All Aesthetic Video Templates',
  'Remove Watermark',
];

const fallbackPlans = [
  { id: 'super', name: 'SUPER', period: 'Yearly access', fullPrice: 59.99, price: 1.15, priceUnit: 'per week', gradient: true },
  { id: 'monthly', name: 'MONTHLY ACCESS', period: 'just $19.99 per month', fullPrice: 19.99, price: 0.60, priceUnit: 'per day', gradient: false },
];

export default function Subscribe() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [plans, setPlans] = useState(fallbackPlans);
  const [selectedId, setSelectedId] = useState('super');
  const [activeTab, setActiveTab] = useState('subscribe');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Target site: GET /app/get_vip_price -> { code, msg, data: { yearly, monthly, weekly } }
        const res = await api.get('/app/get_vip_price');
        const vip = res?.data?.data;
        const yearly = vip?.yearly?.[0];
        const monthly = vip?.monthly?.[0];
        if (yearly && monthly) {
          // Build UI cards 1:1 using target copy (use button text fields for display parity)
          const nextPlans = [
            {
              id: 'yearly',
              name: 'SUPER',
              period: yearly.price_data?.button_text || 'Yearly access',
              fullPrice: Number(yearly.price) || 59.99,
              price: 1.15,
              priceUnit: 'per week',
              gradient: true,
              raw: yearly,
            },
            {
              id: 'monthly',
              name: 'MONTHLY ACCESS',
              period: monthly.price_data?.button_price_text || 'just $19.99 per month',
              fullPrice: 19.99,
              price: 0.60,
              priceUnit: 'per day',
              gradient: false,
              raw: monthly,
            },
          ];
          setPlans(nextPlans);
          setSelectedId('yearly');
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedId) || plans[0], [plans, selectedId]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }
    if (!selectedPlan?.id) return;

    setIsProcessing(true);
    try {
      const result = await api.post('/order/create', {
        type: 'subscription',
        planId: selectedPlan.id,
        paymentMethod: 'stripe',
      });
      const paymentUrl = result?.data?.paymentUrl;
      if (paymentUrl) window.location.href = paymentUrl;
      else toast.error('Failed to start payment');
    } catch (e) {
      toast.error(e?.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      >
        <source src="https://h5.onlycrush.app/assets/login-BsmNReAx.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Close button */}
        <div className="p-4">
          <button className="text-white/90 hover:text-white" onClick={() => navigate(-1)} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
          {/* Title */}
          <h1 className="text-center">
            <span
              className="text-5xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Hot AI Pro+
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-white/80 text-sm text-center uppercase tracking-wide">
            UNLOCK ALL ENHANCEMENT FEATURES AND AI VIDEOS
          </p>

          {/* Features list */}
          <div className="mt-6 space-y-3 w-full max-w-sm">
            {features.map((f, i) => {
              const text = typeof f === 'string' ? f : f.text;
              const sub = typeof f === 'object' ? f.sub : null;
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-pink-500 mt-0.5">
                    <CheckIcon />
                  </span>
                  <span className="text-white text-base">
                    {text}
                    {sub && <span className="text-white/50 text-sm ml-1">{sub}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-4 pb-6">
          {/* Tab switcher */}
          <div className="rounded-2xl bg-[#1a1a1a] p-1.5 flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('subscribe')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'subscribe'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white'
                  : 'text-white/50'
              }`}
            >
              <CrownIcon />
              SUBSCRIBE
            </button>
            <button
              onClick={() => {
                setActiveTab('coins');
                navigate('/coins');
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'coins'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white'
                  : 'text-white/50'
              }`}
            >
              <span className="text-lg">$</span>
              COINS
            </button>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {plans.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative rounded-2xl p-4 text-left transition-all ${
                    active ? 'ring-2 ring-white' : ''
                  } ${
                    p.gradient
                      ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-400'
                      : 'bg-[#1a1a1a]'
                  }`}
                >
                  <div className="text-white font-bold text-sm uppercase">{p.name}</div>
                  <div className="text-white/60 text-xs mt-0.5">{p.period}</div>

                  {p.gradient && (
                    <div className="text-white/40 text-xs mt-1 line-through">
                      Just ${p.fullPrice} per year
                    </div>
                  )}

                  <div className="mt-3">
                    <span className="text-white font-bold text-2xl">${p.price}</span>
                  </div>
                  <div className="text-white/60 text-xs">{p.priceUnit}</div>

                  {/* Crown decoration for gradient card */}
                  {p.gradient && (
                    <div className="absolute bottom-3 right-3 text-white/20">
                      <CrownIcon />
                    </div>
                  )}

                  {/* Moon decoration for dark card */}
                  {!p.gradient && (
                    <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-purple-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              className="w-12 h-12 rounded-full bg-[#2a2a2a] text-white/60 flex items-center justify-center"
              aria-label="More options"
            >
              <span className="text-xl">•••</span>
            </button>
            <button
              className={`flex-1 h-12 rounded-full font-bold text-xl transition-all ${
                isProcessing
                  ? 'bg-white/10 text-white/40'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
              }`}
              onClick={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing…' : 'stripe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
