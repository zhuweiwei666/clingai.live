import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { generationService } from '../services/generationService';
import { uploadService } from '../services/uploadService';
import useUserStore from '../store/userStore';

// Icons
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function ChatEdit() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [sourceImage, setSourceImage] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setSourceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!sourceImage) {
      toast.error('Please upload a photo first');
      return;
    }

    if (!text.trim()) {
      toast.error('Please enter text to speak');
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Upload Image
      toast.loading('Uploading image...', { id: 'chat-edit' });
      const uploadResult = await uploadService.uploadImage(sourceImage);
      
      if (!uploadResult || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }

      // 2. Generate
      toast.loading('Creating task...', { id: 'chat-edit' });
      const result = await generationService.chatEdit(uploadResult.url, text);

      if (result && result.taskId) {
        toast.success('Task created! Check My Works later.', { id: 'chat-edit' });
        navigate(`/result?taskId=${result.taskId}`);
      } else {
        toast.error('Failed to create task', { id: 'chat-edit' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to create task', { id: 'chat-edit' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="section-header">
        <span className="fire-emoji">💬</span>
        <span className="title-text">Chat Edit / Talking Photo</span>
      </div>

      <div className="px-4 space-y-6">
        {/* Upload Area */}
        <div 
          className="aspect-[3/4] rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#666]">
              <div className="w-16 h-16 mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <UploadIcon />
              </div>
              <span className="text-sm font-medium">Upload Portrait Photo</span>
              <span className="text-xs mt-2 opacity-60">Supports JPG, PNG</span>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Text Input Area */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#262626]">
          <label className="text-xs font-bold text-[#666] uppercase mb-2 block">
            What should they say?
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full bg-[#1a1a1a] text-white rounded-lg p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
              maxLength={200}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#666]">
              {text.length}/200
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !sourceImage || !text}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2
            ${isGenerating || !sourceImage || !text
              ? 'bg-[#262626] text-[#666] cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/20'
            }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SendIcon />
              Generate Video
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#666]">
          Cost: 5 Coins per generation
        </p>
      </div>
    </div>
  );
}
