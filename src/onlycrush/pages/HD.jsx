import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../../store/userStore';
import api from '../../services/api';

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function HD() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState('2'); // 2x, 4x
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.url || uploadRes.url;

      const genRes = await api.post('/generate/hd-upscale', { imageUrl, scale: Number(scale) });
      const taskId = genRes.data?.taskId || genRes.taskId;
      toast.success('HD upscale started!');
      navigate(`/result?taskId=${taskId}`);
    } catch (err) {
      console.error('HD upscale error:', err);
      toast.error(err.message || 'Failed to upscale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">HD Upscale</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#141414] border-2 border-dashed border-[#333] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-purple-500 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-[200px] rounded-xl object-contain" />
          ) : (
            <>
              <UploadIcon />
              <p className="text-white/60 mt-3">Tap to upload an image</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Scale Selection */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-[#262626]">
          <label className="block text-white font-medium mb-3">Upscale Factor</label>
          <div className="flex gap-3">
            {['2', '4'].map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`flex-1 py-3 rounded-xl font-bold ${scale === s ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-[#262626] text-white/60'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Upscale Button */}
        <button
          onClick={handleUpscale}
          disabled={loading || !image}
          className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 ${loading || !image ? 'bg-[#262626] cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Upscaling...
            </>
          ) : (
            'Upscale to HD'
          )}
        </button>
      </div>
    </div>
  );
}

