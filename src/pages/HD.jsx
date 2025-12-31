import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Upload, ZoomIn, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import generationService from '../services/generationService';
import uploadService from '../services/uploadService';

export default function HD() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

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

  const handleUpscale = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to upscale');
      navigate('/login');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      // Step 1: Upload image
      setProgress(10);
      toast.loading('Uploading image...', { id: 'upload' });
      
      const uploadResult = await uploadService.uploadImage(uploadedImage);
      if (!uploadResult || !uploadResult.url) {
        throw new Error('Failed to upload image');
      }
      
      toast.success('Image uploaded', { id: 'upload' });
      setProgress(30);

      // Step 2: Call HD upscale API
      const generationResult = await generationService.hdUpscale(uploadResult.url, scale);
      
      if (!generationResult || !generationResult.taskId) {
        throw new Error('Failed to start upscale');
      }

      const taskId = generationResult.taskId;
      setProgress(50);

      // Step 3: Poll for task status
      const maxAttempts = 60;
      let attempts = 0;
      let completed = false;

      const statusInterval = setInterval(async () => {
        try {
          attempts++;
          const status = await generationService.getImageStatus(taskId);
          
          if (status && status.task) {
            setProgress(50 + (status.task.progress || 0) * 0.4);

            if (status.task.status === 'completed') {
              completed = true;
              clearInterval(statusInterval);
              setProgress(100);
              
              setResult({
                outputUrl: status.task.output?.resultUrl,
              });

              toast.success('HD upscale complete!');
              setIsProcessing(false);
            } else if (status.task.status === 'failed') {
              completed = true;
              clearInterval(statusInterval);
              throw new Error(status.task.error || 'Upscale failed');
            }
          }

          if (attempts >= maxAttempts && !completed) {
            clearInterval(statusInterval);
            throw new Error('Upscale timeout');
          }
        } catch (error) {
          clearInterval(statusInterval);
          throw error;
        }
      }, 5000);

    } catch (error) {
      console.error('Upscale failed:', error);
      toast.error(error.message || 'Upscale failed');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const scaleOptions = [
    { value: 2, label: '2x', cost: 3 },
    { value: 4, label: '4x', cost: 5 },
    { value: 8, label: '8x', cost: 8 },
  ];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="section-header p-0">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        <span className="gradient-text font-bold">HD Upscale</span>
      </div>

      {/* Upload Area */}
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-start transition-colors min-h-[300px]"
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
            className="max-w-full max-h-[300px] rounded-2xl object-contain"
          />
        ) : (
          <>
            <div className="w-20 h-20 rounded-full glass-elevated flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-accent-start" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
            <p className="text-text-muted text-sm text-center">
              Select a low-resolution image to enhance
            </p>
          </>
        )}
      </motion.div>

      {/* Scale Options */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <ZoomIn className="w-5 h-5 text-accent-start" />
          Upscale Factor
        </h3>
        
        <div className="flex gap-3">
          {scaleOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setScale(option.value)}
              className={`flex-1 py-4 rounded-2xl font-medium transition-all ${
                scale === option.value
                  ? 'gradient-bg text-white'
                  : 'glass-elevated text-text-secondary'
              }`}
            >
              <div className="text-xl font-bold">{option.label}</div>
              <div className="text-xs opacity-80">{option.cost}🪙</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <img 
            src={result.outputUrl} 
            alt="Upscaled" 
            className="w-full rounded-2xl object-contain"
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                setResult(null);
                setUploadedImage(null);
                setImagePreview(null);
                setProgress(0);
              }}
              className="flex-1 btn-secondary"
            >
              New Upscale
            </button>
            <button
              onClick={() => window.open(result.outputUrl, '_blank')}
              className="flex-1 btn-primary"
            >
              Download
            </button>
          </div>
        </motion.div>
      )}

      {/* Upscale Button */}
      {!result && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpscale}
          disabled={!uploadedImage || isProcessing}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 relative overflow-hidden"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing... {progress}%
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Upscale to HD ({scaleOptions.find(o => o.value === scale)?.cost}🪙)
            </span>
          )}
          {isProcessing && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
            />
          )}
        </motion.button>
      )}
    </div>
  );
}
