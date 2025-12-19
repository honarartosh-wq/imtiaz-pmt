import api from './api';

// ==================== Manager Transaction APIs ====================

export const managerDepositToAdmin = async (targetUserId, amount, notes) => {
  const response = await api.post('/api/transactions/manager/deposit-admin', {
    target_user_id: targetUserId,
    amount,
    notes
  });
  return response.data;
};

export const managerWithdrawFromAdmin = async (targetUserId, amount, notes) => {
  const response = await api.post('/api/transactions/manager/withdraw-admin', {
    target_user_id: targetUserId,
    amount,
    notes
  });
  return response.data;
};

export const managerDepositToClient = async (targetUserId, amount, notes) => {
  const response = await api.post('/api/transactions/manager/deposit-client', {
    target_user_id: targetUserId,
    amount,
    notes
  });
  return response.data;
};

export const managerWithdrawFromClient = async (targetUserId, amount, notes) => {
  const response = await api.post('/api/transactions/manager/withdraw-client', {
    target_user_id: targetUserId,
    amount,
    notes
  });
  return response.data;
};

// ==================== Admin Transaction APIs ====================

export const adminDepositToClient = async (targetUserId, amount, notes) => {
  const response = await api.post('/api/transactions/admin/deposit-client', {
    target_user_id: targetUserId,
    amount,
    notes
  });
  return response.data;
};

export const adminWithdrawFromClient = async (targetUserId, amount, notes) => {
  const response = await api.post('/api/transactions/admin/withdraw-client', {
    target_user_id: targetUserId,
    amount,
    notes
  });
  return response.data;
};

// ==================== Transaction Request APIs ====================

export const getTransactionRequests = async (statusFilter = null) => {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const response = await api.get('/api/transactions/requests', { params });
  return response.data;
};

export const createTransactionRequest = async (requestType, requestedAmount, clientNotes) => {
  const response = await api.post('/api/transactions/request', {
    request_type: requestType,
    requested_amount: requestedAmount,
    client_notes: clientNotes
  });
  return response.data;
};

export const approveTransactionRequest = async (requestId, action, approvedAmount = null, adminNotes = null) => {
  const response = await api.post('/api/transactions/approve-request', {
    request_id: requestId,
    action,
    approved_amount: approvedAmount,
    admin_notes: adminNotes
  });
  return response.data;
};

// ==================== Client Transaction APIs ====================

export const transferProfitToWallet = async (amount) => {
  const response = await api.post('/api/transactions/transfer-profit', {
    amount
  });
  return response.data;
};

export const getTransactionHistory = async (limit = 50) => {
  const response = await api.get('/api/transactions/history', {
    params: { limit }
  });
  return response.data;
};
