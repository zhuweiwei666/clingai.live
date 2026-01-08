import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

// Feature Tab Icons - matching target exactly
const RemoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h18" />
    <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" />
  </svg>
);

const AIImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="2" />
    <path d="M21 15l-5-5-8 8" />
  </svg>
);

const AIVideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polygon points="10,8 16,12 10,16" fill="currentColor" />
  </svg>
);

const FaceSwapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <circle cx="9" cy="9" r="4" />
    <circle cx="15" cy="15" r="4" />
    <path d="M12 5v14M5 12h14" strokeDasharray="2 2" />
  </svg>
);

const DressUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
  </svg>
);

const ChatEditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 8h10M7 12h6" />
    <path d="M14 16l3-3" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EnhanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 8v8M8 12h8" strokeWidth="2" />
  </svg>
);

// Feature tabs configuration
const featureTabs = [
  { path: '/takeoff', label: 'Remove', icon: RemoveIcon, badge: '18' },
  { path: '/ai-image', label: 'AI Image', icon: AIImageIcon, badge: '18' },
  { path: '/', label: 'AI Video', icon: AIVideoIcon, isMain: true, superBadge: true },
  { path: '/face-swap', label: 'Face Swap', icon: FaceSwapIcon, superBadge: true },
  { path: '/dress-up', label: 'Dress Up', icon: DressUpIcon, superBadge: true },
  { path: '/chat-edit', label: 'Chat Edit', icon: ChatEditIcon, badge: '18' },
  { path: '/hd', label: 'Enhance', icon: EnhanceIcon, badge: '18' },
];

// Bottom Nav Icons
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const MakeoverIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M12 4C9 4 7 6 7 8c0 1.5.5 2.5 1.5 3.5L6 14h12l-2.5-2.5c1-.9 1.5-2 1.5-3.5 0-2-2-4-5-4z"
      fill="currentColor"
    />
    <path d="M6 14l-1 6M18 14l1 6M12 14v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

const TaskIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 10h8M8 14h5" />
    <path d="M16 10l1 1 2-2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function OnlyCrushLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Home page: Feature Tabs only (no header)
  // My/History pages: Full header with logo + actions
  const isHomePage = currentPath === '/';
  const showFullHeader = ['/my', '/history'].includes(currentPath);
  const showFeatureTabs = isHomePage;

  return (
    <div className="oc-root min-h-screen bg-black">
      {/* Home Page: Feature Tabs at very top */}
      {isHomePage && (
        <header className="sticky top-0 z-50 bg-black pt-[max(12px,env(safe-area-inset-top))]">
          <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
            {featureTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.isMain ? currentPath === '/' : location.pathname === tab.path;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="relative flex flex-col items-center gap-1.5 min-w-[56px]"
                >
                  {/* Badge - 18+ or Super */}
                  {tab.badge && (
                    <span className="absolute -top-0.5 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center z-10">
                      {tab.badge}
                    </span>
                  )}
                  {tab.superBadge && (
                    <span
                      className="absolute -top-0.5 right-0 px-1.5 py-0.5 rounded text-white text-[7px] font-bold z-10"
                      style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}
                    >
                      Super
                    </span>
                  )}

                  {/* Icon container */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? 'bg-[#2a2a2a]' : 'bg-[#1a1a1a]'
                    }`}
                  >
                    <div className={isActive ? 'text-white' : 'text-white/50'}>
                      <Icon />
                    </div>
                  </div>

                  {/* Label - two lines max */}
                  <span className={`text-[10px] font-medium text-center leading-tight max-w-[56px] ${isActive ? 'text-white' : 'text-white/50'}`}>
                    {tab.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </header>
      )}

      {/* My/History Pages: Full header with logo */}
      {showFullHeader && (
        <header className="sticky top-0 z-50 bg-black pt-[max(12px,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between px-4 py-3">
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

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/subscribe')}
                className="px-4 py-1.5 rounded-full text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
              >
                Pro
              </button>
              <button className="text-white/80 hover:text-white transition-colors" onClick={() => navigate('/history')}>
                <TaskIcon />
              </button>
              <button className="text-white/80 hover:text-white transition-colors" onClick={() => navigate('/my')}>
                <UserIcon />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="oc-safe-bottom">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-white/40'}`}>
            <HomeIcon />
          </NavLink>

          <NavLink to="/all" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-white/40'}`}>
            <GridIcon />
          </NavLink>

          <NavLink to="/makeover" className="relative flex flex-col items-center gap-1 text-white/40">
            {/* Super badge */}
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-white text-[8px] font-bold z-10"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}
            >
              Super
            </span>
            <MakeoverIcon />
          </NavLink>

          <NavLink to="/my" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-white/40'}`}>
            <UserIcon />
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
