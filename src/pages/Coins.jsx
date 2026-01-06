import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import orderService from '../services/orderService';

// Benchmark parity: 6 coin packages with exact pricing
const coinPackages = [
  { id: 1, coins: 10, price: 5, bonus: 10 },
  { id: 2, coins: 100, price: 10, bonus: 100 },
  { id: 3, coins: 210, price: 20, bonus: 210 },
  { id: 4, coins: 550, price: 50, bonus: 550 },
  { id: 5, coins: 1200, price: 100, bonus: 1200 },
  { id: 6, coins: 2500, price: 200, bonus: 2500 },
];

export default function Coins() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [packages, setPackages] = useState(coinPackages);

  // Fetch prices from API (benchmark: /app/get_coins_prices)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await orderService.getPackages();
        if (response.success && response.data.packages) {
          setPackages(response.data.packages);
        }
      } catch (error) {
        console.error('Failed to fetch coin prices:', error);
      }
    };
    fetchPrices();
  }, []);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await orderService.createOrder('coins', selectedPackage, null, 'stripe');

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      {/* Close button (top-left X) */}
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 flex items-center justify-center text-white mb-6"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Buy Coins</h1>

      {/* Coin Packages Grid (3x2) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`relative bg-[#141414] rounded-2xl p-4 cursor-pointer transition-all ${
              selectedPackage === pkg.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {/* Purple badge "+X Coins" (top-right) */}
            <div className="absolute top-0 right-0 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-xl rounded-tr-2xl text-[10px] font-bold text-white">
              +{pkg.bonus} Coins
            </div>

            {/* Coin amount + icon */}
            <div className="flex items-center gap-2 mb-2">
              <div className="text-white text-lg font-bold">{pkg.coins}</div>
              <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fontSize="12" fill="black">$</text>
              </svg>
            </div>

            {/* Price */}
            <div className="text-white text-sm font-semibold">$ {pkg.price}</div>
          </div>
        ))}
      </div>

      {/* Stripe payment button (full-width, purple gradient) */}
      <button
        onClick={handlePurchase}
        disabled={!selectedPackage || isProcessing}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 ${
          !selectedPackage || isProcessing
            ? 'bg-[#262626] text-[#666] cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/20'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          'stripe'
        )}
      </button>
    </div>
  );
}

