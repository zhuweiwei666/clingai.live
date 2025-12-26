import { useState, useRef } from 'react';
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

// 模板数据 - 使用下载的真实资源
const templates = [
  { id: '1', title: 'RUB HER BODY', thumbnail: '/templates/1.jpg', video: '/templates/video1.mp4', badge: null },
  { id: '2', title: 'PLAYING WITH EGGPLANT', thumbnail: '/templates/2.jpg', video: '/templates/video2.mp4', badge: 'super' },
  { id: '3', title: 'DANCE MOTION', thumbnail: '/templates/3.jpg', video: null, badge: 'new' },
  { id: '4', title: 'BEDROOM SCENE', thumbnail: '/templates/4.jpg', video: null, badge: null },
  { id: '5', title: 'MIRROR SELFIE', thumbnail: '/templates/5.jpg', video: null, badge: 'super' },
  { id: '6', title: 'POOL PARTY', thumbnail: '/templates/6.jpg', video: null, badge: null },
  { id: '7', title: 'BEACH VIBES', thumbnail: '/templates/7.jpg', video: null, badge: 'new' },
  { id: '8', title: 'WORKOUT SESSION', thumbnail: '/templates/8.jpg', video: null, badge: 'super' },
  { id: '9', title: 'YOGA POSE', thumbnail: '/templates/9.jpg', video: null, badge: null },
  { id: '10', title: 'SUNSET WALK', thumbnail: '/templates/10.jpg', video: null, badge: null },
  { id: '11', title: 'MORNING COFFEE', thumbnail: '/templates/11.jpg', video: null, badge: 'super' },
  { id: '12', title: 'NIGHT OUT', thumbnail: '/templates/12.jpg', video: null, badge: null },
];

// 视频卡片组件
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && template.video) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/create?template=${template.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      
      {/* 视频 (hover 时播放) */}
      {template.video && (
        <video
          ref={videoRef}
          src={template.video}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      
      {/* 渐变遮罩 */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,0.3) 40%, transparent 60%)'
        }}
      />
      
      {/* Super 标签 */}
      {template.badge === 'super' && (
        <span className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-bl-[14px] rounded-tr-[24px] text-[11px] font-bold text-white z-20">
          Super
        </span>
      )}
      
      {/* New 标签 */}
      {template.badge === 'new' && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-[11px] font-bold text-white z-20">
          <span>🔥</span>
          <span>New</span>
          <span>🔥</span>
        </div>
      )}
      
      {/* 底部：图标 + 标题 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 z-20">
        <div className="text-white/90">
          <VideoIcon />
        </div>
        <div className="flex-1 text-center text-[11px] font-bold text-white uppercase tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
          {template.title}
        </div>
        <div className="text-white/90">
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
