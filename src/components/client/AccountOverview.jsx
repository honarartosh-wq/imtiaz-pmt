import React from 'react';
import PropTypes from 'prop-types';
import { DollarSign, TrendingUp, Activity, Eye, EyeOff } from 'lucide-react';

/**
 * Account Overview Component
 * Displays account balance, equity, and key metrics
 */
export function AccountOverview({ accountData, showBalance, onToggleBalance }) {
  const formatCurrency = (amount) => {
    return showBalance ? `$${amount.toLocaleString()}` : '****';
  };

  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm opacity-90">Account Balance</div>
          <button
            onClick={onToggleBalance}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className="text-3xl font-bold mb-1">{formatCurrency(accountData.balance)}</div>
        <div className="text-sm opacity-75">Available Funds</div>
      </div>

      {/* Equity Card */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center mb-2">
          <TrendingUp size={20} className="text-blue-400 mr-2" />
          <div className="text-slate-400 text-sm">Equity</div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{formatCurrency(accountData.equity)}</div>
        <div className="text-sm text-emerald-400">+{formatPercent((accountData.equity / accountData.balance - 1) * 100)}</div>
      </div>

      {/* Free Margin Card */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center mb-2">
          <DollarSign size={20} className="text-purple-400 mr-2" />
          <div className="text-slate-400 text-sm">Free Margin</div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{formatCurrency(accountData.freeMargin)}</div>
        <div className="text-sm text-slate-400">Available for trading</div>
      </div>

      {/* Margin Level Card */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center mb-2">
          <Activity size={20} className="text-amber-400 mr-2" />
          <div className="text-slate-400 text-sm">Margin Level</div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{formatPercent(accountData.marginLevel)}</div>
        <div className="text-sm text-slate-400">Health indicator</div>
      </div>
    </div>
  );
}

AccountOverview.propTypes = {
  accountData: PropTypes.shape({
    balance: PropTypes.number.isRequired,
    equity: PropTypes.number.isRequired,
    freeMargin: PropTypes.number.isRequired,
    marginLevel: PropTypes.number.isRequired,
    unrealizedPL: PropTypes.number,
  }).isRequired,
  showBalance: PropTypes.bool.isRequired,
  onToggleBalance: PropTypes.func.isRequired,
};
