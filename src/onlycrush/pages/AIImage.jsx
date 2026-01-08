import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Assets helper
const assetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

// Style presets
const stylePresets = [
  { id: 'realistic', label: 'Realistic', active: true },
  { id: 'anime', label: 'Anime', active: false },
];

// Prompt suggestions
const promptSuggestions = [
  'Beautiful woman in elegant dress',
  'Glamorous photoshoot style',
  'Cinematic lighting portrait',
  'High fashion editorial',
  'Natural beauty look',
  'Artistic black and white',
];

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
  </svg>
);

export default function AIImage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [activeStyle, setActiveStyle] = useState('realistic');
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback((e) => {
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
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setPrompt(suggestion);
    textareaRef.current?.focus();
  }, []);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      toast.loading('Generating image...', { id: 'aiimage' });

      let imageUrl = null;
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data?.url || uploadRes.url;
      }

      const genRes = await api.post('/generate/ai-image', {
        imageUrl,
        prompt,
        style: activeStyle,
      });

      const taskId = genRes.data?.taskId || genRes.taskId;
      if (taskId) {
        toast.success('Generation started!', { id: 'aiimage' });
        navigate(`/result?taskId=${taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('AI Image error:', err);
      toast.error(err.message || 'Failed to generate', { id: 'aiimage' });
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
        <h1 className="text-xl font-bold text-white">AI Image</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Style selector */}
        <div className="flex gap-3">
          {stylePresets.map((style) => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                activeStyle === style.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-[#1f1f1f] text-white/50 hover:text-white/80'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Prompt input */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create..."
            rows={4}
            className="w-full bg-transparent p-4 text-white placeholder-white/40 focus:outline-none resize-none"
          />
          <div className="px-4 pb-4">
            <p className="text-white/40 text-xs mb-2">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.slice(0, 3).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full bg-white/5 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reference image upload (optional) */}
        <div>
          <p className="text-white/60 text-sm mb-3">Reference image (optional)</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#1a1a1a] border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[140px] hover:border-purple-500 transition-colors"
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Reference" className="max-h-[120px] rounded-xl object-contain" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setPreview(null);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <ImageIcon />
                <p className="text-white/40 mt-2 text-sm">Tap to add a reference image</p>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={`w-full py-4 rounded-full text-white font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            loading || !prompt.trim()
              ? 'bg-[#333] cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100'
          } shadow-[0_4px_20px_rgba(255,255,255,0.2)]`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparkleIcon />
              Generate Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}
