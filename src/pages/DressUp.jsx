import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shirt, Sparkles } from 'lucide-react';

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
  const [templates] = useState(dressTemplates);

  return (
    <div className="min-h-screen">
      {/* Section Header */}
      <div className="section-header">
        <Shirt className="w-6 h-6 text-pink-500" />
        <span className="gradient-text font-bold">Dress Up</span>
      </div>

      {/* Category Tabs */}
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

      {/* Templates Grid */}
      <div className="grid-cards">
        {templates.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </div>
  );
}
