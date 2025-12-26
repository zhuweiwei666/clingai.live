import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Upload, ImageMinus, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const removeTypes = [
  { id: 'background', label: 'Remove Background', icon: Layers, cost: 5 },
  { id: 'watermark', label: 'Remove Watermark', icon: ImageMinus, cost: 5 },
];

export default function Remove() {
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeType, setRemoveType] = useState('background');
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

  const handleRemove = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`${removeType === 'background' ? 'Background' : 'Watermark'} removed!`);
    setIsProcessing(false);
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

      {/* Process Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRemove}
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
            <Eraser className="w-5 h-5" />
            Remove {removeType === 'background' ? 'Background' : 'Watermark'} (5🪙)
          </span>
        )}
      </motion.button>
    </div>
  );
}
