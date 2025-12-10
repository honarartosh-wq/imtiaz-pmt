import React, { useState, useEffect } from 'react';
import { getTransactionHistory } from '../../services/transactionApi';
import { ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, AlertCircle } from 'lucide-react';

const TransactionHistory = ({ limit = 20 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getTransactionHistory(limit);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load transaction history');
      console.error('Transaction history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'bonus':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'withdraw':
        return <ArrowUpCircle className="w-5 h-5 text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'bonus':
        return 'text-green-600';
      case 'withdraw':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Transaction History</h3>
        <button
          onClick={fetchHistory}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getTransactionIcon(transaction.transaction_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium capitalize">
                        {transaction.transaction_type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${transaction.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                        {transaction.status}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-400 mb-2">{transaction.description}</p>
                    )}
                    {transaction.performed_by_name && (
                      <p className="text-xs text-gray-500">By: {transaction.performed_by_name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-lg font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.transaction_type === 'withdraw' ? '-' : '+'}
                    ${parseFloat(transaction.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Balance: ${parseFloat(transaction.balance_after).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
