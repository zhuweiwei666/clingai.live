import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, Wand2, ArrowLeft, Loader2, Check, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import generationService from '../services/generationService';

const GENERATION_TYPES = [
  { id: 'photo_to_video', label: 'Photo to Video', icon: Video, cost: 10, color: 'from-pink-500 to-rose-500' },
  { id: 'ai_image', label: 'AI Image', icon: Image, cost: 5, color: 'from-purple-500 to-indigo-500' },
  { id: 'face_swap', label: 'Face Swap', icon: Wand2, cost: 8, color: 'from-blue-500 to-cyan-500' },
];

export default function Create() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  
  const { isAuthenticated, user } = useUserStore();
  const fileInputRef = useRef(null);

  const [selectedType, setSelectedType] = useState(GENERATION_TYPES[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  // Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to generate');
      navigate('/login');
      return;
    }

    if (!uploadedImage && selectedType.id !== 'ai_image') {
      toast.error('Please upload an image first');
      return;
    }

    if (selectedType.id === 'ai_image' && !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // In production, upload image to server first, then call API
      // For now, simulate the generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setProgress(100);

      // Simulated result
      setResult({
        type: selectedType.id,
        outputUrl: selectedType.id === 'photo_to_video' 
          ? 'https://sample-videos.com/video123.mp4'
          : imagePreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      });

      toast.success('Generation complete!');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error(error.response?.data?.error || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset for new generation
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setPrompt('');
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Create</h1>
        
        {/* Coins display */}
        {isAuthenticated && (
          <div className="ml-auto flex items-center gap-2 px-4 py-2 glass-card rounded-full">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{user?.coins || 0}</span>
          </div>
        )}
      </div>

      {/* Generation Type Selection */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {GENERATION_TYPES.map((type) => (
          <motion.button
            key={type.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(type)}
            className={`flex-shrink-0 px-4 py-3 rounded-2xl flex items-center gap-2 transition-all ${
              selectedType.id === type.id
                ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                : 'glass-card text-text-secondary'
            }`}
          >
            <type.icon className="w-5 h-5" />
            <span className="font-medium">{type.label}</span>
            <span className="text-xs opacity-80">{type.cost}🪙</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          // Result View
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl overflow-hidden">
              {selectedType.id === 'photo_to_video' ? (
                <video 
                  src={result.outputUrl} 
                  controls 
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <img 
                  src={result.outputUrl} 
                  alt="Generated" 
                  className="w-full aspect-[3/4] object-cover"
                />
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 btn-secondary"
              >
                Create New
              </button>
              <button
                onClick={() => {/* Download logic */}}
                className="flex-1 btn-primary"
              >
                Download
              </button>
            </div>
          </motion.div>
        ) : (
          // Upload/Input View
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            {selectedType.id !== 'ai_image' && (
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-start transition-colors aspect-[3/4]"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full glass-elevated flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-accent-start" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Photo</h3>
                    <p className="text-text-muted text-sm text-center">
                      Tap to select an image from your device
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* Prompt Input (for AI Image) */}
            {selectedType.id === 'ai_image' && (
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4">Describe your image</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A beautiful woman in a red dress, professional photography, studio lighting..."
                  className="w-full h-32 input-dark rounded-2xl resize-none"
                />
              </div>
            )}

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || (!uploadedImage && selectedType.id !== 'ai_image') || (selectedType.id === 'ai_image' && !prompt.trim())}
              className="w-full btn-primary py-4 text-lg relative overflow-hidden disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating... {progress}%</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  <span>Generate ({selectedType.cost}🪙)</span>
                </div>
              )}
              
              {/* Progress bar */}
              {isGenerating && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
