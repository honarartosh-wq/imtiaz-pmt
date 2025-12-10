import React, { useState } from 'react';
import { createTransactionRequest } from '../../services/transactionApi';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

const TransactionRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    requestType: 'deposit',
    amount: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const result = await createTransactionRequest(
        formData.requestType,
        parseFloat(formData.amount),
        formData.notes || null
      );
      
      setSuccess(result.message);
      setFormData({ requestType: 'deposit', amount: '', notes: '' });
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Request Transaction</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Request Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, requestType: 'deposit' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.requestType === 'deposit'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-600 bg-slate-700 text-gray-400 hover:border-slate-500'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Deposit</div>
                <div className="text-xs mt-1">Request funds</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, requestType: 'withdrawal' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.requestType === 'withdrawal'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-slate-600 bg-slate-700 text-gray-400 hover:border-slate-500'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Withdrawal</div>
                <div className="text-xs mt-1">Request payout</div>
              </div>
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            placeholder="Add any additional information..."
            rows="3"
            maxLength="500"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.notes.length}/500 characters
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
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionRequestForm;
