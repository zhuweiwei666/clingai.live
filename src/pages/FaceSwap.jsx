import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, Wand2, ArrowLeft, Plus } from 'lucide-react';

const swapModes = [
  { id: 'image', label: 'Image Face Swap', icon: Image },
  { id: 'video', label: 'Video Face Swap', icon: Video },
  { id: 'dress', label: 'Dress Up', icon: Wand2 },
];

// Sample target templates
const targetTemplates = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    tags: ['super'],
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
    tags: ['new'],
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    tags: ['hot'],
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
    tags: [],
  },
];

export default function FaceSwap() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeMode, setActiveMode] = useState('image');
  const [sourceImage, setSourceImage] = useState(null);
  const [sourcePreview, setSourcePreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    setSourceImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setSourcePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleTemplateClick = (template) => {
    if (sourceImage) {
      navigate(`/create?type=face_swap&target=${template.id}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Mode Tabs */}
      <div className="flex gap-3 p-4 overflow-x-auto">
        {swapModes.map((mode) => (
          <motion.button
            key={mode.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveMode(mode.id)}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all ${
              activeMode === mode.id
                ? 'gradient-bg text-white shadow-lg'
                : 'glass-card text-text-secondary'
            }`}
          >
            <mode.icon className="w-5 h-5" />
            {mode.label}
          </motion.button>
        ))}
      </div>

      {/* Upload Source Face */}
      <div className="p-4">
        <motion.div
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-3xl p-6 flex items-center gap-4 cursor-pointer hover:border-accent-start transition-colors"
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
          
          {sourcePreview ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden">
              <img src={sourcePreview} alt="Source" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl glass-elevated flex items-center justify-center">
              <Plus className="w-8 h-8 text-accent-start" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {sourcePreview ? 'Your Face' : 'Custom Image Face Swap'}
            </h3>
            <p className="text-text-muted text-sm">
              {sourcePreview ? 'Tap to change' : 'Upload a photo with your face'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Target Templates */}
      <div className="section-header">
        <Wand2 className="w-6 h-6 text-blue-500" />
        <span className="gradient-text font-bold">Choose Target</span>
      </div>

      <div className="grid-cards">
        {targetTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card cursor-pointer ${!sourceImage ? 'opacity-60' : ''}`}
            onClick={() => handleTemplateClick(template)}
          >
            <div className="card-image">
              <img
                src={template.thumbnail}
                alt={`Template ${template.id}`}
                loading="lazy"
              />
              <div className="card-overlay">
                {template.tags.includes('super') && (
                  <span className="badge badge-super absolute top-3 right-3">Super</span>
                )}
                {template.tags.includes('new') && (
                  <span className="badge badge-new absolute top-3 right-3">New</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!sourceImage && (
        <div className="p-4 text-center text-text-muted text-sm">
          Upload your photo first, then select a target template
        </div>
      )}
    </div>
  );
}
