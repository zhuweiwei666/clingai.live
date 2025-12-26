import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 视频图标 - 两个矩形
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="8" height="18" rx="2" />
    <rect x="14" y="3" width="8" height="18" rx="2" />
  </svg>
);

// 保存图标
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="12" y1="8" x2="12" y2="14" />
  </svg>
);

// 示例模板数据 - 使用更真实的人像图片
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
      className="video-card fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/create?template=${template.id}`)}
    >
      <div className="video-card-media">
        {/* 图片 */}
        <img
          src={template.thumbnail}
          alt={template.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
        
        {/* 渐变遮罩 */}
        <div className="video-card-overlay" />
        
        {/* 内容层 */}
        <div className="video-card-content">
          {/* Super 标签 */}
          {template.badge === 'super' && (
            <span className="badge-super">Super</span>
          )}
          
          {/* New 标签 */}
          {template.badge === 'new' && (
            <div className="badge-new">
              <span className="fire">🔥</span>
              <span>New</span>
              <span className="fire">🔥</span>
            </div>
          )}
          
          {/* 底部区域 */}
          <div className="card-bottom">
            <div className="card-bottom-row">
              <div className="card-icon-left">
                <VideoIcon />
              </div>
              <div className="card-title">{template.title}</div>
              <div className="card-icon-right">
                <SaveIcon />
              </div>
            </div>
          </div>
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
