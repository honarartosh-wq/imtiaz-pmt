from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class TransactionRequestCreate(BaseModel):
    """Schema for creating a transaction request (client)"""
    request_type: str = Field(..., description="deposit or withdrawal")
    requested_amount: Decimal = Field(..., gt=0, description="Amount requested")
    client_notes: Optional[str] = Field(None, max_length=500, description="Optional notes from client")

    @validator('request_type')
    def validate_request_type(cls, v):
        if v not in ['deposit', 'withdrawal']:
            raise ValueError('request_type must be either deposit or withdrawal')
        return v


class TransactionRequestApprove(BaseModel):
    """Schema for approving/rejecting a request (admin/manager)"""
    request_id: int = Field(..., description="Transaction request ID")
    action: str = Field(..., description="approve or reject")
    approved_amount: Optional[Decimal] = Field(None, gt=0, description="Amount to approve (can be partial)")
    admin_notes: Optional[str] = Field(None, max_length=500, description="Notes from admin/manager")

    @validator('action')
    def validate_action(cls, v):
        if v not in ['approve', 'reject']:
            raise ValueError('action must be either approve or reject')
        return v


class TransactionRequestResponse(BaseModel):
    """Schema for transaction request response"""
    id: int
    user_id: int
    user_name: str
    user_email: str
    request_type: str
    requested_amount: Decimal
    approved_amount: Optional[Decimal]
    status: str
    client_notes: Optional[str]
    admin_notes: Optional[str]
    approved_by_id: Optional[int]
    approved_by_name: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DepositWithdrawRequest(BaseModel):
    """Schema for direct deposit/withdrawal by manager/admin"""
    target_user_id: int = Field(..., description="User ID to deposit/withdraw to/from")
    amount: Decimal = Field(..., gt=0, description="Amount to deposit/withdraw")
    notes: str = Field(..., min_length=1, max_length=500, description="Transaction notes (required)")


class ProfitTransferRequest(BaseModel):
    """Schema for client to transfer profit from trading to wallet"""
    amount: Decimal = Field(..., gt=0, description="Amount to transfer from trading_balance to wallet_balance")


class TransactionHistoryResponse(BaseModel):
    """Schema for transaction history response"""
    id: int
    transaction_type: str
    amount: Decimal
    balance_before: Decimal
    balance_after: Decimal
    description: Optional[str]
    status: str
    performed_by_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
