import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Sparkles, ArrowLeft } from 'lucide-react';
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
      const { user, token, balance } = response.data || {};
      
      if (token) {
        setToken(token);
        setUser({ ...user, balance } || { username: formData.username });
        toast.success('登录成功！');
        navigate(from, { replace: true });
      } else {
        toast.error('登录失败，请检查用户名和密码');
      }
    } catch (error) {
      toast.error(error.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Google Client ID
  const googleClientId = '1031646438202-g9kg86khnp6tdh13b8e75f5p6r95jutg.apps.googleusercontent.com';
  const isGoogleEnabled = true;
  
  useEffect(() => {
    console.log('========================================');
    console.log('🔧 [Google登录] 初始化');
    console.log('🔧 [Google登录] Client ID:', googleClientId);
    console.log('🔧 [Google登录] 当前域名:', window.location.origin);
    console.log('========================================');
  }, []);

  // Google登录 - 使用 popup 模式
  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit', // 使用隐式流程
    onSuccess: async (tokenResponse) => {
      console.log('========================================');
      console.log('✅ [步骤1] Google OAuth 授权成功');
      console.log('✅ [步骤1] Access Token:', tokenResponse.access_token?.slice(0, 30) + '...');
      console.log('✅ [步骤1] Token类型:', tokenResponse.token_type);
      console.log('✅ [步骤1] 过期时间:', tokenResponse.expires_in);
      console.log('✅ [步骤1] Scope:', tokenResponse.scope);
      console.log('========================================');
      
      setGoogleLoading(true);
      
      try {
        // 步骤2: 获取Google用户信息
        console.log('🔄 [步骤2] 开始获取Google用户信息...');
        console.log('🔄 [步骤2] 请求URL: https://www.googleapis.com/oauth2/v3/userinfo');
        
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        console.log('🔄 [步骤2] Google API响应状态:', googleResponse.status, googleResponse.statusText);
        
        if (!googleResponse.ok) {
          const errorText = await googleResponse.text();
          console.error('❌ [步骤2] Google API错误:', errorText);
          throw new Error(`Google API错误: ${googleResponse.status}`);
        }
        
        const googleUserInfo = await googleResponse.json();
        
        console.log('========================================');
        console.log('✅ [步骤2] 获取Google用户信息成功');
        console.log('✅ [步骤2] Google ID (sub):', googleUserInfo.sub);
        console.log('✅ [步骤2] Email:', googleUserInfo.email);
        console.log('✅ [步骤2] Name:', googleUserInfo.name);
        console.log('✅ [步骤2] Picture:', googleUserInfo.picture?.slice(0, 50) + '...');
        console.log('✅ [步骤2] Email验证:', googleUserInfo.email_verified);
        console.log('========================================');

        // 步骤3: 发送数据到后端
        const backendPayload = {
          google_id: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture,
        };
        
        console.log('🔄 [步骤3] 开始请求后端API...');
        console.log('🔄 [步骤3] 请求URL: /api/users/google-login');
        console.log('🔄 [步骤3] 请求数据:', JSON.stringify(backendPayload, null, 2));
        
        const startTime = Date.now();
        const response = await userService.googleLogin(backendPayload);
        const endTime = Date.now();
        
        console.log('========================================');
        console.log('✅ [步骤3] 后端API响应成功');
        console.log('✅ [步骤3] 响应耗时:', endTime - startTime, 'ms');
        console.log('✅ [步骤3] 响应数据:', JSON.stringify(response, null, 2));
        console.log('========================================');

        // 步骤4: 处理登录结果
        const { user, token } = response.data || {};
        
        console.log('🔄 [步骤4] 解析登录结果...');
        console.log('🔄 [步骤4] Token存在:', !!token);
        console.log('🔄 [步骤4] User存在:', !!user);
        
        if (token) {
          console.log('✅ [步骤4] 登录成功，保存Token和用户信息');
          setToken(token);
          // 确保头像字段正确保存
          const userData = user ? {
            ...user,
            avatar: user.avatar || user.picture || googleUserInfo.picture,
          } : {
            username: googleUserInfo.name,
            email: googleUserInfo.email,
            avatar: googleUserInfo.picture,
          };
          console.log('✅ [步骤4] 保存的用户数据:', JSON.stringify(userData, null, 2));
          setUser(userData);
          toast.success('Google登录成功！');
          console.log('✅ [步骤4] 即将跳转到:', from);
          navigate(from, { replace: true });
        } else {
          console.error('❌ [步骤4] 登录失败: 后端未返回Token');
          console.error('❌ [步骤4] 完整响应:', response);
          toast.error('Google登录失败：服务器未返回Token');
        }
      } catch (error) {
        console.log('========================================');
        console.error('❌ [错误] Google登录过程中发生错误');
        console.error('❌ [错误] 错误类型:', error.name);
        console.error('❌ [错误] 错误消息:', error.message);
        console.error('❌ [错误] 错误代码:', error.code);
        console.error('❌ [错误] 状态码:', error.statusCode);
        console.error('❌ [错误] 完整错误对象:', error);
        
        if (error.response) {
          console.error('❌ [错误] 响应状态:', error.response.status);
          console.error('❌ [错误] 响应数据:', error.response.data);
        }
        
        if (error.request) {
          console.error('❌ [错误] 请求对象:', error.request);
        }
        console.log('========================================');
        
        toast.error(`Google登录失败: ${error.message || '请稍后重试'}`);
      } finally {
        setGoogleLoading(false);
        console.log('🔄 [完成] Google登录流程结束');
      }
    },
    onError: (error) => {
      console.log('========================================');
      console.error('❌ [Google OAuth错误] 授权失败');
      console.error('❌ [Google OAuth错误] 错误类型:', error.error);
      console.error('❌ [Google OAuth错误] 错误描述:', error.error_description);
      console.error('❌ [Google OAuth错误] 完整错误:', error);
      console.log('========================================');
      
      let errorMsg = 'Google登录失败';
      if (error.error === 'popup_closed_by_user') {
        errorMsg = '您已取消Google登录';
      } else if (error.error === 'access_denied') {
        errorMsg = 'Google登录授权被拒绝';
      } else if (error.error_description) {
        errorMsg = error.error_description;
      }
      
      toast.error(errorMsg);
      setGoogleLoading(false);
    },
  });

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* 返回按钮 */}
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
              欢迎回来
            </motion.h1>
            <motion.p 
              className="text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              登录你的 Clingai 账户
            </motion.p>
          </div>

          {/* 表单 */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                用户名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-dark w-full"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                密码
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-dark w-full"
                placeholder="请输入密码"
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
                  登录中...
                </span>
              ) : '登录'}
            </button>
          </motion.form>

          {/* 分隔线 */}
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
              <span className="px-4 glass-card rounded-full text-text-muted text-sm">或</span>
            </div>
          </motion.div>

          {/* Google登录按钮 */}
          <motion.button
            onClick={() => {
              console.log('========================================');
              console.log('🔄 [开始] 用户点击Google登录按钮');
              console.log('🔄 [开始] 时间:', new Date().toISOString());
              console.log('========================================');
              handleGoogleLogin();
            }}
            disabled={loading || googleLoading || !isGoogleEnabled}
            className="btn-secondary w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
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
          </motion.button>

          {/* 注册链接 */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-text-secondary">
              还没有账户？{' '}
              <Link to="/register" className="text-accent-start hover:text-accent-end font-semibold transition-colors">
                立即注册
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
