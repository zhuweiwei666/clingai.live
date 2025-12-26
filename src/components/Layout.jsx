import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, User, Sparkles, Image, Video, Wand2, Shirt, Eraser } from 'lucide-react';
import { motion } from 'framer-motion';

// Top navigation tabs (feature categories)
const featureTabs = [
  { path: '/', label: 'AI Video', icon: Video, isActive: (path) => path === '/' },
  { path: '/ai-image', label: 'AI Image', icon: Image },
  { path: '/face-swap', label: 'Face Swap', icon: Wand2 },
  { path: '/dress-up', label: 'Dress Up', icon: Shirt },
  { path: '/hd', label: 'HD', icon: Sparkles },
  { path: '/remove', label: 'Remove', icon: Eraser },
];

// Bottom navigation
const bottomNav = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/create', label: 'Create', icon: Sparkles, special: true },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if current page should show top tabs
  const showTopTabs = ['/', '/ai-image', '/face-swap', '/dress-up', '/hd', '/remove'].includes(currentPath);

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* Top Navigation Tabs */}
      {showTopTabs && (
        <header className="sticky top-0 z-50 glass-dark">
          <div className="tab-nav">
            {featureTabs.map((tab) => {
              const isActive = tab.isActive ? tab.isActive(currentPath) : currentPath === tab.path;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`tab-item ${isActive ? 'active' : ''}`}
                >
                  <tab.icon className="w-4 h-4 mr-1.5 inline-block" />
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

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {bottomNav.map((item) => {
            const isActive = currentPath === item.path;
            
            if (item.special) {
              // Special create button
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="relative -mt-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg"
                    style={{
                      boxShadow: '0 4px 20px rgba(255, 107, 138, 0.5)'
                    }}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </motion.div>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                {isActive && <div className="nav-indicator" />}
                <item.icon className={`w-5 h-5 ${isActive ? 'text-accent-start' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
