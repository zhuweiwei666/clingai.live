import { useState, useRef, useEffect } from 'react';
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

// 模板数据 - 完整79个模板
const templates = [
  { id: '1', title: 'RUB HER BODY', thumbnail: '/templates/1.jpg', video: '/templates/video1.mp4', badge: null },
  { id: '2', title: 'PLAYING WITH EGGPLANT', thumbnail: '/templates/2.jpg', video: '/templates/video2.mp4', badge: 'new' },
  { id: '3', title: 'MILK A COW', thumbnail: '/templates/3.jpg', video: '/templates/video3.mp4', badge: null },
  { id: '4', title: 'AIRY SWING', thumbnail: '/templates/4.jpg', video: '/templates/video4.mp4', badge: null },
  { id: '5', title: 'PLAYING WITH BREASTS', thumbnail: '/templates/5.jpg', video: '/templates/video5.mp4', badge: 'super' },
  { id: '6', title: 'ENLARGE BREASTS', thumbnail: '/templates/6.jpg', video: '/templates/video6.mp4', badge: null },
  { id: '7', title: 'CONFIDENT CHEST MOVES', thumbnail: '/templates/7.jpg', video: '/templates/video7.mp4', badge: null },
  { id: '8', title: 'AHEGAO', thumbnail: '/templates/8.jpg', video: '/templates/video8.mp4', badge: null },
  { id: '9', title: 'SAVORING EVERY LICK', thumbnail: '/templates/9.jpg', video: '/templates/video9.mp4', badge: null },
  { id: '10', title: 'TYING UP HAIR', thumbnail: '/templates/10.jpg', video: '/templates/video10.mp4', badge: 'new' },
  { id: '11', title: 'TONGUE MOVEMENT', thumbnail: '/templates/11.jpg', video: '/templates/video11.mp4', badge: 'new' },
  { id: '12', title: 'SHE HAD AN ORGASM', thumbnail: '/templates/12.jpg', video: '/templates/video12.mp4', badge: null },
  { id: '13', title: 'HONEY SQUEEZE', thumbnail: '/templates/13.jpg', video: '/templates/video13.mp4', badge: 'new' },
  { id: '14', title: 'GRINDING ON A CHAIR AT HOME', thumbnail: '/templates/14.jpg', video: '/templates/video14.mp4', badge: null },
  { id: '15', title: 'GRINDING ON THE CHAIR', thumbnail: '/templates/15.jpg', video: '/templates/video15.mp4', badge: 'super' },
  { id: '16', title: 'SEDUCTIVE HAND GESTURES', thumbnail: '/templates/16.jpg', video: '/templates/video16.mp4', badge: null },
  { id: '17', title: 'BUTTOCKS SPRAY', thumbnail: '/templates/17.jpg', video: '/templates/video17.mp4', badge: null },
  { id: '18', title: 'LICKING FINGERS', thumbnail: '/templates/18.jpg', video: '/templates/video18.mp4', badge: null },
  { id: '19', title: 'CHOKING KINK', thumbnail: '/templates/19.jpg', video: '/templates/video19.mp4', badge: null },
  { id: '20', title: 'SURPRISE OUTFIT CHANGE', thumbnail: '/templates/20.jpg', video: '/templates/video20.mp4', badge: 'new' },
  { id: '21', title: 'FLOATING DOLLARS', thumbnail: '/templates/21.jpg', video: '/templates/video21.mp4', badge: 'new' },
  { id: '22', title: 'TWO HOT KISSES', thumbnail: '/templates/22.jpg', video: '/templates/video22.mp4', badge: 'new' },
  { id: '23', title: 'SEXY HIP WIGGLE', thumbnail: '/templates/23.jpg', video: '/templates/video23.mp4', badge: 'new' },
  { id: '24', title: 'HIP SWIRL', thumbnail: '/templates/24.jpg', video: '/templates/video24.mp4', badge: null },
  { id: '25', title: 'HIP MOVEMENT', thumbnail: '/templates/25.jpg', video: '/templates/video25.mp4', badge: 'new' },
  { id: '26', title: 'FLOWING DANCE', thumbnail: '/templates/26.jpg', video: '/templates/video26.mp4', badge: 'new' },
  { id: '27', title: 'CATWALK', thumbnail: '/templates/27.jpg', video: '/templates/video27.mp4', badge: null },
  { id: '28', title: 'SHOW THE CHEST', thumbnail: '/templates/28.jpg', video: '/templates/video28.mp4', badge: null },
  { id: '29', title: 'CHRISTMAS OUTFIT', thumbnail: '/templates/29.jpg', video: '/templates/video29.mp4', badge: 'new' },
  { id: '30', title: 'BOUNCE YOUR CHEST', thumbnail: '/templates/30.jpg', video: '/templates/video30.mp4', badge: 'super' },
  { id: '31', title: 'WET LOOK', thumbnail: '/templates/31.jpg', video: '/templates/video31.mp4', badge: 'new' },
  { id: '32', title: 'BODY SHOW-OFF', thumbnail: '/templates/32.jpg', video: '/templates/video32.mp4', badge: 'new' },
  { id: '33', title: 'TRANSITION OUTFIT', thumbnail: '/templates/33.jpg', video: '/templates/video33.mp4', badge: null },
  { id: '34', title: 'EAT ICE CREAM', thumbnail: '/templates/34.jpg', video: '/templates/video34.mp4', badge: null },
  { id: '35', title: 'RAPID BREATHING', thumbnail: '/templates/35.jpg', video: '/templates/video35.mp4', badge: 'super' },
  { id: '36', title: 'MILK SPRAY', thumbnail: '/templates/36.jpg', video: '/templates/video36.mp4', badge: null },
  { id: '37', title: 'FLOATING DOLLARS', thumbnail: '/templates/37.jpg', video: '/templates/video37.mp4', badge: 'new' },
  { id: '38', title: 'BELLY DANCE', thumbnail: '/templates/38.jpg', video: '/templates/video38.mp4', badge: null },
  { id: '39', title: 'FIGURE DISPLAY', thumbnail: '/templates/39.jpg', video: '/templates/video39.mp4', badge: null },
  { id: '40', title: 'CHEST DISPLAY', thumbnail: '/templates/40.jpg', video: '/templates/video40.mp4', badge: 'super' },
  { id: '41', title: 'ACCELERATED ARM SHAKING', thumbnail: '/templates/41.jpg', video: '/templates/video41.mp4', badge: null },
  { id: '42', title: 'FINGER DANCE', thumbnail: '/templates/42.jpg', video: '/templates/video42.mp4', badge: null },
  { id: '43', title: 'LEG-LIFTING DANCE', thumbnail: '/templates/43.jpg', video: '/templates/video43.mp4', badge: null },
  { id: '44', title: 'CATWALK WALK', thumbnail: '/templates/44.jpg', video: '/templates/video44.mp4', badge: null },
  { id: '45', title: 'RED LIPS EASING KISS', thumbnail: '/templates/45.jpg', video: '/templates/video45.mp4', badge: 'super' },
  { id: '46', title: 'TURN AND TWIST', thumbnail: '/templates/46.jpg', video: '/templates/video46.mp4', badge: null },
  { id: '47', title: 'SHE LIFTS HER LEG', thumbnail: '/templates/47.jpg', video: '/templates/video47.mp4', badge: null },
  { id: '48', title: 'FLEXIBILITY', thumbnail: '/templates/48.jpg', video: '/templates/video48.mp4', badge: null },
  { id: '49', title: 'WAVE DANCE', thumbnail: '/templates/49.jpg', video: '/templates/video49.mp4', badge: null },
  { id: '50', title: 'HINT OF CLEAVAGE', thumbnail: '/templates/50.jpg', video: '/templates/video50.mp4', badge: 'super' },
  { id: '51', title: 'ANGLED CHEST POP', thumbnail: '/templates/51.jpg', video: '/templates/video51.mp4', badge: null },
  { id: '52', title: 'CHEST SHIMMY', thumbnail: '/templates/52.jpg', video: '/templates/video52.mp4', badge: null },
  { id: '53', title: 'MOVING BREASTS', thumbnail: '/templates/53.jpg', video: '/templates/video53.mp4', badge: null },
  { id: '54', title: 'HOLD THE LEGS', thumbnail: '/templates/54.jpg', video: '/templates/video54.mp4', badge: null },
  { id: '55', title: 'SEDUCTIVE FIGURE SHOW', thumbnail: '/templates/55.jpg', video: '/templates/video55.mp4', badge: 'super' },
  { id: '56', title: 'IMITATING WANK', thumbnail: '/templates/56.jpg', video: '/templates/video56.mp4', badge: null },
  { id: '57', title: 'CHANGE INTO A WHITE OUTFIT', thumbnail: '/templates/57.jpg', video: '/templates/video57.mp4', badge: 'new' },
  { id: '58', title: 'RUBBING MILK ON CHEST', thumbnail: '/templates/58.jpg', video: '/templates/video58.mp4', badge: null },
  { id: '59', title: 'POURING MILK ON CHEST', thumbnail: '/templates/59.jpg', video: '/templates/video59.mp4', badge: null },
  { id: '60', title: 'SEDUCTIVE CHEST BOUNCE', thumbnail: '/templates/60.jpg', video: '/templates/video60.mp4', badge: 'super' },
  { id: '61', title: 'SLOW ICE CREAM LICK', thumbnail: '/templates/61.jpg', video: '/templates/video61.mp4', badge: null },
  { id: '62', title: 'JIGGLING CHEST', thumbnail: '/templates/62.jpg', video: '/templates/video62.mp4', badge: null },
  { id: '63', title: 'STICK OUT TONGUE', thumbnail: '/templates/63.jpg', video: '/templates/video63.mp4', badge: null },
  { id: '64', title: 'TURN SQUAT HIP SWIRL', thumbnail: '/templates/64.jpg', video: '/templates/video64.mp4', badge: null },
  { id: '65', title: 'LICK ICECREAM', thumbnail: '/templates/65.jpg', video: '/templates/video65.mp4', badge: 'super' },
  { id: '66', title: 'KNEELING DANCE', thumbnail: '/templates/66.jpg', video: '/templates/video66.mp4', badge: null },
  { id: '67', title: 'LENS KISS', thumbnail: '/templates/67.jpg', video: '/templates/video67.mp4', badge: null },
  { id: '68', title: 'CHEST BOUNCE LEAN', thumbnail: '/templates/68.jpg', video: '/templates/video68.mp4', badge: null },
  { id: '69', title: 'TURN TWIST HIPS', thumbnail: '/templates/69.jpg', video: '/templates/video69.mp4', badge: null },
  { id: '70', title: 'WHITE GHOST', thumbnail: '/templates/70.jpg', video: '/templates/video70.mp4', badge: 'super' },
  { id: '71', title: 'RUNWAY WALK', thumbnail: '/templates/71.jpg', video: '/templates/video71.mp4', badge: null },
  { id: '72', title: 'SHOWING PANTIES', thumbnail: '/templates/72.jpg', video: '/templates/video72.mp4', badge: null },
  { id: '73', title: 'GESTURE DANCE', thumbnail: '/templates/73.jpg', video: '/templates/video73.mp4', badge: null },
  { id: '74', title: 'TURN SQUAT AND TWERK', thumbnail: '/templates/74.jpg', video: '/templates/video74.mp4', badge: null },
  { id: '75', title: 'HAVING ICE CREAM', thumbnail: '/templates/75.jpg', video: '/templates/video75.mp4', badge: 'super' },
  { id: '76', title: 'SELFIE HIP TWIST DANCE', thumbnail: '/templates/76.jpg', video: '/templates/video76.mp4', badge: null },
  { id: '77', title: 'IMITATING WANK', thumbnail: '/templates/77.jpg', video: '/templates/video77.mp4', badge: null },
  { id: '78', title: 'FLIRTY SHOE TEASE', thumbnail: '/templates/78.jpg', video: '/templates/video78.mp4', badge: null },
  { id: '79', title: 'TURN SQUAT HIP SWIRL', thumbnail: '/templates/79.jpg', video: '/templates/video79.mp4', badge: null },
];

// 视频卡片组件 - 自动播放视频
function VideoCard({ template, index }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // 视频自动播放
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div
      className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[#141414] cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/create?template=${template.id}`)}
    >
      {/* 视频 - 主要显示 */}
      <video
        ref={videoRef}
        src={template.video}
        poster={template.thumbnail}
        muted
        loop
        playsInline
        autoPlay
        onLoadedData={() => setVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover"
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
