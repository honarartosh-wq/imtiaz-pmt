import React, { useState, useEffect } from 'react';
import { managerDepositToAdmin, managerWithdrawFromAdmin } from '../../services/transactionApi';
import { api } from '../../services/api';
import { Users, Plus, Minus, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

const AdminBalanceManager = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [transactionType, setTransactionType] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const response = await api.get('/api/manager/admins');
      setAdmins(response.data || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedAdmin) {
      setError('Please select an admin');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!notes.trim()) {
      setError('Transaction notes are required');
      return;
    }

    try {
      setLoading(true);
      const amountNum = parseFloat(amount);
      
      let result;
      if (transactionType === 'deposit') {
        result = await managerDepositToAdmin(selectedAdmin.id, amountNum, notes);
      } else {
        result = await managerWithdrawFromAdmin(selectedAdmin.id, amountNum, notes);
      }
      
      setSuccess(result.message);
      setAmount('');
      setNotes('');
      
      // Refresh admins list
      await fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.detail || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Admin Balance Management</h3>
          <p className="text-sm text-gray-400 mt-1">Deposit or withdraw funds from admin accounts</p>
        </div>
      </div>

      {loadingAdmins ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-2">Loading admins...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No admins found</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Admin */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Admin
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  type="button"
                  onClick={() => setSelectedAdmin(admin)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAdmin?.id === admin.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold text-white">{admin.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{admin.email}</div>
                  <div className="text-sm text-emerald-400 mt-2">
                    Balance: ${parseFloat(admin.admin_balance || 0).toFixed(2)}
                  </div>
                  {admin.branch_name && (
                    <div className="text-xs text-gray-500 mt-1">Branch: {admin.branch_name}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedAdmin && (
            <>
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransactionType('deposit')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      transactionType === 'deposit'
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-600 bg-slate-700 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <Plus className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-center font-semibold">Deposit</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('withdraw')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      transactionType === 'withdraw'
                        ? 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-slate-600 bg-slate-700 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <Minus className="w-5 h-5 mx-auto mb-2" />
                    <div className="text-center font-semibold">Withdraw</div>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {transactionType === 'withdraw' && selectedAdmin.admin_balance && (
                  <div className="text-xs text-gray-500 mt-1">
                    Available: ${parseFloat(selectedAdmin.admin_balance).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Notes <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Reason for this transaction (required)..."
                  rows="3"
                  maxLength="500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {notes.length}/500 characters
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

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
                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  transactionType === 'deposit'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-slate-700 disabled:text-gray-500 text-white`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {transactionType === 'deposit' ? (
                      <><Plus className="w-5 h-5" /> Deposit to Admin</>
                    ) : (
                      <><Minus className="w-5 h-5" /> Withdraw from Admin</>
                    )}
                  </>
                )}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default AdminBalanceManager;
