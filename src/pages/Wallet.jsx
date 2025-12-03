import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, History, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRecharge, setShowRecharge] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadBalance();
    loadHistory();
  }, []);

  const loadBalance = async () => {
    // TODO: 调用API获取余额
    setBalance(100); // 示例数据
  };

  const loadHistory = async () => {
    // TODO: 调用API获取历史记录
    setHistory([
      { id: 1, type: 'recharge', amount: 100, created_at: new Date().toISOString() },
      { id: 2, type: 'consume', amount: -10, created_at: new Date().toISOString() },
    ]);
  };

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('请输入有效的金额');
      return;
    }
    // TODO: 调用API充值
    toast.success(`充值 ${amount} 元成功！`);
    setBalance(balance + amount);
    setRechargeAmount('');
    setShowRecharge(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 余额卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">我的钱包</h2>
            <p className="text-purple-100">账户余额</p>
          </div>
          <WalletIcon size={48} className="opacity-80" />
        </div>
        <div className="text-5xl font-bold mb-6">
          ¥{balance.toFixed(2)}
        </div>
        <button
          onClick={() => setShowRecharge(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
        >
          <Plus size={20} />
          充值
        </button>
      </motion.div>

      {/* 充值弹窗 */}
      {showRecharge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-2xl font-bold gradient-text mb-4">充值</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  充值金额
                </label>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="请输入充值金额"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                {[10, 50, 100, 200, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRechargeAmount(amount.toString())}
                    className="flex-1 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    ¥{amount}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRecharge(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleRecharge}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  确认充值
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 交易历史 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <History size={24} className="text-purple-600" />
          <h2 className="text-2xl font-bold gradient-text">交易记录</h2>
        </div>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">暂无交易记录</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'recharge'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.type === 'recharge' ? '充值' : '消费'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-bold ${
                    item.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.amount > 0 ? '+' : ''}¥{Math.abs(item.amount).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

