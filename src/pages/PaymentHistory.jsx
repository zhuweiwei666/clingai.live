import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import apiClient from '../services/api';

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user/orders');
      if (response.data?.success && response.data?.data?.orders) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Payment History</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No payment history</p>
            <button
              onClick={() => navigate('/coins')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium"
            >
              Buy Coins
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-[#141414] rounded-2xl p-4 border border-[#262626]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="text-white font-medium capitalize">
                        {order.type === 'coins' ? 'Coins Purchase' : 'Subscription'}
                      </div>
                      <div className="text-white/60 text-sm">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${order.amount?.toFixed(2) || '0.00'}</div>
                    <div className={`text-xs capitalize ${
                      order.status === 'paid' ? 'text-green-500' :
                      order.status === 'pending' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
                {order.type === 'coins' && (
                  <div className="text-white/60 text-sm">
                    {order.coins} coins {order.bonusCoins > 0 && `+ ${order.bonusCoins} bonus`}
                  </div>
                )}
                {order.type === 'subscription' && (
                  <div className="text-white/60 text-sm">
                    Plan: {order.plan}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

