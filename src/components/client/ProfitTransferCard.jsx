import React, { useState } from 'react';
import { transferProfitToWallet } from '../../services/transactionApi';
import { ArrowRightLeft, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

const ProfitTransferCard = ({ tradingBalance, walletBalance, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const transferAmount = parseFloat(amount);

    if (!transferAmount || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transferAmount > tradingBalance) {
      setError(`Insufficient trading balance. Available: $${tradingBalance.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      const result = await transferProfitToWallet(transferAmount);
      setSuccess(result.message);
      setAmount('');
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to transfer profit');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (percentage) => {
    const quickAmount = (tradingBalance * percentage / 100).toFixed(2);
    setAmount(quickAmount);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/10 rounded-lg">
          <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Transfer Profit to Wallet</h3>
          <p className="text-sm text-gray-400 mt-1">Move funds from trading to wallet balance</p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Trading Balance</div>
          <div className="text-2xl font-bold text-white">${tradingBalance.toFixed(2)}</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Wallet Balance</div>
          <div className="text-2xl font-bold text-emerald-400">${walletBalance.toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={handleTransfer} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-300 mb-2">
            Transfer Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="transferAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="0.00"
              step="0.01"
              min="0"
              max={tradingBalance}
              required
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <div className="text-sm text-gray-400 mb-2">Quick amounts:</div>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handleQuickAmount(percentage)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-emerald-500 rounded-lg text-sm text-white transition-all"
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg text-green-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowRightLeft className="w-5 h-5" />
              Transfer to Wallet
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-900/10 border border-blue-800 rounded-lg">
        <p className="text-xs text-blue-400">
          💡 Tip: Transfer your trading profits to your wallet for safe withdrawal.
        </p>
      </div>
    </div>
  );
};

export default ProfitTransferCard;
