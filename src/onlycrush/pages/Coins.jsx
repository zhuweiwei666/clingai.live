import { useEffect, useMemo, useState } from 'react';
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

function CoinIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

const fallbackPackages = [
  { id: 'package1', coins: 10, price: 5, bonus: 10 },
  { id: 'package2', coins: 100, price: 10, bonus: 100 },
  { id: 'package3', coins: 210, price: 20, bonus: 210 },
  { id: 'package4', coins: 550, price: 50, bonus: 550 },
  { id: 'package5', coins: 1200, price: 100, bonus: 1200 },
  { id: 'package6', coins: 2500, price: 200, bonus: 2500 },
];

export default function Coins() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(fallbackPackages);
  const [selectedId, setSelectedId] = useState(fallbackPackages[0]?.id);

  useEffect(() => {
    (async () => {
      try {
        // Target site: GET /app/get_coins_prices -> { code, msg, data: { list: [...] } }
        const res = await api.get('/app/get_coins_prices');
        const pkgs = res?.data?.data?.list;
        if (Array.isArray(pkgs) && pkgs.length) {
          // Normalize to current UI shape
          const normalized = pkgs.map((p) => ({
            id: p.id,
            coins: p.coins,
            price: p.price,
            bonus: p.coins_text?.gift_coins ?? p.coins_text?.origin_coins ?? p.coins,
            icon: p.icon,
          }));
          setPackages(normalized);
          setSelectedId(normalized[0]?.id);
        }
      } catch {
        // keep fallback
      }
    })();
  }, []);

  const selectedPkg = useMemo(() => packages.find((p) => p.id === selectedId) || packages[0], [packages, selectedId]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-24">
      {/* Background collage (approximation) */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-10 -left-10 w-52 h-72 bg-white/10 rounded-[28px] rotate-[-12deg]" />
        <div className="absolute -top-16 left-28 w-52 h-72 bg-white/10 rounded-[28px] rotate-[8deg]" />
        <div className="absolute top-10 right-[-40px] w-56 h-72 bg-white/10 rounded-[28px] rotate-[14deg]" />
        <div className="absolute top-56 left-[-30px] w-56 h-72 bg-white/10 rounded-[28px] rotate-[10deg]" />
        <div className="absolute top-56 right-[-30px] w-56 h-72 bg-white/10 rounded-[28px] rotate-[-10deg]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
      </div>

      <div className="relative z-10 px-5 pt-6">
        {/* Close */}
        <button className="text-white/90" onClick={() => navigate(-1)} aria-label="Close">
          <CloseIcon />
        </button>

        <h1 className="mt-10 text-center text-[44px] font-extrabold tracking-tight">Buy Coins</h1>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {packages.map((pkg) => {
            const active = pkg.id === selectedId;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedId(pkg.id)}
                className={`relative rounded-[18px] bg-[#2a2a2a]/95 border ${
                  active ? 'border-purple-500' : 'border-white/0'
                } px-5 py-4 text-left`}
              >
                <span className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white text-sm font-bold">
                  +{pkg.bonus || 0} Coins
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-white/90">
                    <CoinIcon />
                  </span>
                  <span className="text-[34px] font-extrabold">{pkg.coins}</span>
                </div>
                <div className="mt-1 text-white/50 text-[18px]">${pkg.price}</div>
              </button>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div className="fixed left-0 right-0 bottom-[calc(70px+env(safe-area-inset-bottom))] px-4 z-20">
          <div className="flex items-center gap-4">
            <button
              className="w-14 h-14 rounded-full bg-white/10 text-white/80 flex items-center justify-center text-3xl"
              aria-label="More"
            >
              …
            </button>
            <button
              className="flex-1 h-14 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[34px] font-extrabold tracking-wide"
              onClick={() => navigate('/subscribe')}
              title={selectedPkg ? `Buy ${selectedPkg.coins} coins` : 'Buy coins'}
            >
              stripe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



