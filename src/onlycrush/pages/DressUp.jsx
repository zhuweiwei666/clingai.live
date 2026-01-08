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

// Outfit templates - 使用下载的资源
const outfitTemplates = [
  { id: 'dress-1', name: 'Evening Gown', thumbnail: '/images/face-swap/face-1.jpg', category: 'formal', isSuper: false },
  { id: 'dress-2', name: 'Bikini', thumbnail: '/images/face-swap/face-2.jpg', category: 'swimwear', isSuper: false },
  { id: 'dress-3', name: 'Lingerie', thumbnail: '/images/face-swap/face-3.jpg', category: 'intimate', isSuper: true },
  { id: 'dress-4', name: 'Casual', thumbnail: '/images/face-swap/face-4.jpg', category: 'casual', isSuper: false },
  { id: 'dress-5', name: 'Sportswear', thumbnail: '/images/face-swap/face-5.jpg', category: 'sport', isSuper: false },
  { id: 'dress-6', name: 'Elegant', thumbnail: '/images/face-swap/face-6.jpg', category: 'formal', isSuper: true },
  { id: 'dress-7', name: 'Party', thumbnail: '/images/face-swap/face-7.jpg', category: 'party', isSuper: false },
  { id: 'dress-8', name: 'Beach', thumbnail: '/images/face-swap/face-8.jpg', category: 'swimwear', isSuper: false },
];

// Icons
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const DressIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
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

// Outfit Card
function OutfitCard({ outfit, isSelected, onClick }) {
  return (
    <button
      className={`relative aspect-[3/4] rounded-[18px] overflow-hidden transition-all ${
        isSelected
          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-[0.98]'
          : 'hover:scale-[0.98]'
      }`}
      onClick={() => onClick(outfit)}
    >
      <img
        src={assetUrl(outfit.thumbnail)}
        alt={outfit.name}
        className="w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <span className="text-white text-xs font-bold uppercase tracking-wide">{outfit.name}</span>
      </div>
      {/* Super badge */}
      {outfit.isSuper && (
        <span
          className="absolute top-0 right-0 px-2.5 py-1 text-[10px] font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
            borderRadius: '0 16px 0 12px',
          }}
        >
          Super
        </span>
      )}
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

export default function DressUp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);

  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);
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

  const handleOutfitSelect = useCallback((outfit) => {
    setSelectedOutfit(outfit);
  }, []);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    if (!sourceFile) {
      toast.error('Please upload your photo first');
      fileInputRef.current?.click();
      return;
    }
    if (!selectedOutfit) {
      toast.error('Please select an outfit');
      return;
    }

    setLoading(true);
    try {
      toast.loading('Uploading photo...', { id: 'dressup' });

      const formData = new FormData();
      formData.append('image', sourceFile);
      const uploadRes = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = uploadRes.data?.url || uploadRes.url;
      if (!imageUrl) throw new Error('Failed to upload image');

      toast.loading('Creating your look...', { id: 'dressup' });
      const genRes = await api.post('/generate/dress-up', {
        imageUrl,
        templateId: selectedOutfit.id,
      });

      const taskId = genRes.data?.taskId || genRes.taskId;
      if (taskId) {
        toast.success('Task created!', { id: 'dressup' });
        navigate(`/result?taskId=${taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Dress-up error:', err);
      toast.error(err.message || 'Failed to generate', { id: 'dressup' });
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
        <h1 className="text-xl font-bold text-white">Dress Up</h1>
      </div>

      {/* Upload section */}
      <div className="px-4 pt-5 pb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-2xl py-5 flex items-center justify-center gap-4 text-white font-bold text-lg transition-all border border-white/10 disabled:opacity-50"
        >
          {sourcePreview ? (
            <img src={sourcePreview} alt="Your photo" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <DressIcon />
          )}
          <PlusIcon />
          <span>{sourcePreview ? 'Change Photo' : 'Upload Your Photo'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Outfit grid */}
      <div className="px-4">
        <h2 className="text-white font-bold text-lg mb-4">Select Outfit</h2>
        <div className="grid grid-cols-3 gap-3">
          {outfitTemplates.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              isSelected={selectedOutfit?.id === outfit.id}
              onClick={handleOutfitSelect}
            />
          ))}
        </div>
      </div>

      {/* Generate button - fixed at bottom */}
      {(sourcePreview || selectedOutfit) && (
        <div className="fixed bottom-24 left-0 right-0 px-4 z-40">
          <button
            onClick={handleGenerate}
            disabled={loading || !sourceFile || !selectedOutfit}
            className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
              loading || !sourceFile || !selectedOutfit
                ? 'bg-[#333] text-white/50 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
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
                Try This Look
              </>
            )}
          </button>
        </div>
      )}

      {/* Preview indicator */}
      {sourcePreview && (
        <div className="fixed bottom-40 right-4 z-40">
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
