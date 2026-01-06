import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { generationService } from '../services/generationService';
import useUserStore from '../store/userStore';

// Icons
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Sample styles
const styles = [
  { id: '1', title: 'Realistic', thumbnail: '/templates/1.jpg', prompt: 'realistic photo, high details' },
  { id: '2', title: 'Anime', thumbnail: '/templates/2.jpg', prompt: 'anime style, vivid colors' },
  { id: '3', title: 'Cyberpunk', thumbnail: '/templates/3.jpg', prompt: 'cyberpunk city, neon lights' },
  { id: '4', title: 'Oil Painting', thumbnail: '/templates/4.jpg', prompt: 'oil painting, artistic' },
  { id: '5', title: '3D Render', thumbnail: '/templates/5.jpg', prompt: '3d render, unreal engine 5' },
  { id: '6', title: 'Watercolor', thumbnail: '/templates/6.jpg', prompt: 'watercolor style, soft' },
];

export default function AIImage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const fullPrompt = `${prompt}, ${selectedStyle.prompt}`;
      const result = await generationService.generateImage(fullPrompt, selectedStyle.title.toLowerCase());

      if (result && result.taskId) {
        toast.success('Task created! Check My Works later.');
        navigate('/profile');
      } else {
        toast.error('Failed to create task');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="section-header">
        <span className="fire-emoji">🎨</span>
        <span className="title-text">AI Text to Image</span>
      </div>

      <div className="px-4 space-y-6">
        {/* Input Area */}
        <div className="bg-[#141414] rounded-xl p-4 border border-[#262626]">
          <label className="text-xs font-bold text-[#666] uppercase mb-2 block">
            Describe your image
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A beautiful girl standing in the rain..."
              className="w-full bg-[#1a1a1a] text-white rounded-lg p-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
              maxLength={500}
            />
          </div>
        </div>

        {/* Style Selector */}
        <div>
          <label className="text-xs font-bold text-[#666] uppercase mb-3 block px-1">
            Select Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                  selectedStyle.id === style.id ? 'border-purple-500 scale-105' : 'border-transparent'
                }`}
              >
                <img 
                  src={style.thumbnail} 
                  alt={style.title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-bold text-white uppercase">{style.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2
            ${isGenerating || !prompt
              ? 'bg-[#262626] text-[#666] cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/20'
            }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SendIcon />
              Generate Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}
