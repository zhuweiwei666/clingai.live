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

// Sample character images
const sampleCharacters = [
  '/images/face-swap/face-1.jpg',
  '/images/face-swap/face-2.jpg',
  '/images/face-swap/face-3.jpg',
  '/images/face-swap/face-4.jpg',
];

// Preset phrases
const presetPhrases = [
  'Hello, how are you?',
  'I love you so much!',
  'Happy birthday!',
  'Congratulations!',
  'Thank you!',
  'Good morning, sunshine!',
];

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="15" y2="10" />
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

const MicIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export default function ChatEdit() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

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
    reader.onloadend = () => {
      setSourcePreview(reader.result);
      setShowSamples(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSampleSelect = useCallback((url) => {
    setSourcePreview(url);
    setSourceFile(null);
    setShowSamples(false);
    toast.success('Sample image selected!');
  }, []);

  const handlePhraseSelect = useCallback((phrase) => {
    setText(phrase);
    textareaRef.current?.focus();
  }, []);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (!sourcePreview) {
      toast.error('Please upload a photo first');
      fileInputRef.current?.click();
      return;
    }
    if (!text.trim()) {
      toast.error('Please enter what you want them to say');
      return;
    }

    setLoading(true);
    try {
      toast.loading('Creating talking photo...', { id: 'chatedit' });

      let imageUrl = sourcePreview;
      if (sourceFile) {
        const formData = new FormData();
        formData.append('image', sourceFile);
        const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = uploadRes.data?.url || uploadRes.url;
        if (!imageUrl) throw new Error('Failed to upload image');
      }

      const genRes = await api.post('/generate/chat-edit', {
        imageUrl,
        instruction: text,
      });

      const taskId = genRes.data?.taskId || genRes.taskId;
      if (taskId) {
        toast.success('Task created!', { id: 'chatedit' });
        navigate(`/result?taskId=${taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Chat edit error:', err);
      toast.error(err.message || 'Failed to generate', { id: 'chatedit' });
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
        <h1 className="text-xl font-bold text-white">Chat Edit</h1>
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
            <ChatIcon />
          )}
          <PlusIcon />
          <span>{sourcePreview ? 'Change Photo' : 'Upload Character Photo'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Try sample images */}
        {!sourcePreview && (
          <button
            onClick={() => setShowSamples(!showSamples)}
            className="w-full text-center text-white/60 text-sm hover:text-white transition-colors"
          >
            👍 No photo? <span className="underline">Try a sample character</span>
          </button>
        )}

        {/* Sample images grid */}
        {showSamples && (
          <div className="grid grid-cols-4 gap-3">
            {sampleCharacters.map((url, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleSelect(url)}
                className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-purple-500 transition-all"
              >
                <img src={assetUrl(url)} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Text input */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center px-4 pt-4 gap-3">
            <MicIcon />
            <span className="text-white font-bold">What should they say?</span>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            rows={3}
            className="w-full bg-transparent p-4 text-white placeholder-white/40 focus:outline-none resize-none"
          />
          <div className="px-4 pb-4">
            <p className="text-white/40 text-xs mb-2">Quick phrases:</p>
            <div className="flex flex-wrap gap-2">
              {presetPhrases.slice(0, 4).map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePhraseSelect(phrase)}
                  className="px-3 py-1.5 rounded-full bg-white/5 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !sourcePreview || !text.trim()}
          className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            loading || !sourcePreview || !text.trim()
              ? 'bg-[#333] text-white/50 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100'
          } shadow-[0_4px_20px_rgba(255,255,255,0.2)]`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <SparkleIcon />
              Make Them Talk
            </>
          )}
        </button>
      </div>

      {/* Preview indicator */}
      {sourcePreview && (
        <div className="fixed bottom-24 right-4 z-40">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-green-500 shadow-lg">
            <img src={sourcePreview} alt="Your photo" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setSourceFile(null);
                setSourcePreview(null);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
