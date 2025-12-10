from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class RequestType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class TransactionRequest(Base):
    __tablename__ = "transaction_requests"

    id = Column(Integer, primary_key=True, index=True)

    # Requester (client)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Request details
    request_type = Column(SQLEnum(RequestType), nullable=False)
    requested_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    approved_amount = Column(Numeric(precision=15, scale=2), nullable=True)  # For partial approvals
    
    # Status and notes
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING)
    client_notes = Column(Text, nullable=True)  # Notes from client
    admin_notes = Column(Text, nullable=True)   # Notes from admin/manager
    
    # Approval details
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Related transaction (after approval)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="transaction_requests")
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    transaction = relationship("Transaction", foreign_keys=[transaction_id])

    def __repr__(self):
        return f"<TransactionRequest {self.request_type} - {self.requested_amount} - {self.status}>"
