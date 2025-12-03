import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StreamerList from './pages/StreamerList';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import useUserStore from './store/userStore';

// Google OAuth Client ID - 需要替换为你的实际Client ID
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

// 检查 Client ID 是否配置
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
  console.warn('⚠️ Google Client ID 未配置，Google 登录功能将不可用');
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  // 如果 Client ID 未配置，仍然渲染应用但不提供 Google OAuth Provider
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="streamers" element={<StreamerList />} />
            </Route>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="chat/:id" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
              <Route path="wallet" element={<Wallet />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* 公开路由 - 不需要登录 */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="streamers" element={<StreamerList />} />
            </Route>
            {/* 需要登录的路由 */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="chat/:id" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
              <Route path="wallet" element={<Wallet />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

