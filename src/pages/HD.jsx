import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, ZoomIn, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HD() {
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('HD upscale complete!');
    setIsProcessing(false);
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

      {/* Upscale Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUpscale}
        disabled={!uploadedImage || isProcessing}
        className="w-full btn-primary py-4 text-lg disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Upscale to HD ({scaleOptions.find(o => o.value === scale)?.cost}🪙)
          </span>
        )}
      </motion.button>
    </div>
  );
}
