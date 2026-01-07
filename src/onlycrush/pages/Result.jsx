import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7" />
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
const LoaderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-red-500">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useUserStore();
  const taskId = searchParams.get('taskId');

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
  }, [taskId]);

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

  // Loading state (no task yet)
  if (loading && !task) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoaderIcon />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Result</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Processing */}
        {(task?.status === 'pending' || task?.status === 'processing') && (
          <div className="bg-[#141414] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-purple-500"><LoaderIcon /></div>
            <p className="text-white font-medium">Processing your creation...</p>
            <p className="text-white/60 text-sm mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Failed */}
        {task?.status === 'failed' && (
          <div className="bg-[#141414] rounded-2xl p-6 text-center">
            <div className="mx-auto mb-4"><ErrorIcon /></div>
            <p className="text-white font-medium">Generation failed</p>
            <p className="text-white/60 text-sm mt-2">{task.error || 'Please try again'}</p>
            <button onClick={() => navigate('/create')} className="mt-4 px-6 py-2 bg-purple-600 rounded-xl text-white font-medium">Try Again</button>
          </div>
        )}

        {/* Completed */}
        {task?.status === 'completed' && task?.outputUrl && (
          <>
            <div className="bg-[#141414] rounded-2xl overflow-hidden">
              {task.type === 'video' || task.type === 'photo_to_video' ? (
                <video src={task.outputUrl} controls autoPlay loop muted playsInline className="w-full aspect-[3/4] object-cover" />
              ) : (
                <img src={task.outputUrl} alt="Result" className="w-full aspect-[3/4] object-cover" />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleDownload} disabled={downloading} className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {downloading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <DownloadIcon />
                    Download
                  </>
                )}
              </button>
              <button onClick={handleShare} className="flex-1 py-4 bg-[#262626] rounded-xl text-white font-bold flex items-center justify-center gap-2">
                <ShareIcon />
                Share
              </button>
            </div>

            {/* Upsell CTA */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-center">
              <h3 className="text-white font-bold text-lg mb-2">Unlock More Features</h3>
              <p className="text-white/80 text-sm mb-4">Subscribe to get unlimited access</p>
              <button onClick={() => navigate('/subscribe')} className="px-6 py-2 bg-white text-purple-600 rounded-xl font-bold">Subscribe Now</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

