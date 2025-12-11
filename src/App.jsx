import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StreamerList from './pages/StreamerList';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Subscribe from './pages/Subscribe';
import useUserStore from './store/userStore';

// Google OAuth Client ID
// 直接使用 Client ID，确保 Google 登录功能可用
// 使用字符串拼接避免被压缩工具优化掉
const GOOGLE_CLIENT_ID = '1031646438202-' + 'g9kg86khnp6tdh13b8e75f5p6r95jutg' + '.apps.googleusercontent.com';

// 调试：确认 Client ID - 强制输出
console.log('✅✅✅ Google Client ID 已配置:', GOOGLE_CLIENT_ID);
console.log('✅✅✅ Client ID 长度:', GOOGLE_CLIENT_ID.length);

function PrivateRoute({ children }) {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  // 使用配置的 Client ID
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
              <Route path="messages" element={<Messages />} />
              <Route path="chat/:id" element={<Chat />} />
              <Route path="profile" element={<Profile />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="subscribe" element={<Subscribe />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

