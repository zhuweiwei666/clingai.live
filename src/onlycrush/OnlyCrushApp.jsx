import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import OnlyCrushLayout from './layout/OnlyCrushLayout.jsx';

// New OnlyCrush Home/All pages
import Home from './pages/Home.jsx';
import All from './pages/All.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import OCCreate from './pages/Create.jsx';
import Profile from '../pages/Profile.jsx';
import Quiz from '../pages/Quiz.jsx';
import Access from '../pages/Access.jsx';
import OCFaceSwap from './pages/FaceSwap.jsx';
import Remove from '../pages/Remove.jsx';
// New OnlyCrush pages
import OCFeedback from './pages/Feedback.jsx';
import OCResult from './pages/Result.jsx';
import OCAIImage from './pages/AIImage.jsx';
import OCChatEdit from './pages/ChatEdit.jsx';
import OCHD from './pages/HD.jsx';
import OCDressUp from './pages/DressUp.jsx';
import Pricing from '../pages/Pricing.jsx';
import Terms from '../pages/Terms.jsx';
import Privacy from '../pages/Privacy.jsx';
import Refund from '../pages/Refund.jsx';
import Takeoff from './pages/Takeoff.jsx';
import Coins from './pages/Coins.jsx';
import Subscribe from './pages/Subscribe.jsx';
import SubscribeSuper from './pages/SubscribeSuper.jsx';
import Makeover from './pages/Makeover.jsx';
import My from './pages/My.jsx';
import History from './pages/History.jsx';
import Paylist from './pages/Paylist.jsx';
import Setting from './pages/Setting.jsx';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com';

export default function OnlyCrushApp() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth routes - no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main routes with OnlyCrush layout */}
            <Route path="/" element={<OnlyCrushLayout />}>
              <Route index element={<Home />} />
              <Route path="all" element={<All />} />

              {/* Tool routes */}
              <Route path="ai-image" element={<OCAIImage />} />
              <Route path="ai-video" element={<Home />} />
              <Route path="chat-edit" element={<OCChatEdit />} />
              <Route path="hd" element={<OCHD />} />

              {/* Benchmark: /remove is 404, /takeoff is the “Custom Outfit” tool. */}
              <Route path="remove" element={<Navigate to="/takeoff" replace />} />
              <Route path="takeoff" element={<Takeoff />} />

              {/* Makeover hub */}
              <Route path="makeover" element={<Makeover />} />
              <Route path="face-swap" element={<OCFaceSwap />} />
              <Route path="makeovergen" element={<OCFaceSwap />} />
              <Route path="face" element={<OCFaceSwap />} />
              <Route path="dress-up" element={<OCDressUp />} />

              {/* Monetization */}
              <Route path="pricing" element={<Pricing />} />
              <Route path="coins" element={<Coins />} />
              <Route path="subscribe" element={<Subscribe />} />
              <Route path="subscribeSuper" element={<SubscribeSuper />} />
              <Route path="oncesubscribe" element={<Subscribe />} />
              <Route path="paylist" element={<Paylist />} />
              <Route path="payment-history" element={<Paylist />} />

              {/* Legal */}
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="refund" element={<Refund />} />

              {/* Create + Result */}
              <Route path="create" element={<OCCreate />} />
              <Route path="tools" element={<OCCreate />} />
              <Route path="generate" element={<OCCreate />} />
              <Route path="result" element={<OCResult />} />

              {/* Profile + Settings */}
              <Route path="profile" element={<My />} />
              <Route path="my" element={<My />} />
              <Route path="history" element={<History />} />
              <Route path="setting" element={<Setting />} />
              <Route path="settings" element={<Setting />} />

              {/* Misc */}
              <Route path="feedback" element={<OCFeedback />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="access" element={<Access />} />
              <Route path="token" element={<Access />} />
              <Route path="vibe" element={<Home />} />
              <Route path="pwa" element={<Home />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '12px',
              },
            }}
          />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}


