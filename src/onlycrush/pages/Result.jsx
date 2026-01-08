import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
    <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-10 h-10">
    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// Animated progress bar
function ProgressBar({ progress }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)',
        }}
      />
    </div>
  );
}

// Animated spinner
function SpinnerAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-4 border-white/10"
        style={{ borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }}
      />
      {/* Inner ring */}
      <div
        className="absolute inset-3 rounded-full border-4 border-white/10"
        style={{ borderBottomColor: '#ec4899', animation: 'spin 1.5s linear infinite reverse' }}
      />
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pollCount, setPollCount] = useState(0);

  // Simulate progress during processing
  useEffect(() => {
    if (task?.status === 'pending' || task?.status === 'processing') {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + Math.random() * 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    if (task?.status === 'completed') {
      setProgress(100);
    }
  }, [task?.status]);

  // Fetch task status
  useEffect(() => {
    if (!taskId) {
      toast.error('Missing task ID');
      navigate('/history');
      return;
    }

    let intervalId;
    const fetchTask = async () => {
      try {
        setPollCount((c) => c + 1);
        const res = await api.get(`/generate/status/${taskId}`);
        const data = res.data || res;
        const normalized = {
          ...data,
          outputUrl: data.output?.resultUrl || data.outputUrl || data.resultUrl,
          type: data.type || 'video',
          status: data.status,
          error: data.error,
        };
        setTask(normalized);

        if (normalized.status === 'completed' || normalized.status === 'failed') {
          setLoading(false);
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error('Failed to load task:', err);
        toast.error('Failed to load task');
        setLoading(false);
        clearInterval(intervalId);
      }
    };

    fetchTask();
    intervalId = setInterval(fetchTask, 3000);
    return () => clearInterval(intervalId);
  }, [taskId, navigate]);

  const handleDownload = async () => {
    if (!task?.outputUrl) {
      toast.error('No output available');
      return;
    }
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = task.outputUrl;
      link.download = `result-${taskId}.${task.type === 'video' || task.type === 'photo_to_video' ? 'mp4' : 'jpg'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (err) {
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
        await navigator.share({ title: 'Check out my AI creation!', url: task.outputUrl });
      } catch (err) {
        if (err.name !== 'AbortError') toast.error('Failed to share');
      }
    } else {
      navigator.clipboard.writeText(task.outputUrl);
      toast.success('Link copied to clipboard');
    }
  };

  // Initial loading state
  if (loading && !task) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <SpinnerAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4 pt-[max(12px,env(safe-area-inset-top))]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Result</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Processing state */}
        {(task?.status === 'pending' || task?.status === 'processing') && (
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
            <SpinnerAnimation />
            
            <div className="mt-6 mb-4">
              <ProgressBar progress={progress} />
            </div>
            
            <p className="text-white font-bold text-lg mb-1">Creating your masterpiece...</p>
            <p className="text-white/50 text-sm">
              {Math.round(progress)}% complete • Please wait
            </p>
            
            {pollCount > 10 && (
              <p className="text-white/30 text-xs mt-4">
                Taking longer than expected. Please be patient...
              </p>
            )}
          </div>
        )}

        {/* Failed state */}
        {task?.status === 'failed' && (
          <div className="bg-[#1a1a1a] rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
              <ErrorIcon />
            </div>
            <p className="text-white font-bold text-lg mb-2">Generation Failed</p>
            <p className="text-white/50 text-sm mb-6">{task.error || 'Something went wrong. Please try again.'}</p>
            <button
              onClick={() => navigate('/create')}
              className="px-8 py-3 rounded-full font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Completed state */}
        {task?.status === 'completed' && task?.outputUrl && (
          <>
            {/* Success indicator */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <CheckIcon />
              </div>
              <span className="text-green-400 font-bold">Complete!</span>
            </div>

            {/* Result preview */}
            <div className="rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-2xl">
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
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-4 rounded-full text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
              >
                {downloading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <DownloadIcon />
                    Download
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-4 rounded-full bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                <ShareIcon />
                Share
              </button>
            </div>

            {/* Create more CTA */}
            <button
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-full bg-white text-black font-bold text-lg flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
            >
              Create More ✨
            </button>
          </>
        )}
      </div>

      {/* Add keyframe animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
