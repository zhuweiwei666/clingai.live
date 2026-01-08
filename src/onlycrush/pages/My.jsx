import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useUserStore from '../../store/userStore';

// Icons
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-6 h-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function TaskListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10h8M8 14h5" />
      <path d="M16 10l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
    </svg>
  );
}

function ArrowRightCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8l4 4-4 4M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 1010 10" strokeLinecap="round" />
    </svg>
  );
}

function ProPill() {
  return (
    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold">
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
        const infoRes = await api.post('/app/user/info', {});
        const info = infoRes?.data || {};
        setPlan(info.plan || 'free');
        setCoins(info.coins || 0);

        if (!info.user && isAuthenticated) {
          logout();
        } else if (info.user) {
          setUser({ ...info.user, plan: info.plan, coins: info.coins, planExpireAt: info.planExpireAt });
        }
      } catch {
        // keep whatever we have
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

  // Not logged in state
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
      {/* Header - matching target exactly */}
      <div className="sticky top-0 z-50 bg-black px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-0.5">
          <span className="text-white text-2xl font-bold tracking-wide" style={{ fontFamily: 'Notable, sans-serif' }}>
            HOT
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-white text-lg font-bold ml-1"
            style={{
              fontFamily: 'Notable, sans-serif',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            AI
          </span>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/subscribe')} className="hover:scale-105 transition-transform">
            <ProPill />
          </button>
          <button onClick={() => navigate('/history')} className="text-white/80 hover:text-white transition-colors">
            <TaskListIcon />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <UserIcon />
          </button>
        </div>
      </div>

      {/* Free/Pro Status Card */}
      <div className="px-4 mt-4">
        <div className="bg-[#1a1a1a] rounded-2xl p-5 flex items-center justify-between">
          <div className="text-white text-[32px] font-bold" style={{ fontFamily: 'Livvic, sans-serif' }}>
            {plan === 'pro' || plan === 'super' ? 'Pro' : 'Free'}
          </div>
          <button
            onClick={() => navigate('/subscribe')}
            className="px-6 py-3 rounded-full text-white text-base font-bold active:scale-95 transition-transform flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            Subscribe <span className="text-lg">🤩</span>
          </button>
        </div>
      </div>

      {/* Two Cards Row - Works + Discord */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        {/* Works Card */}
        <button
          className="relative aspect-square bg-[#1a1a1a] rounded-2xl overflow-hidden flex flex-col"
          onClick={() => navigate('/history')}
        >
          {/* Top right - Trash icon */}
          <div className="absolute top-3 right-3 text-white/40">
            <TrashIcon />
          </div>

          {/* Center content */}
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <div className="text-white/60">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="text-white text-[48px] font-bold">{worksCount}</div>
            )}
          </div>

          {/* Bottom - Arrow */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60">
            <ArrowRightCircle />
          </div>
        </button>

        {/* Discord Card */}
        <a
          href="https://discord.gg/hotai"
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, #5865f2 0%, #4752c4 50%, #7c3aed 100%)',
          }}
        >
          {/* Sparkle pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Discord logo */}
          <div className="relative z-10 mb-2 text-white">
            <DiscordIcon />
          </div>

          {/* Text */}
          <div className="relative z-10 text-white font-bold text-lg mb-3">
            Join Us <span className="text-yellow-300">Now</span>
          </div>

          {/* Button */}
          <button className="relative z-10 px-4 py-2 bg-[#4752c4]/60 backdrop-blur-sm rounded-xl text-white text-xs font-medium border border-white/10">
            Create templates with me
          </button>
        </a>
      </div>

      {/* Bottom navigation padding */}
      <div className="h-20" />
    </div>
  );
}
