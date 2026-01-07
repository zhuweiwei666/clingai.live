import { useState, useEffect, useRef } from 'react';
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

// Fallback templates
const fallbackTemplates = [
  { _id: 'dress-1', title: 'Evening Gown', thumbnail: 'https://via.placeholder.com/300x400/4c1d95/fff?text=Evening', category: 'dress_up' },
  { _id: 'dress-2', title: 'Casual Wear', thumbnail: 'https://via.placeholder.com/300x400/6b21a8/fff?text=Casual', category: 'dress_up' },
  { _id: 'dress-3', title: 'Sporty Look', thumbnail: 'https://via.placeholder.com/300x400/7c3aed/fff?text=Sport', category: 'dress_up' },
  { _id: 'dress-4', title: 'Swimsuit', thumbnail: 'https://via.placeholder.com/300x400/8b5cf6/fff?text=Swim', category: 'dress_up' },
];

export default function DressUp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const [templates, setTemplates] = useState(fallbackTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.post('/app/tools/get', { category: 'dress_up' });
        const list = res.data?.templates || res.templates || [];
        if (list.length > 0) setTemplates(list);
      } catch (err) {
        console.error('Failed to fetch dress-up templates:', err);
      }
    };
    fetchTemplates();
  }, []);

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

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (!image) {
      toast.error('Please upload your photo first');
      return;
    }
    if (!selectedTemplate) {
      toast.error('Please select an outfit');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.url || uploadRes.url;

      const genRes = await api.post('/generate/dress-up', {
        imageUrl,
        templateId: selectedTemplate._id,
      });
      const taskId = genRes.data?.taskId || genRes.taskId;
      toast.success('Dress-up started!');
      navigate(`/result?taskId=${taskId}`);
    } catch (err) {
      console.error('Dress-up error:', err);
      toast.error(err.message || 'Failed to generate');
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
        <h1 className="text-xl font-bold text-white">Dress Up</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#141414] border-2 border-dashed border-[#333] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[150px] cursor-pointer hover:border-purple-500 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-[150px] rounded-xl object-contain" />
          ) : (
            <>
              <UploadIcon />
              <p className="text-white/60 mt-3">Upload your photo</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Outfit Selection */}
        <div>
          <h2 className="text-white font-bold mb-3">Select Outfit</h2>
          <div className="grid grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <button
                key={tpl._id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 ${selectedTemplate?._id === tpl._id ? 'border-purple-500' : 'border-transparent'}`}
              >
                <img src={tpl.thumbnail} alt={tpl.title} className="w-full h-full object-cover" />
                {selectedTemplate?._id === tpl._id && (
                  <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !image || !selectedTemplate}
          className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 ${loading || !image || !selectedTemplate ? 'bg-[#262626] cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </div>
  );
}

