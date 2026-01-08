import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import authService from '../services/authService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useUserStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      const { user, token } = response;
      
      if (token) {
        setToken(token);
        setUser(user);
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!googleResponse.ok) throw new Error('Failed to get Google user info');
        
        const googleUserInfo = await googleResponse.json();
        const response = await authService.googleLogin({
          googleId: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture,
        });
        
        const token = response.token;
        const user = response.user;
        
        if (!token || !user) throw new Error('Missing token or user');
        
        setToken(token);
        setUser({
          ...user,
          username: user.username || googleUserInfo.name,
          email: user.email || googleUserInfo.email,
          avatar: user.avatar || googleUserInfo.picture,
        });
        
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Google login error:', error);
        toast.error(error.message || 'Google login failed');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      if (error.error === 'popup_closed_by_user') {
        toast.error('Login cancelled');
      } else {
        toast.error('Google login failed');
      }
      setGoogleLoading(false);
    },
  });

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #8b5cf6 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #ec4899 0%, transparent 50%)',
        }}
      />

      {/* Back button */}
      <div className="relative z-10 p-4 pt-[max(16px,env(safe-area-inset-top))]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <BackIcon />
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div
            className="text-[72px] font-extrabold text-white mb-4"
            style={{
              fontFamily: 'Notable, sans-serif',
              textShadow: '0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(236,72,153,0.4)',
              transform: 'perspective(500px) rotateX(10deg)',
            }}
          >
            Hot AI
          </div>
          <p className="text-white/70 text-lg">Experience full functionality</p>
        </div>

        {/* Login options */}
        <div className="w-full max-w-sm space-y-4">
          {/* Google Login - Primary */}
          <button
            onClick={() => handleGoogleLogin()}
            disabled={loading || googleLoading}
            className="w-full py-4 rounded-full bg-white text-black font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-black text-white/50 text-sm">or</span>
            </div>
          </div>

          {/* Email Login Toggle */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              Sign in with Email
            </button>
          ) : (
            /* Email Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-4 rounded-full font-bold text-lg text-white flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-white/50 text-sm hover:text-white transition-colors"
              >
                Back to options
              </button>
            </form>
          )}
        </div>

        {/* Register link */}
        <div className="mt-8 text-center">
          <p className="text-white/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-white/30 text-xs">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
