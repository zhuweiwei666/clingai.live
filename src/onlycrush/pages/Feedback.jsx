import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

// Icons
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function Feedback() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter your feedback');
      return;
    }
    setLoading(true);
    try {
      await api.post('/user/feedback', { content });
      toast.success('Thank you for your feedback!');
      setContent('');
      navigate(-1);
    } catch (err) {
      console.error('Feedback error:', err);
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white">
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-white">Feedback</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div className="bg-[#141414] rounded-2xl p-4 border border-[#262626]">
          <label className="block text-white font-medium mb-2">Your Feedback</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full h-40 bg-[#1a1a1a] rounded-xl p-4 text-white placeholder-white/40 border border-[#262626] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 ${loading ? 'bg-[#262626] cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </form>
    </div>
  );
}

