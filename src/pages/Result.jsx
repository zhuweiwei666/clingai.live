import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import { generationService } from '../services/generationService';

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const taskId = searchParams.get('taskId');
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!taskId) {
      toast.error('Missing task ID');
      navigate('/my-works');
      return;
    }

    loadTask();
    // Poll for status updates if task is still processing
    const interval = setInterval(() => {
      if (task && (task.status === 'pending' || task.status === 'processing')) {
        loadTask();
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId, task?.status]);

  const loadTask = async () => {
    try {
      const response = await generationService.getVideoStatus(taskId);
      if (response.success) {
        setTask(response.data);
        if (response.data.status === 'completed' && response.data.outputUrl) {
          setLoading(false);
        } else if (response.data.status === 'failed') {
          setLoading(false);
          toast.error('Task failed');
        }
      }
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('Failed to load task');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!task?.outputUrl) {
      toast.error('No output available');
      return;
    }

    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = task.outputUrl;
      link.download = `result-${taskId}.${task.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!task?.outputUrl) {
      toast.error('No output available');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my AI creation!',
          url: task.outputUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(task.outputUrl);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading && !task) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Result</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Status */}
        {task?.status === 'pending' || task?.status === 'processing' ? (
          <div className="bg-[#141414] rounded-2xl p-6 text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Processing your creation...</p>
            <p className="text-white/60 text-sm mt-2">This may take a few moments</p>
          </div>
        ) : task?.status === 'failed' ? (
          <div className="bg-[#141414] rounded-2xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white font-medium">Generation failed</p>
            <p className="text-white/60 text-sm mt-2">{task.error || 'Please try again'}</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-xl text-white font-medium"
            >
              Try Again
            </button>
          </div>
        ) : task?.status === 'completed' && task?.outputUrl ? (
          <>
            {/* Result Media */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#141414] rounded-2xl overflow-hidden"
            >
              {task.type === 'video' || task.type === 'photo_to_video' ? (
                <video
                  src={task.outputUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <img
                  src={task.outputUrl}
                  alt="Result"
                  className="w-full aspect-[3/4] object-cover"
                />
              )}
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download
                  </>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex-1 py-4 bg-[#262626] rounded-xl text-white font-bold flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </div>

            {/* Upsell CTA (benchmark: /subscribeSuper?from=result) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-center"
            >
              <h3 className="text-white font-bold text-lg mb-2">Unlock More Features</h3>
              <p className="text-white/80 text-sm mb-4">Subscribe to get unlimited access</p>
              <button
                onClick={() => navigate('/subscribe')}
                className="px-6 py-2 bg-white text-purple-600 rounded-xl font-bold"
              >
                Subscribe Now
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
}

