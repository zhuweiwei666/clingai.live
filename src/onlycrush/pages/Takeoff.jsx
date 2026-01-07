import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import Button from '../components/primitives/Button.jsx';
import api from '../../services/api';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function Takeoff() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();

  const fileInputRef = useRef(null);
  const [sourcePreview, setSourcePreview] = useState('');
  const [sourceDataUrl, setSourceDataUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tips, setTips] = useState([]);
  const [samplePhotos, setSamplePhotos] = useState([]);
  const [showSamples, setShowSamples] = useState(false);

  const canGenerate = useMemo(() => !!sourceDataUrl && !isSubmitting, [sourceDataUrl, isSubmitting]);

  useEffect(() => {
    // Benchmark parity: load tips + sample photos even when logged out.
    (async () => {
      try {
        const [tipsRes, photosRes] = await Promise.all([
          api.get('/change_clothes_tips'),
          api.post('/photos', {}),
        ]);
        setTips(tipsRes?.data?.tips || tipsRes?.data?.data?.tips || tipsRes?.tips || []);
        setSamplePhotos(photosRes?.data?.photos || photosRes?.data?.data?.photos || photosRes?.photos || []);
      } catch (e) {
        // silent: these are non-critical
      }
    })();
  }, []);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setSourcePreview(dataUrl);
      setSourceDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onGenerate = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first.');
      navigate('/login');
      return;
    }
    if (!sourceDataUrl) return;

    setIsSubmitting(true);
    try {
      // Closest mapping for “Custom Outfit”: use dressup with sourceImage + prompt.
      const res = await api.post('/generate/dressup', {
        sourceImage: sourceDataUrl,
        prompt,
        params: {},
      });
      const taskId = res?.data?.data?.taskId || res?.data?.taskId;
      if (taskId) navigate(`/result?taskId=${taskId}`);
      else toast.success('Submitted');
    } catch (e) {
      toast.error('Generation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] px-5 pt-3 pb-24 text-white">
      <div className="flex items-center justify-between">
        <button className="text-white/90" onClick={() => navigate(-1)} aria-label="Back">
          <BackIcon />
        </button>
        <div className="text-[22px] font-semibold tracking-tight">Custom Outfit</div>
        <div className="w-7 h-7" />
      </div>

      <div className="mt-10 flex items-start gap-5">
        <div className="w-[132px] h-[132px] rounded-[18px] border border-dashed border-white/20 bg-white/5 flex items-center justify-center overflow-hidden">
          {sourcePreview ? (
            <img src={sourcePreview} alt="source" className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-10 h-10 text-white/30">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )}
        </div>

        <div className="flex-1 pt-2">
          <div className="text-[26px] font-bold leading-tight">Upload source image with a face</div>
          <div className="mt-1 text-[18px] text-orange-400">Please upload HD front-face photo.</div>

          <div className="mt-4">
            <Button variant="primary" className="w-full !rounded-[10px] !py-3" onClick={onPickFile}>
              Upload Photos <span className="ml-2">⇪</span>
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>

          <div className="mt-2 text-white/50 text-[15px]">
            No image?{' '}
            <button className="underline text-white/70" onClick={() => setShowSamples(true)}>
              Try one of these.
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[22px] bg-white/5 border border-white/10 p-4">
        <div className="text-white/45 text-[18px] mb-2">Enter your desired effect...</div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder=""
          className="w-full min-h-[220px] bg-transparent outline-none resize-none text-[16px] text-white/90"
        />
        {tips?.length > 0 && (
          <div className="mt-3 text-xs text-white/30">
            {tips.slice(0, 2).map((t, idx) => (
              <div key={idx}>• {t}</div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed left-0 right-0 bottom-[calc(70px+env(safe-area-inset-bottom))] px-4">
        <button
          className={`w-full rounded-full py-5 text-[22px] font-bold flex items-center justify-center gap-3 ${
            canGenerate ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600' : 'bg-white/10 text-white/40'
          }`}
          disabled={!canGenerate}
          onClick={onGenerate}
        >
          ✨ Generate
          <span className="ml-auto mr-2 px-3 py-1 rounded-full bg-yellow-500/90 text-black text-sm font-semibold">
            •
          </span>
        </button>
      </div>

      {showSamples && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex flex-col">
          <div className="px-4 pt-4 flex items-center justify-between">
            <div className="text-white text-lg font-semibold">Try one of these</div>
            <button className="text-white/70" onClick={() => setShowSamples(false)}>
              Close
            </button>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3 overflow-auto">
            {samplePhotos.map((p, idx) => (
              <button
                key={idx}
                className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5"
                onClick={() => {
                  setSourcePreview(p.url);
                  setSourceDataUrl(p.url);
                  setShowSamples(false);
                }}
              >
                <img src={p.url} alt="sample" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


