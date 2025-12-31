import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, Video, Loader2, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import generationService from '../services/generationService';
import apiClient from '../services/api';

export default function MyWorks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, video, image

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadWorks();
  }, [isAuthenticated, filter]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const response = await generationService.getMyWorks();
      // 响应格式已由 apiClient 拦截器处理，直接使用 works
      let filteredWorks = response.works || [];
      if (filter === 'video') {
        filteredWorks = filteredWorks.filter(w => w.type === 'video' || w.type === 'photo_to_video');
      } else if (filter === 'image') {
        filteredWorks = filteredWorks.filter(w => w.type !== 'video' && w.type !== 'photo_to_video');
      }
      setWorks(filteredWorks);
    } catch (error) {
      console.error('Failed to load works:', error);
      toast.error(error.message || 'Failed to load your works');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (work) => {
    if (work.outputUrl) {
      window.open(work.outputUrl, '_blank');
    } else {
      toast.error('Download URL not available');
    }
  };

  const handleDelete = async (workId) => {
    if (!confirm('Are you sure you want to delete this work?')) return;
    
    try {
      await apiClient.delete(`/works/${workId}`);
      // 响应格式已由 apiClient 拦截器处理，成功则直接继续
      toast.success('Work deleted');
      loadWorks();
    } catch (error) {
      console.error('Delete work error:', error);
      toast.error(error.message || 'Failed to delete work');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

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
        <h1 className="text-xl font-bold">My Works</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6">
        {['all', 'video', 'image'].map((type) => (
          <motion.button
            key={type}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === type
                ? 'gradient-bg text-white'
                : 'glass-card text-text-secondary'
            }`}
          >
            {type === 'all' ? 'All' : type === 'video' ? 'Videos' : 'Images'}
          </motion.button>
        ))}
      </div>

      {/* Works Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent-start" />
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary mb-4">No works yet</p>
          <button
            onClick={() => navigate('/create')}
            className="btn-primary"
          >
            Create Your First Work
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {works.map((work, index) => (
            <motion.div
              key={work._id || work.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden aspect-[3/4] relative group"
            >
              {work.type === 'video' || work.type === 'photo_to_video' ? (
                <video
                  src={work.outputUrl || work.thumbnail}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={work.outputUrl || work.thumbnail}
                  alt={work.title || 'Work'}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleDownload(work)}
                  className="w-10 h-10 rounded-full glass-elevated flex items-center justify-center"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(work._id || work.id)}
                  className="w-10 h-10 rounded-full glass-elevated flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                {work.type === 'video' || work.type === 'photo_to_video' ? (
                  <Video className="w-4 h-4 text-white" />
                ) : (
                  <Image className="w-4 h-4 text-white" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

