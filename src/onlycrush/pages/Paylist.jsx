import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function StatusPill({ status }) {
  const s = (status || '').toLowerCase();
  const cls =
    s === 'paid'
      ? 'bg-green-500/15 text-green-400 border-green-500/20'
      : s === 'pending'
        ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20'
        : 'bg-red-500/15 text-red-400 border-red-500/20';
  return <span className={`px-3 py-1 rounded-full text-[12px] font-extrabold border ${cls}`}>{s || 'unknown'}</span>;
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function Paylist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Benchmark compat: supports logged-out (returns empty)
        const res = await api.post('/app/user/payment_history', { page: 1, size: 50 });
        setOrders(res?.data?.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          aria-label="Back"
        >
          <BackIcon />
        </button>
        <div className="text-[26px] font-extrabold">Payment History</div>
      </div>

      <div className="px-5 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[92px] rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/60 text-[18px] mb-6">No payment history</div>
            <button
              onClick={() => navigate('/coins')}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[18px] font-extrabold"
            >
              Buy Coins
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id || `${o.type}-${o.createdAt}`} className="bg-[#141414] border border-[#262626] rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-extrabold text-[16px] capitalize">
                      {o.type === 'coins' ? 'Coins Purchase' : 'Subscription'}
                    </div>
                    <div className="text-white/50 text-[12px] mt-1">{formatDate(o.createdAt)}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-white font-extrabold text-[18px]">${Number(o.amount || 0).toFixed(2)}</div>
                    <StatusPill status={o.status} />
                  </div>
                </div>

                {o.type === 'coins' ? (
                  <div className="mt-3 text-white/60 text-[14px]">
                    {o.coins || 0} coins{o.bonusCoins > 0 ? ` + ${o.bonusCoins} bonus` : ''}
                  </div>
                ) : (
                  <div className="mt-3 text-white/60 text-[14px]">Plan: {o.plan || '-'}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


