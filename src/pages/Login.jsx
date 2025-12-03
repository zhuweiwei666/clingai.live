import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useUserStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // 获取重定向路径，如果没有则返回主页
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.login(formData.username, formData.password);
      
      if (response.token) {
        setToken(response.token);
        setUser(response.user || { username: formData.username });
        toast.success('登录成功！');
        navigate(from, { replace: true });
      } else {
        toast.error(response.message || '登录失败，请检查用户名和密码');
      }
    } catch (error) {
      toast.error(error.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Google Client ID - 直接硬编码，确保 Google 登录功能可用
  // 使用字符串拼接避免被压缩工具优化掉
  const googleClientId = '1031646438202-' + 'g9kg86khnp6tdh13b8e75f5p6r95jutg' + '.apps.googleusercontent.com';
  const isGoogleEnabled = true; // 始终启用
  
  // 调试信息 - 强制输出，确保代码被执行
  useEffect(() => {
    console.log('✅✅✅ Google Client ID 已配置:', googleClientId);
    console.log('✅✅✅ Google Enabled:', isGoogleEnabled);
    console.log('✅✅✅ Google Client ID 长度:', googleClientId.length);
  }, [googleClientId, isGoogleEnabled]);

  // Google登录
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!isGoogleEnabled) {
        toast.error('Google 登录未配置，请联系管理员');
        return;
      }

      setGoogleLoading(true);
      try {
        // 获取Google用户信息
        const googleUserInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }).then(res => res.json());

        // 调用后端API进行Google登录
        const response = await userService.googleLogin({
          google_id: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture,
        });

        if (response.token) {
          setToken(response.token);
          setUser(response.user || {
            username: googleUserInfo.name,
            email: googleUserInfo.email,
            avatar: googleUserInfo.picture,
          });
          toast.success('Google登录成功！');
          navigate(from, { replace: true });
        } else {
          toast.error(response.message || 'Google登录失败');
        }
      } catch (error) {
        console.error('Google登录错误:', error);
        toast.error('Google登录失败，请稍后重试');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google登录错误:', error);
      if (!isGoogleEnabled) {
        toast.error('Google 登录未配置');
      } else {
        toast.error('Google登录失败');
      }
      setGoogleLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-effect rounded-2xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">欢迎回来</h1>
          <p className="text-gray-600">登录你的Honey AI账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 分隔线 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或</span>
          </div>
        </div>

        {/* Google登录按钮 - 始终显示 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading || !isGoogleEnabled}
          className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          title={!isGoogleEnabled ? 'Google 登录未配置' : ''}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {googleLoading ? '登录中...' : '使用 Google 登录'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            还没有账户？{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
              立即注册
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

