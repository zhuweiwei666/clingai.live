import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import userService from '../services/userService';

export default function Feedback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await userService.submitFeedback({ content, type });
      toast.success('Feedback submitted successfully!');
      setContent('');
      navigate(-1);
    } catch (error) {
      console.error('Submit feedback error:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Feedback</h1>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-white font-medium mb-2">Feedback Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-white font-medium mb-2">Your Feedback</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Please share your thoughts, suggestions, or report any issues..."
              rows={10}
              className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 ${
              !content.trim() || isSubmitting
                ? 'bg-[#262626] text-[#666] cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

