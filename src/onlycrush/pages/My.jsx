import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useUserStore from '../../store/userStore';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ProPill() {
  return (
    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]">
      Pro
    </div>
  );
}

export default function My() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser, logout } = useUserStore();
  const [coins, setCoins] = useState(user?.coins || 0);
  const [plan, setPlan] = useState(user?.plan || 'free');
  const [worksCount, setWorksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayName = useMemo(() => {
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Benchmark compat: POST /api/app/user/info (supports logged-out)
        const infoRes = await api.post('/app/user/info', {});
        const info = infoRes?.data || {};
        setPlan(info.plan || 'free');
        setCoins(info.coins || 0);

        // If token is stale, normalize state
        if (!info.user && isAuthenticated) {
          logout();
        } else if (info.user) {
          setUser({ ...info.user, plan: info.plan, coins: info.coins, planExpireAt: info.planExpireAt });
        }
      } catch {
        // keep whatever we have, but don't black screen
      }

      try {
        if (localStorage.getItem('token')) {
          const worksRes = await api.get('/user/works', { params: { page: 1, limit: 1 } });
          const pagination = worksRes?.data?.pagination;
          if (pagination?.total !== undefined) setWorksCount(pagination.total);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, logout, setUser]);

  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
          <div
            className="text-[64px] font-extrabold text-white mb-8"
            style={{
              fontFamily: 'Notable, sans-serif',
              textShadow: '0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(236,72,153,0.3)',
              transform: 'perspective(500px) rotateX(15deg)',
            }}
          >
            Hot AI
          </div>
          <div className="text-white/70 text-[22px] mb-8 text-center">Experience full functionality</div>
          <button
            className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-[22px] font-extrabold active:scale-95 transition-transform"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-white text-2xl font-bold tracking-wider" style={{ fontFamily: 'Notable, sans-serif' }}>
            HOT
          </span>
          <span
            className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full text-white text-lg font-bold"
            style={{ fontFamily: 'Notable, sans-serif' }}
          >
            AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/subscribe')} className="hover:scale-105 transition-transform">
            <ProPill />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden text-white/80">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <UserIcon />}
          </div>
        </div>
      </div>

      {/* Plan badge */}
      <div className="px-5 mt-5">
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5 flex items-center justify-between">
          <div className="text-white text-[42px] font-extrabold" style={{ fontFamily: 'Livvic, sans-serif' }}>
            {plan === 'pro' || plan === 'super' ? 'Pro' : 'Free'}
          </div>
          <button
            onClick={() => navigate('/subscribe')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-[16px] font-extrabold active:scale-95 transition-transform"
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Two cards */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-4">
        <button
          className="relative aspect-[3/4] bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden"
          onClick={() => navigate('/history')}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          <div className="relative z-10 h-full p-4 flex flex-col">
            <div className="text-white/70 text-[18px] font-bold">My Works</div>
            <div className="mt-auto text-white text-[44px] font-extrabold">{loading ? '…' : worksCount}</div>
            <div className="text-white/50 text-[14px]">tap to view</div>
          </div>
        </button>

        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 p-4">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-800/40 backdrop-blur-sm flex items-center justify-center mb-3 text-white">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.5 8.25l-1.25 6.5a.75.75 0 01-.74.61H9.49a.75.75 0 01-.74-.61l-1.25-6.5A.75.75 0 018.23 9h7.54a.75.75 0 01.73.25z" />
              </svg>
            </div>
            <div className="text-white font-extrabold text-[16px] mb-4">Join Us Now</div>
            <button className="mt-auto px-4 py-2 bg-purple-800/60 backdrop-blur-sm rounded-lg text-white text-[12px] font-bold">
              Create templates with me
            </button>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-5 mt-6">
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-white font-extrabold">{displayName[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-white text-[22px] font-extrabold">{displayName}</div>
              <div className="text-white/60 text-[14px]">{user?.email || ''}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-white text-[30px] font-extrabold">{coins}</div>
              <div className="text-white/50 text-[12px] mt-1">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-white text-[30px] font-extrabold">{loading ? '…' : worksCount}</div>
              <div className="text-white/50 text-[12px] mt-1">Works</div>
            </div>
            <div className="text-center">
              <div className="text-white text-[30px] font-extrabold capitalize">{plan || 'free'}</div>
              <div className="text-white/50 text-[12px] mt-1">Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 mt-6 space-y-3">
        {[
          { label: 'My Works', path: '/history' },
          { label: 'Buy Coins', path: '/coins' },
          { label: 'Payment History', path: '/paylist' },
          { label: 'Settings', path: '/setting' },
        ].map((item) => (
          <button
            key={item.path}
            className="w-full bg-[#141414] rounded-xl p-4 border border-[#262626] flex items-center justify-between text-left active:bg-[#1a1a1a] transition-colors"
            onClick={() => navigate(item.path)}
          >
            <span className="text-white font-bold">{item.label}</span>
            <ChevronRight />
          </button>
        ))}
      </div>

      <div className="px-5 mt-6">
        <button
          className="w-full bg-[#141414] rounded-xl p-4 border border-[#262626] text-red-400 font-bold active:bg-[#1a1a1a] transition-colors"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}


