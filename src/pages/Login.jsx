import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useUserStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
        toast.error('Login failed, please check your credentials');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth - 使用 implicit 流程（后端已支持）
  // 注意：COOP警告是@react-oauth/google库内部的，不影响实际功能
  // 如果popup模式有问题，可以尝试使用redirect模式
  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      
      try {
        console.log('[Login] Google OAuth token received');
        
        // Get Google user info
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        if (!googleResponse.ok) {
          const errorText = await googleResponse.text();
          console.error('[Login] Failed to get Google user info:', errorText);
          throw new Error('Failed to get Google user info');
        }
        
        const googleUserInfo = await googleResponse.json();
        console.log('[Login] Google user info:', {
          sub: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
        });

        // Send user info to our backend
        console.log('[Login] Sending Google user info to backend:', {
          googleId: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
        });
        
        const response = await authService.googleLogin({
          googleId: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture,
        });
        
        console.log('[Login] Backend response:', response);
        
        // 处理统一响应格式：response.data 可能包含 { user, token } 或 { success: true, data: { user, token } }
        let user, token;
        if (response.user && response.token) {
          // 直接格式：{ user, token }
          user = response.user;
          token = response.token;
        } else if (response.data && response.data.user && response.data.token) {
          // 嵌套格式：{ data: { user, token } }
          user = response.data.user;
          token = response.data.token;
        } else if (response.success && response.data) {
          // 统一格式：{ success: true, data: { user, token } }
          user = response.data.user;
          token = response.data.token;
        } else {
          console.error('[Login] Invalid response format:', response);
          throw new Error('Invalid response format from server');
        }
        
        if (token) {
          setToken(token);
          setUser({
            ...user,
            username: user.username || googleUserInfo.name,
            email: user.email || googleUserInfo.email,
            avatar: user.avatar || googleUserInfo.picture,
          });
          toast.success('Google login successful!');
          navigate(from, { replace: true });
        } else {
          console.error('[Login] No token in response:', response);
          toast.error('Google login failed: No token received');
        }
      } catch (error) {
        console.error('[Login] Google login error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Google login failed';
        toast.error(errorMessage);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('[Login] Google OAuth error:', error);
      console.error('[Login] Error details:', JSON.stringify(error, null, 2));
      
      // 处理不同类型的错误
      if (error.error === 'popup_closed_by_user') {
        toast.error('Google login cancelled');
      } else if (error.error === 'access_denied') {
        toast.error('Google login denied');
      } else if (error.error_description) {
        toast.error(`Google login failed: ${error.error_description}`);
      } else if (error.message) {
        toast.error(`Google login failed: ${error.message}`);
      } else {
        toast.error('Google login failed. Please try again.');
      }
      setGoogleLoading(false);
    },
  });

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <motion.div 
              className="inline-flex"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
            >
              <div className="w-20 h-20 gradient-bg rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles className="text-white" size={40} />
              </div>
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold gradient-text mt-6 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to your ClingAI account
            </motion.p>
          </div>

          {/* Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-dark w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-dark w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </motion.form>

          {/* Divider */}
          <motion.div 
            className="relative my-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 glass-card rounded-full text-text-muted text-sm">or</span>
            </div>
          </motion.div>

          {/* Google Login */}
          <motion.button
            onClick={() => handleGoogleLogin()}
            disabled={loading || googleLoading}
            className="btn-secondary w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </motion.button>

          {/* Register link */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent-start hover:text-accent-end font-semibold transition-colors">
                Sign up now
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
