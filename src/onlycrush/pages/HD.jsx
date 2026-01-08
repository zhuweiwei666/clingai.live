import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const HDIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <text x="6" y="15" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">HD</text>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
  </svg>
);

// Scale options
const scaleOptions = [
  { value: 2, label: '2x', description: 'Good quality' },
  { value: 4, label: '4x', description: 'Best quality', isSuper: true },
];

export default function HD() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    setSourceFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSourcePreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleUpscale = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (!sourceFile) {
      toast.error('Please upload an image first');
      fileInputRef.current?.click();
      return;
    }

    setLoading(true);
    try {
      toast.loading('Uploading image...', { id: 'hd' });

      const formData = new FormData();
      formData.append('image', sourceFile);
      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.url || uploadRes.url;
      if (!imageUrl) throw new Error('Failed to upload image');

      toast.loading('Enhancing to HD...', { id: 'hd' });
      const genRes = await api.post('/generate/hd-upscale', {
        imageUrl,
        scale,
      });

      const taskId = genRes.data?.taskId || genRes.taskId;
      if (taskId) {
        toast.success('Task created!', { id: 'hd' });
        navigate(`/result?taskId=${taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('HD upscale error:', err);
      toast.error(err.message || 'Failed to upscale', { id: 'hd' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">HD Enhance</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Upload section */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-2xl py-5 flex items-center justify-center gap-4 text-white font-bold text-lg transition-all border border-white/10 disabled:opacity-50"
        >
          {sourcePreview ? (
            <img src={sourcePreview} alt="Your photo" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <HDIcon />
          )}
          <PlusIcon />
          <span>{sourcePreview ? 'Change Image' : 'Upload Image to Enhance'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview */}
        {sourcePreview && (
          <div className="relative rounded-2xl overflow-hidden bg-[#1a1a1a]">
            <img src={sourcePreview} alt="Preview" className="w-full max-h-[300px] object-contain" />
            <button
              onClick={() => {
                setSourceFile(null);
                setSourcePreview(null);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scale selection */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Enhancement Level</h2>
          <div className="flex gap-3">
            {scaleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setScale(option.value)}
                className={`relative flex-1 py-4 rounded-xl transition-all ${
                  scale === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-[#1f1f1f] text-white/50 hover:text-white/80'
                }`}
              >
                <div className="text-2xl font-bold">{option.label}</div>
                <div className="text-xs opacity-70">{option.description}</div>
                {option.isSuper && (
                  <span
                    className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
                      borderRadius: '0 10px 0 10px',
                    }}
                  >
                    Pro
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleUpscale}
          disabled={loading || !sourceFile}
          className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            loading || !sourceFile
              ? 'bg-[#333] text-white/50 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100'
          } shadow-[0_4px_20px_rgba(255,255,255,0.2)]`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Enhancing...
            </>
          ) : (
            <>
              <SparkleIcon />
              Enhance to {scale}x HD
            </>
          )}
        </button>
      </div>
    </div>
  );
}
