import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useUserStore from '../../store/userStore';

function CloseIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const features = [
  'Unlock HD Export',
  '100 Videos + 200 Coins! (1 video=10 coins)',
  'Unlock All Aesthetic Video Templates',
  'Remove Watermark',
];

const fallbackPlans = [
  { id: 'super', name: 'SUPER', period: 'Yearly access', price: 59.99, pricePerWeek: 1.15, gradient: true },
  { id: 'monthly', name: 'MONTHLY ACCESS', period: 'just $19.99 per month', price: 19.99, pricePerDay: 0.6, gradient: false },
];

export default function Subscribe() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [plans, setPlans] = useState(fallbackPlans);
  const [selectedId, setSelectedId] = useState('super');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/app/get_vip_price', {});
        const serverPlans = res?.data?.plans;
        if (Array.isArray(serverPlans) && serverPlans.length) setPlans(serverPlans);
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
    <div className="min-h-screen bg-black relative overflow-hidden pb-24">
      {/* Background video from benchmark */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
      >
        <source src="https://h5.onlycrush.app/assets/login-BsmNReAx.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-black" />

      <div className="relative z-10 px-5 pt-6">
        <button className="text-white/90" onClick={() => navigate(-1)} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="mt-6 text-center">
          <div className="text-[52px] font-extrabold leading-none">Hot AI</div>
          <div className="mt-2 inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[28px] font-extrabold">
            Pro+
          </div>
          <div className="mt-3 text-white/70 text-[18px] tracking-wide text-center uppercase">
            UNLOCK ALL ENHANCEMENT FEATURES AND AI VIDEOS
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3 text-white">
              <span className="text-pink-500 text-xl">✓</span>
              <span className="text-[20px]">{f}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-black/40 p-3 flex gap-3">
          <button
            className="flex-1 rounded-[18px] py-4 bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white text-[20px] font-extrabold flex items-center justify-center gap-3"
            onClick={() => setSelectedId('super')}
          >
            <span className="text-[20px]">♛</span> SUBSCRIBE
          </button>
          <button
            className="flex-1 rounded-[18px] py-4 bg-white/10 text-white/70 text-[20px] font-extrabold flex items-center justify-center gap-3"
            onClick={() => navigate('/coins')}
          >
            <span className="text-[18px]">$</span> COINS
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {plans.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`relative rounded-[22px] p-5 text-left border ${
                  active ? 'border-purple-500' : 'border-white/10'
                } ${p.gradient ? 'bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600' : 'bg-white/5'}`}
              >
                <div className="text-white font-extrabold text-[18px]">{p.name}</div>
                <div className="mt-1 text-white/70 text-[16px]">{p.period}</div>
                <div className="mt-6 text-white font-extrabold text-[26px]">
                  Just ${p.price}
                  {p.id === 'super' ? ' per year' : ''}
                </div>
                {p.pricePerWeek ? (
                  <div className="text-white/70 text-[18px]">${p.pricePerWeek} per week</div>
                ) : null}
                {p.pricePerDay ? <div className="text-white/70 text-[18px]">${p.pricePerDay} per day</div> : null}

                {p.gradient ? (
                  <div className="absolute bottom-4 right-4 text-white/30 text-[44px]">♛</div>
                ) : (
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-purple-600/80" />
                )}
              </button>
            );
          })}
        </div>

        <div className="fixed left-0 right-0 bottom-[calc(70px+env(safe-area-inset-bottom))] px-4 z-20">
          <div className="flex items-center gap-4">
            <button
              className="w-14 h-14 rounded-full bg-white/10 text-white/80 flex items-center justify-center text-3xl"
              aria-label="More"
            >
              …
            </button>
            <button
              className={`flex-1 h-14 rounded-full text-white text-[34px] font-extrabold ${
                isProcessing ? 'bg-white/10 text-white/40' : 'bg-gradient-to-r from-red-600 to-pink-600'
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



