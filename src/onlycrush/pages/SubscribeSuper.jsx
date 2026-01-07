import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function CloseIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function SubscribeSuper() {
  const navigate = useNavigate();
  const [price, setPrice] = useState({ price: 59.99, pricePerWeek: 1.15 });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/app/get_vip_price', {});
        const plans = res?.data?.plans;
        const superPlan = Array.isArray(plans) ? plans.find((p) => p.id === 'super') : null;
        if (superPlan?.price) setPrice({ price: superPlan.price, pricePerWeek: superPlan.pricePerWeek || 1.15 });
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#ff2d2d] via-[#ff3b7a] to-[#ff3bb0] pb-24">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-28 left-10 w-28 h-28 rounded-[24px] bg-white/20" />
        <div className="absolute top-28 left-44 w-28 h-28 rounded-[24px] bg-white/20" />
        <div className="absolute top-60 left-10 w-28 h-28 rounded-[24px] bg-white/10" />
        <div className="absolute top-60 left-44 w-28 h-28 rounded-[24px] bg-white/10" />
      </div>

      <div className="relative z-10 px-6 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="text-[44px] font-extrabold tracking-tight">HotAI Super</div>
          <button onClick={() => navigate(-1)} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 opacity-70">
          <span className="w-3 h-3 rounded-full bg-white/70" />
          <span className="w-3 h-3 rounded-full bg-white/35" />
          <span className="w-3 h-3 rounded-full bg-white/35" />
          <span className="w-3 h-3 rounded-full bg-white/35" />
          <span className="w-3 h-3 rounded-full bg-white/35" />
        </div>

        <div className="mt-10 text-center">
          <div className="text-[44px] font-extrabold">Exclusive Annual Fantasy</div>
          <div className="mt-3 text-[22px] text-white/90 leading-snug">
            Access all templates, including
            <br />
            exclusive 18+ premium ones!
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="w-[180px] h-[180px] rounded-full bg-white/25 flex items-center justify-center">
            <div className="w-[140px] h-[140px] rounded-full bg-white flex items-center justify-center">
              <div className="text-[#ff3b7a] text-[110px] font-black leading-none">∞</div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[22px] bg-white text-black p-5 relative overflow-hidden">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#ff3b7a] to-[#ff2d2d] text-white font-bold text-[18px]">
            HotAI Super
          </div>
          <div className="mt-4 text-[22px] text-black/60">Yearly access</div>
          <div className="mt-2 text-[34px] font-extrabold">Just ${price.price} per year</div>
          <div className="text-[26px] text-black/70">${price.pricePerWeek}/per week</div>

          <div className="mt-6 flex items-center gap-4">
            <button className="w-14 h-14 rounded-full bg-black/10 text-black/50 flex items-center justify-center text-3xl">
              …
            </button>
            <button className="flex-1 h-14 rounded-[18px] bg-gradient-to-r from-[#ff4a65] to-[#ff3bb0] text-white text-[34px] font-extrabold">
              stripe
            </button>
          </div>

          <div className="absolute right-6 top-6 text-[#ff3b7a]/30 text-[42px]">♛</div>
        </div>
      </div>
    </div>
  );
}



