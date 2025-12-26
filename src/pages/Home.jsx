import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 视频图标 - 两个矩形
const VideoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="8" height="18" rx="2" />
    <rect x="14" y="3" width="8" height="18" rx="2" />
  </svg>
);

// 保存图标
const SaveIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 示例模板数据
const templates = [
  { id: '1', title: 'RUB HER BODY', thumbnail: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: null },
  { id: '2', title: 'PLAYING WITH EGGPLANT', thumbnail: 'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: 'super' },
  { id: '3', title: 'DANCE MOTION', thumbnail: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: 'new' },
  { id: '4', title: 'BEDROOM SCENE', thumbnail: 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: null },
  { id: '5', title: 'MIRROR SELFIE', thumbnail: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: 'super' },
  { id: '6', title: 'POOL PARTY', thumbnail: 'https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: null },
  { id: '7', title: 'BEACH VIBES', thumbnail: 'https://images.pexels.com/photos/1642228/pexels-photo-1642228.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: 'new' },
  { id: '8', title: 'WORKOUT SESSION', thumbnail: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop', badge: 'super' },
];

// 视频卡片组件
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/create?template=${template.id}`)}
    >
      {/* 图片 */}
      <img
        src={template.thumbnail}
        alt={template.title}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: imageLoaded ? 1 : 0 }}
      />
      
      {/* 渐变遮罩 */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)'
        }}
      />
      
      {/* Super 标签 */}
      {template.badge === 'super' && (
        <span className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[14px] rounded-tr-[20px] text-[11px] font-bold text-white z-10">
          Super
        </span>
      )}
      
      {/* New 标签 */}
      {template.badge === 'new' && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[11px] font-bold text-white z-10">
          <span>🔥</span>
          <span>New</span>
          <span>🔥</span>
        </div>
      )}
      
      {/* 底部：图标 + 标题 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 z-20 bg-red-500/50">
        <div className="text-white">
          <VideoIcon />
        </div>
        <div className="flex-1 text-center text-xs font-bold text-white uppercase tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,1)' }}>
          {template.title}
        </div>
        <div className="text-white">
          <SaveIcon />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Section Header */}
      <div className="section-header">
        <span className="fire-emoji">🔥</span>
        <span className="title-text">Trending: Photo to video</span>
      </div>

      {/* 视频卡片网格 */}
      <div className="cards-grid">
        {templates.map((template, index) => (
          <VideoCard key={template.id} template={template} index={index} />
        ))}
      </div>
    </div>
  );
}
