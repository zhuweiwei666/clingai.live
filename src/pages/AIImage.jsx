import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Image } from 'lucide-react';
import useUserStore from '../store/userStore';

// Sample templates for AI Image
const imageTemplates = [
  {
    id: '1',
    title: 'Portrait Pro',
    thumbnail: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop',
    category: 'portrait',
    tags: ['super'],
  },
  {
    id: '2',
    title: 'Anime Style',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
    category: 'anime',
    tags: ['new'],
  },
  {
    id: '3',
    title: 'Fantasy Art',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    category: 'fantasy',
    tags: ['hot'],
  },
  {
    id: '4',
    title: 'Realistic Photo',
    thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    category: 'realistic',
    tags: [],
  },
];

function TemplateCard({ template, index, onClick }) {
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
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card cursor-pointer"
      onClick={onClick}
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
              <Image className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="card-title">{template.title}</h3>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIImage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [templates] = useState(imageTemplates);

  const handleTemplateClick = (template) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/create?type=ai_image&style=${template.category}`);
  };

  return (
    <div className="min-h-screen">
      {/* Section Header */}
      <div className="section-header">
        <Sparkles className="w-6 h-6 text-purple-500" />
        <span className="gradient-text font-bold">AI Image Generation</span>
      </div>

      {/* Style Tabs */}
      <div className="tab-nav mb-4">
        {['All', 'Portrait', 'Anime', 'Fantasy', 'Realistic'].map((style) => (
          <button
            key={style}
            className={`tab-item ${style === 'All' ? 'active' : ''}`}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid-cards">
        {templates.map((template, index) => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            index={index}
            onClick={() => handleTemplateClick(template)}
          />
        ))}
      </div>
    </div>
  );
}
