import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Create from './pages/Create';
import Profile from './pages/Profile';
import AIImage from './pages/AIImage';
import FaceSwap from './pages/FaceSwap';
import DressUp from './pages/DressUp';
import HD from './pages/HD';
import Remove from './pages/Remove';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import useUserStore from './store/userStore';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth routes - no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="ai-image" element={<AIImage />} />
              <Route path="face-swap" element={<FaceSwap />} />
              <Route path="dress-up" element={<DressUp />} />
              <Route path="hd" element={<HD />} />
              <Route path="remove" element={<Remove />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="refund" element={<Refund />} />
            </Route>

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="create" element={<Create />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(28, 28, 30, 0.9)',
                color: '#fff',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
              },
            }}
          />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
