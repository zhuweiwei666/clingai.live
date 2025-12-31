import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eraser, Upload, ImageMinus, Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import generationService from '../services/generationService';
import uploadService from '../services/uploadService';

const removeTypes = [
  { id: 'background', label: 'Remove Background', icon: Layers, cost: 5 },
  { id: 'watermark', label: 'Remove Watermark', icon: ImageMinus, cost: 5 },
];

export default function Remove() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeType, setRemoveType] = useState('background');
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

  const handleRemove = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to remove');
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

      // Step 2: Call remove API
      const generationResult = await generationService.remove(uploadResult.url, removeType);
      
      if (!generationResult || !generationResult.taskId) {
        throw new Error('Failed to start removal');
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

              toast.success(`${removeType === 'background' ? 'Background' : 'Watermark'} removed!`);
              setIsProcessing(false);
            } else if (status.task.status === 'failed') {
              completed = true;
              clearInterval(statusInterval);
              throw new Error(status.task.error || 'Removal failed');
            }
          }

          if (attempts >= maxAttempts && !completed) {
            clearInterval(statusInterval);
            throw new Error('Removal timeout');
          }
        } catch (error) {
          clearInterval(statusInterval);
          throw error;
        }
      }, 5000);

    } catch (error) {
      console.error('Remove failed:', error);
      toast.error(error.message || 'Removal failed');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="section-header p-0">
        <Eraser className="w-6 h-6 text-green-500" />
        <span className="gradient-text font-bold">Remove</span>
      </div>

      {/* Type Selection */}
      <div className="flex gap-3">
        {removeTypes.map((type) => (
          <motion.button
            key={type.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRemoveType(type.id)}
            className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
              removeType === type.id
                ? 'gradient-bg text-white'
                : 'glass-card text-text-secondary'
            }`}
          >
            <type.icon className="w-6 h-6" />
            <span className="text-sm font-medium">{type.label}</span>
            <span className="text-xs opacity-80">{type.cost}🪙</span>
          </motion.button>
        ))}
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
              {removeType === 'background' 
                ? 'Select an image to remove its background'
                : 'Select an image with watermarks to remove'
              }
            </p>
          </>
        )}
      </motion.div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <img 
            src={result.outputUrl} 
            alt="Processed" 
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
              New Process
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

      {/* Process Button */}
      {!result && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRemove}
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
              <Eraser className="w-5 h-5" />
              Remove {removeType === 'background' ? 'Background' : 'Watermark'} (5🪙)
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
