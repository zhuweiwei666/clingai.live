import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data || response;
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        avatar: userData.avatar || '',
      });
      setUser(userData);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(formData);
      setUser(response.data || formData);
      setIsEditing(false);
      toast.success('保存成功！');
    } catch (error) {
      toast.error(error.message || '保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">个人资料</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit2 size={18} />
              编辑
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                保存
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '';
                  }}
                />
              ) : (
                <User className="text-white" size={64} />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={18} />
              用户名
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.username || '未设置'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={18} />
              邮箱
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{formData.email || '未设置'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              注册时间
            </label>
            <p className="px-4 py-3 bg-gray-50 rounded-lg">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('zh-CN')
                : '未知'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

