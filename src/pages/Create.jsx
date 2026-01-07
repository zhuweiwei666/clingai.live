import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import { generationService } from '../services/generationService';
import { uploadService } from '../services/uploadService';
import templateService from '../services/templateService';
import { assetUrl } from '../utils/assetUrl';
import { handleApiError } from '../utils/errorHandler';

// Pro Icon Component
const ProIcon = () => (
  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)]">
    Pro
  </div>
);

// Template Card Component for "More ways to play" section
function TemplateCard({ template, onSelect }) {
  const videoRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current && template.previewVideo) {
      videoRef.current.play().catch(() => {});
    }
  }, [template.previewVideo]);

  return (
    <div
      className="relative flex-shrink-0 w-[140px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      onClick={() => onSelect(template)}
    >
      {template.previewVideo ? (
        <video
          ref={videoRef}
          src={assetUrl(template.previewVideo)}
          poster={assetUrl(template.thumbnail)}
          muted
          loop
          playsInline
          autoPlay
          onLoadedData={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={assetUrl(template.thumbnail)}
          alt={template.name}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setLoaded(true)}
        />
      )}
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)'
        }}
      />
      
      {/* Title at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 z-20">
        <div className="text-center text-[11px] font-bold text-white uppercase tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          {template.name}
        </div>
      </div>
    </div>
  );
}

export default function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Load templates for "More ways to play" section
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const response = await templateService.getAll({ limit: 50 });
        setTemplates(response?.templates || []);
      } catch (error) {
        handleApiError(error, {
          defaultMessage: 'Failed to load templates',
          showToast: false, // Don't show toast for background loading
        });
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

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

  const handleTemplateSelect = async (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload an image first');
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
      const result = await generationService.generateVideo(uploadResult.url, template._id || template.id);

      if (result && result.taskId) {
        toast.success('Task created!', { id: 'create' });
        navigate(`/result?taskId=${result.taskId}`);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      handleApiError(error, {
        defaultMessage: 'Failed to create task',
        showToast: true,
      });
      toast.dismiss('create');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header with Pro badge */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center justify-end">
        <button onClick={() => navigate('/subscribe')} className="hover:scale-105 transition-transform">
          <ProIcon />
        </button>
      </div>

      {/* Top Section: Two Image Previews with Arrow */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-center gap-3">
        {/* Left Image Preview */}
        <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-[#141414]">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Right Image Preview */}
        <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-[#141414]">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
              <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bikini Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-8 h-8 flex items-center justify-center">
          <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>

      {/* Upload Button - White Oval with Black Text */}
      <div className="px-4 mb-6">
        <button
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full bg-white rounded-full py-4 px-6 flex items-center justify-center gap-2 text-black font-bold text-base hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Upload Her Image</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* "More ways to play with her" Section */}
      <div className="px-4">
        <div className="text-white text-center text-sm font-medium mb-4">
          More ways to play with her
        </div>

        {/* Horizontal Scrollable Template Grid */}
        {loadingTemplates ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-white/60">Loading templates...</div>
          </div>
        ) : templates.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {templates.map((template) => (
              <TemplateCard
                key={template._id || template.id}
                template={template}
                onSelect={handleTemplateSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-white/60">No templates available</div>
          </div>
        )}
      </div>
    </div>
  );
}
