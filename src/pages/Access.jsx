import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';

export default function Access() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();

  const handleUpgrade = () => {
    navigate('/subscribe');
  };

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col items-center justify-center px-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white">Access Restricted</h1>
        <p className="text-white/60 text-lg">
          This content is only available for premium subscribers.
        </p>

        <div className="space-y-4 pt-4">
          <button
            onClick={handleUpgrade}
            className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Upgrade to Pro
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl font-medium text-white/80 bg-[#141414] border border-[#262626]"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

