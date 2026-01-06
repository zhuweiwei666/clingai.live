import { useNavigate } from 'react-router-dom';

export default function Create() {
  const navigate = useNavigate();

  const features = [
    { title: 'AI Video', path: '/', color: 'from-purple-600 to-indigo-600', icon: '🎬' },
    { title: 'Face Swap', path: '/face-swap', color: 'from-pink-600 to-rose-600', icon: '🎭' },
    { title: 'Chat Edit', path: '/chat-edit', color: 'from-blue-600 to-cyan-600', icon: '💬' },
    { title: 'Dress Up', path: '/dress-up', color: 'from-emerald-600 to-teal-600', icon: '👗' },
    { title: 'AI Image', path: '/ai-image', color: 'from-orange-600 to-amber-600', icon: '🎨' },
    { title: 'Remove', path: '/remove', color: 'from-red-600 to-orange-600', icon: '🧹' },
    { title: 'HD Upscale', path: '/hd', color: 'from-violet-600 to-purple-600', icon: '✨' },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-3xl">♾️</span>
        <h1 className="text-2xl font-bold text-white font-['Notable'] tracking-wider">Create</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature) => (
          <button
            key={feature.title}
            onClick={() => navigate(feature.path)}
            className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${feature.color} p-5 flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg`}
          >
             <div className="text-3xl bg-black/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
               {feature.icon}
             </div>
             <div className="flex justify-between items-end">
               <span className="text-white font-bold text-lg leading-tight">{feature.title}</span>
               <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                 <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </div>
             </div>
          </button>
        ))}
      </div>
    </div>
  );
}
