import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M15 18l-6-6 6-6" />
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

function Item({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-[#141414] rounded-xl p-4 border border-[#262626] flex items-center justify-between text-left active:bg-[#1a1a1a] transition-colors ${
        danger ? 'text-red-400' : 'text-white'
      }`}
    >
      <span className="font-extrabold">{label}</span>
      {!danger ? <ChevronRight /> : null}
    </button>
  );
}

export default function Setting() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

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
        <div className="text-[26px] font-extrabold">Settings</div>
      </div>

      <div className="px-5 py-6 space-y-6">
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
          <div className="text-white/60 text-[12px] font-extrabold mb-3">ACCOUNT</div>
          <div className="text-white font-extrabold text-[18px]">{user?.email || 'Guest'}</div>
          <div className="text-white/50 text-[14px] mt-1">{user?.username ? `@${user.username}` : ''}</div>
        </div>

        <div className="space-y-3">
          <div className="text-white/60 text-[12px] font-extrabold">GENERAL</div>
          <Item label="Feedback" onClick={() => navigate('/feedback')} />
          <Item label="Payment History" onClick={() => navigate('/paylist')} />
          <Item label="Buy Coins" onClick={() => navigate('/coins')} />
          <Item label="Subscribe" onClick={() => navigate('/subscribe')} />
        </div>

        <div className="space-y-3">
          <div className="text-white/60 text-[12px] font-extrabold">LEGAL</div>
          <Item label="Terms of Use" onClick={() => navigate('/terms')} />
          <Item label="Privacy Policy" onClick={() => navigate('/privacy')} />
          <Item label="Refund Policy" onClick={() => navigate('/refund')} />
        </div>

        <div className="space-y-3">
          <div className="text-white/60 text-[12px] font-extrabold">ACCOUNT</div>
          <Item
            label="Log Out"
            danger
            onClick={() => {
              logout();
              navigate('/');
            }}
          />
        </div>
      </div>
    </div>
  );
}


