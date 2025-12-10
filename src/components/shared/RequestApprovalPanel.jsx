import React, { useState, useEffect } from 'react';
import { getTransactionRequests, approveTransactionRequest } from '../../services/transactionApi';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';

const RequestApprovalPanel = ({ userRole = 'manager' }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getTransactionRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to load requests');
      console.error('Requests fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovalAmount(request.requested_amount.toString());
    setAdminNotes('');
    setShowApprovalModal(true);
  };

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      setProcessingId(requestId);
      await approveTransactionRequest(requestId, 'reject', null, 'Request rejected');
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const submitApproval = async () => {
    if (!approvalAmount || parseFloat(approvalAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setProcessingId(selectedRequest.id);
      await approveTransactionRequest(
        selectedRequest.id,
        'approve',
        parseFloat(approvalAmount),
        adminNotes || null
      );
      setShowApprovalModal(false);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
      case 'approved':
        return 'bg-green-900/30 text-green-400 border-green-800';
      case 'rejected':
        return 'bg-red-900/30 text-red-400 border-red-800';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-800';
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

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Transaction Requests</h3>
        <button
          onClick={fetchRequests}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === status
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && ` (${requests.length})`}
            {status !== 'all' && ` (${requests.filter(r => r.status === status).length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No {filter !== 'all' ? filter : ''} requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-slate-700/50 rounded-lg p-5 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{request.user_name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{request.user_email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white capitalize">
                    {request.request_type}
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${parseFloat(request.requested_amount).toFixed(2)}
                  </div>
                  {request.approved_amount && request.approved_amount !== request.requested_amount && (
                    <div className="text-sm text-yellow-400 mt-1">
                      Approved: ${parseFloat(request.approved_amount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {request.client_notes && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Client notes:</div>
                  <div className="text-sm text-gray-300 bg-slate-800 p-3 rounded">
                    {request.client_notes}
                  </div>
                </div>
              )}

              {request.admin_notes && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Admin response:</div>
                  <div className="text-sm text-gray-300 bg-slate-800 p-3 rounded">
                    {request.admin_notes}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                <div className="text-xs text-gray-500">
                  Created: {formatDate(request.created_at)}
                  {request.approved_by_name && (
                    <> • Processed by: {request.approved_by_name}</>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {processingId === request.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Approve Request</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Client:</div>
              <div className="text-white font-semibold">{selectedRequest.user_name}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Request Type:</div>
              <div className="text-white capitalize">{selectedRequest.request_type}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-1">Requested Amount:</div>
              <div className="text-2xl font-bold text-emerald-400">
                ${parseFloat(selectedRequest.requested_amount).toFixed(2)}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="approvalAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Approval Amount (can be partial)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="approvalAmount"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={selectedRequest.requested_amount}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Add notes for the client..."
                rows="3"
                maxLength="500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitApproval}
                disabled={processingId === selectedRequest.id}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {processingId === selectedRequest.id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve ${parseFloat(approvalAmount).toFixed(2)}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                }}
                disabled={processingId === selectedRequest.id}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestApprovalPanel;
