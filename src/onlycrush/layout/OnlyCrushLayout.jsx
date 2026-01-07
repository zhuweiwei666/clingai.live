import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/primitives/Button.jsx';

// Reuse icon SVGs (iterated later to match benchmark pixel-perfect)
const RemoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M3 9h18" />
    <path d="M15 9l-6 6M9 9l6 6" strokeWidth="2" />
  </svg>
);
const ChatEditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 7h10M7 12h6" />
    <path d="M16 16l2-2-2-2" strokeWidth="2" />
  </svg>
);
const AIImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8" cy="8" r="2" />
    <path d="M21 15l-5-5-8 8" />
  </svg>
);
const AIVideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polygon points="10,8 16,12 10,16" fill="currentColor" />
  </svg>
);
const DressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
  </svg>
);

const featureTabs = [
  // Benchmark note: /remove is a 404; real “Remove” entry is /takeoff
  { path: '/takeoff', label: 'Remove', icon: RemoveIcon, badge: '18' },
  { path: '/chat-edit', label: 'Chat Edit', icon: ChatEditIcon, badge: '18' },
  { path: '/ai-image', label: 'AI Image', icon: AIImageIcon, badge: '18' },
  { path: '/', label: 'AI Video', icon: AIVideoIcon, isMain: true, superBadge: true },
  { path: '/makeover?type=change_face_image', label: 'Face Swap', icon: AIImageIcon, superBadge: true },
  { path: '/makeover?type=dress_up', label: 'Dress Up', icon: DressIcon, superBadge: true },
];

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7a3 3 0 0 1 3-3h12a2 2 0 0 1 2 2v2" />
    <path d="M3 10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" />
    <circle cx="17" cy="14" r="1" fill="currentColor" />
  </svg>
);

const InfinityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18.178 8c5.096 0 5.096 8 0 8-2.548 0-5.096-4-7.644-4-2.548 0-5.096 4-7.644 4-5.096 0-5.096-8 0-8 2.548 0 5.096 4 7.644 4 2.548 0 5.096-4 7.644-4z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function OnlyCrushLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Benchmark: only some pages show the HOT AI header + feature tabs row.
  const showHeader = ['/', '/my', '/history'].includes(currentPath);
  const showFeatureTabs = currentPath === '/';

  return (
    <div className="oc-root">
      {showHeader && (
        <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-md pt-[max(12px,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between px-4 py-3">
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
              <Button variant="pill" onClick={() => navigate('/subscribe')} className="px-4 py-2 text-sm">
                Pro
              </Button>
              <button className="text-white/80 hover:text-white transition-colors" onClick={() => navigate('/create')}>
                <EditIcon />
              </button>
              <button className="text-white/80 hover:text-white transition-colors" onClick={() => navigate('/my')}>
                <UserIcon />
              </button>
            </div>
          </div>

          {showFeatureTabs && (
            <div className="feature-tabs">
              {featureTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.isMain ? currentPath === '/' : location.pathname + location.search === tab.path;
                return (
                  <NavLink key={tab.path} to={tab.path} className={`feature-tab ${isActive ? 'active' : ''}`}>
                    {tab.badge && <span className="feature-tab-badge">{tab.badge}</span>}
                    {tab.superBadge && <span className="feature-tab-super">Super</span>}
                    <div className="feature-tab-icon">
                      <Icon />
                    </div>
                    <span className="feature-tab-label">{tab.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </header>
      )}

      <main className="oc-safe-bottom">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <VideoIcon />
          </NavLink>

          <NavLink to="/coins" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <WalletIcon />
          </NavLink>

          <NavLink to="/create" className="nav-item nav-item-center">
            <div className="nav-item-center-button">
              <span className="super-badge">Super</span>
              <InfinityIcon />
            </div>
          </NavLink>

          <NavLink to="/my" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UserIcon />
          </NavLink>
        </div>
      </nav>
    </div>
  );
}


