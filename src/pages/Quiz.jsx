import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  // Mock quiz questions (should be loaded from API or settings)
  const questions = [
    {
      id: 1,
      question: 'What type of content are you most interested in?',
      options: ['Photo to Video', 'Face Swap', 'Dress Up', 'AI Image'],
    },
    {
      id: 2,
      question: 'How often do you plan to use our service?',
      options: ['Daily', 'Weekly', 'Monthly', 'Occasionally'],
    },
    {
      id: 3,
      question: 'What is your primary use case?',
      options: ['Personal', 'Business', 'Creative Projects', 'Entertainment'],
    },
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // TODO: Submit answers to backend
    toast.success('Quiz completed!');
    navigate('/');
  };

  const currentQuestion = questions[currentStep];

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
        <h1 className="text-xl font-bold text-white">Onboarding Quiz</h1>
      </div>

      {/* Progress */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-white/60">
            Question {currentStep + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-[#141414] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-white mb-8">{currentQuestion.question}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion.id, option)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                answers[currentQuestion.id] === option
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                  : 'bg-[#141414] border border-[#262626] text-white hover:border-purple-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-white text-lg ${
            !answers[currentQuestion.id]
              ? 'bg-[#262626] text-[#666] cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}
        >
          {currentStep < questions.length - 1 ? 'Next' : 'Complete'}
        </button>
      </div>
    </div>
  );
}

