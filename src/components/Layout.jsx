import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

// SVG Icons (matching OnlyCrush exactly)
const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const CreateIcon = ({ active }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="7" r="3" />
    <path d="M7 10v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4" />
    <rect x="9" y="14" width="6" height="6" rx="1" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="4" width="14" height="16" rx="2" />
    <path d="M9 10h6M9 14h4" />
    <circle cx="16" cy="16" r="4" fill="currentColor" stroke="none" />
    <path d="M14.5 16h3M16 14.5v3" stroke="white" strokeWidth="1.5" />
  </svg>
);

// Top navigation tabs
const topTabs = [
  { path: '/', label: 'Remove' },
  { path: '/chat-edit', label: 'Chat Edit' },
  { path: '/ai-image', label: 'AI Image' },
  { path: '/ai-video', label: 'AI Video', highlight: true },
  { path: '/hd', label: 'HD' },
  { path: '/watermark', label: 'MaterMark' },
];

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Pages that show top tabs
  const showTopTabs = ['/', '/ai-image', '/ai-video', '/face-swap', '/dress-up', '/hd', '/remove', '/chat-edit', '/watermark'].includes(currentPath);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top Navigation Tabs */}
      {showTopTabs && (
        <header className="sticky top-0 z-50 bg-[#0a0a0a]">
          <div className="top-tabs">
            {topTabs.map((tab) => {
              const isActive = tab.highlight 
                ? currentPath === '/' || currentPath === tab.path
                : currentPath === tab.path;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`top-tab ${isActive ? 'active' : ''}`}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 safe-area-bottom">
        <Outlet />
      </main>

      {/* Bottom Navigation - OnlyCrush Style */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {/* Home */}
          <NavLink 
            to="/" 
            className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
          >
            <HomeIcon active={currentPath === '/'} />
          </NavLink>

          {/* Create (Center) */}
          <NavLink 
            to="/face-swap" 
            className="nav-item nav-item-center"
          >
            <div className="nav-item-center-button">
              <span className="super-badge">Super</span>
              <CreateIcon />
            </div>
          </NavLink>

          {/* Profile */}
          <NavLink 
            to="/profile" 
            className={`nav-item ${currentPath === '/profile' ? 'active' : ''}`}
          >
            <ProfileIcon active={currentPath === '/profile'} />
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
