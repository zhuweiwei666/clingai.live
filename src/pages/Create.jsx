import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import { generationService } from '../services/generationService';
import { uploadService } from '../services/uploadService';
import { assetUrl } from '../utils/assetUrl';

// Template data (from Home page)
const templates = [
  { id: '1', title: 'RUB HER BODY', thumbnail: '/templates/1.jpg', video: '/templates/video1.mp4', badge: null },
  { id: '2', title: 'PLAYING WITH EGGPLANT', thumbnail: '/templates/2.jpg', video: '/templates/video2.mp4', badge: 'new' },
  { id: '3', title: 'MILK A COW', thumbnail: '/templates/3.jpg', video: '/templates/video3.mp4', badge: null },
  { id: '4', title: 'AIRY SWING', thumbnail: '/templates/4.jpg', video: '/templates/video4.mp4', badge: null },
  { id: '5', title: 'PLAYING WITH BREASTS', thumbnail: '/templates/5.jpg', video: '/templates/video5.mp4', badge: 'super' },
  { id: '6', title: 'ENLARGE BREASTS', thumbnail: '/templates/6.jpg', video: '/templates/video6.mp4', badge: null },
  // ... more templates would be loaded from API
];

const features = [
  { title: 'AI Video', path: '/', color: 'from-purple-600 to-indigo-600', icon: '🎬' },
  { title: 'Face Swap', path: '/face-swap', color: 'from-pink-600 to-rose-600', icon: '🎭' },
  { title: 'Chat Edit', path: '/chat-edit', color: 'from-blue-600 to-cyan-600', icon: '💬' },
  { title: 'Dress Up', path: '/dress-up', color: 'from-emerald-600 to-teal-600', icon: '👗' },
  { title: 'AI Image', path: '/ai-image', color: 'from-orange-600 to-amber-600', icon: '🎨' },
  { title: 'Remove', path: '/remove', color: 'from-red-600 to-orange-600', icon: '🧹' },
  { title: 'HD Upscale', path: '/hd', color: 'from-violet-600 to-purple-600', icon: '✨' },
];

export default function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [templateId]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading('Uploading image...', { id: 'create' });
      const uploadResult = await uploadService.uploadImage(uploadedImage);
      
      if (!uploadResult || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }

      toast.loading('Creating video...', { id: 'create' });
      const result = await generationService.generateVideo(uploadResult.url, selectedTemplate.id);

      if (result && result.taskId) {
        toast.success('Task created!', { id: 'create' });
        navigate(`/result?taskId=${result.taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to create task', { id: 'create' });
    } finally {
      setIsProcessing(false);
    }
  };

  // If template is selected, show upload + generate flow
  if (selectedTemplate) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Create Video</h1>
        </div>

        {/* Template Preview */}
        <div className="mb-6">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#141414]">
            <video
              src={assetUrl(selectedTemplate.video)}
              poster={assetUrl(selectedTemplate.thumbnail)}
              muted
              loop
              playsInline
              autoPlay
              className="w-full h-full object-cover"
            />
            {selectedTemplate.badge === 'super' && (
              <span className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl text-xs font-bold text-white">
                Super
              </span>
            )}
          </div>
          <p className="text-white text-center mt-2 font-medium">{selectedTemplate.title}</p>
        </div>

        {/* Upload Area */}
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className="bg-[#141414] rounded-2xl p-8 border-2 border-dashed border-[#262626] text-center cursor-pointer hover:border-purple-500 transition-colors mb-6"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-w-full max-h-[300px] rounded-xl mx-auto" />
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#262626] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Upload Your Photo</p>
              <p className="text-white/60 text-sm">Click to select an image</p>
            </>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!uploadedImage || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg ${
            !uploadedImage || isProcessing
              ? 'bg-[#262626] text-[#666] cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Generate Video'}
        </button>
      </div>
    );
  }

  // Default: Feature selection
  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-3xl">♾️</span>
        <h1 className="text-2xl font-bold text-white font-['Notable'] tracking-wider">Create</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map((feature) => (
          <button
            key={feature.title}
            onClick={() => navigate(feature.path)}
            className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${feature.color} p-5 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg`}
          >
             <div className="text-3xl bg-black/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
               {feature.icon}
             </div>
             <div className="flex justify-between items-end">
               <span className="text-white font-bold text-lg leading-tight">{feature.title}</span>
               <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                 <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </div>
             </div>
          </button>
        ))}
      </div>
    </div>
  );
}
