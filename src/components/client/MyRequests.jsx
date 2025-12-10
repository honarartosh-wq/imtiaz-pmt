import React, { useState, useEffect } from 'react';
import { getTransactionRequests } from '../../services/transactionApi';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

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
        <h3 className="text-xl font-semibold text-white">My Requests</h3>
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
              className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold capitalize">
                        {request.request_type}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {formatDate(request.created_at)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    ${parseFloat(request.requested_amount).toFixed(2)}
                  </div>
                  {request.approved_amount && request.approved_amount !== request.requested_amount && (
                    <div className="text-sm text-emerald-400 mt-1">
                      Approved: ${parseFloat(request.approved_amount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {request.client_notes && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Your notes:</div>
                  <div className="text-sm text-gray-300 bg-slate-800 p-2 rounded">
                    {request.client_notes}
                  </div>
                </div>
              )}

              {request.admin_notes && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Admin response:</div>
                  <div className="text-sm text-gray-300 bg-slate-800 p-2 rounded">
                    {request.admin_notes}
                  </div>
                </div>
              )}

              {request.approved_by_name && (
                <div className="text-xs text-gray-500 mt-2">
                  {request.status === 'approved' ? 'Approved' : 'Processed'} by: {request.approved_by_name}
                  {request.approved_at && ` on ${formatDate(request.approved_at)}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;
