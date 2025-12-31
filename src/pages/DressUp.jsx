import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shirt, Sparkles, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import generationService from '../services/generationService';
import uploadService from '../services/uploadService';

// Sample dress-up templates
const dressTemplates = [
  {
    id: '1',
    title: 'Elegant Dress',
    thumbnail: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=400&h=600&fit=crop',
    tags: ['super'],
  },
  {
    id: '2',
    title: 'Casual Style',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
    tags: ['new'],
  },
  {
    id: '3',
    title: 'Swimwear',
    thumbnail: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=600&fit=crop',
    tags: ['hot'],
  },
  {
    id: '4',
    title: 'Lingerie',
    thumbnail: 'https://images.unsplash.com/photo-1529271230144-e8c648ef570d?w=400&h=600&fit=crop',
    tags: ['viral'],
  },
];

function TemplateCard({ template, index }) {
  const renderBadge = () => {
    if (template.tags.includes('super')) {
      return <span className="badge badge-super">Super</span>;
    }
    if (template.tags.includes('new')) {
      return <span className="badge badge-new">New</span>;
    }
    if (template.tags.includes('hot')) {
      return <span className="badge badge-hot">Hot</span>;
    }
    if (template.tags.includes('viral')) {
      return <span className="badge badge-viral">Viral</span>;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card cursor-pointer"
    >
      <div className="card-image">
        <img
          src={template.thumbnail}
          alt={template.title}
          loading="lazy"
        />
        <div className="card-overlay">
          <div className="absolute top-3 right-3">
            {renderBadge()}
          </div>
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Shirt className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="card-title">{template.title}</h3>
        </div>
      </div>
    </motion.div>
  );
}

export default function DressUp() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const fileInputRef = useRef(null);
  const [templates] = useState(dressTemplates);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
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

  const handleDressUp = async (template) => {
    if (!isAuthenticated) {
      toast.error('Please login to use dress up');
      navigate('/login');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload your photo first');
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedTemplate(template);
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

      // Step 2: Call dress up API
      const generationResult = await generationService.dressUp(uploadResult.url, template.id);
      
      if (!generationResult || !generationResult.taskId) {
        throw new Error('Failed to start dress up');
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

              toast.success('Dress up complete!');
              setIsProcessing(false);
            } else if (status.task.status === 'failed') {
              completed = true;
              clearInterval(statusInterval);
              throw new Error(status.task.error || 'Dress up failed');
            }
          }

          if (attempts >= maxAttempts && !completed) {
            clearInterval(statusInterval);
            throw new Error('Dress up timeout');
          }
        } catch (error) {
          clearInterval(statusInterval);
          throw error;
        }
      }, 5000);

    } catch (error) {
      console.error('Dress up failed:', error);
      toast.error(error.message || 'Dress up failed');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Section Header */}
      <div className="section-header p-0">
        <Shirt className="w-6 h-6 text-pink-500" />
        <span className="gradient-text font-bold">Dress Up</span>
      </div>

      {/* Upload Area */}
      {!imagePreview && (
        <motion.div
          onClick={() => fileInputRef.current?.click()}
          className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-start transition-colors min-h-[200px]"
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
          
          <div className="w-20 h-20 rounded-full glass-elevated flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-accent-start" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Your Photo</h3>
          <p className="text-text-muted text-sm text-center">
            Select a photo to try on different outfits
          </p>
        </motion.div>
      )}

      {/* Image Preview */}
      {imagePreview && !result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full rounded-2xl object-contain"
          />
          <button
            onClick={() => {
              setUploadedImage(null);
              setImagePreview(null);
            }}
            className="w-full mt-4 btn-secondary"
          >
            Change Photo
          </button>
        </motion.div>
      )}

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <img 
            src={result.outputUrl} 
            alt="Dress Up Result" 
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
              Try Another
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

      {/* Templates Grid */}
      {!result && (
        <>
          <div className="tab-nav mb-4">
            {['All', 'Dress', 'Casual', 'Swimwear', 'Lingerie'].map((category) => (
              <button
                key={category}
                className={`tab-item ${category === 'All' ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid-cards">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDressUp(template)}
                className="card cursor-pointer relative"
              >
                <div className="card-image">
                  <img
                    src={template.thumbnail}
                    alt={template.title}
                    loading="lazy"
                  />
                  <div className="card-overlay">
                    <div className="absolute top-3 right-3">
                      {renderBadge(template)}
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Shirt className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="card-title">{template.title}</h3>
                    {isProcessing && selectedTemplate?.id === template.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function renderBadge(template) {
  if (template.tags.includes('super')) {
    return <span className="badge badge-super">Super</span>;
  }
  if (template.tags.includes('new')) {
    return <span className="badge badge-new">New</span>;
  }
  if (template.tags.includes('hot')) {
    return <span className="badge badge-hot">Hot</span>;
  }
  if (template.tags.includes('viral')) {
    return <span className="badge badge-viral">Viral</span>;
  }
  return null;
}
