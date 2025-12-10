from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from app.database import get_db
from app.models import User, Account, Transaction, TransactionRequest, UserRole, TransactionType, TransactionStatus, RequestStatus
from app.schemas.transaction_request import (
    DepositWithdrawRequest,
    TransactionRequestApprove,
    TransactionRequestResponse,
    TransactionRequestCreate,
    ProfitTransferRequest,
    TransactionHistoryResponse
)
from app.middleware.auth import get_current_user
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/transactions", tags=["Transactions"])


# ==================== Manager Transaction Endpoints ====================

def require_manager(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is a manager"""
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can perform this action"
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is an admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    return current_user


def require_client(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is a client"""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clients can perform this action"
        )
    return current_user


@router.post("/manager/deposit-admin", status_code=status.HTTP_200_OK)
async def manager_deposit_to_admin(
    request: DepositWithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Manager deposits money to admin account"""
    try:
        admin_user = db.query(User).filter(
            User.id == request.target_user_id,
            User.role == UserRole.ADMIN
        ).first()
        
        if not admin_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin user not found"
            )
        
        old_balance = admin_user.admin_balance or Decimal('0.0')
        admin_user.admin_balance = old_balance + request.amount
        
        transaction = Transaction(
            user_id=admin_user.id,
            account_id=None,
            transaction_type=TransactionType.DEPOSIT,
            amount=request.amount,
            balance_before=old_balance,
            balance_after=admin_user.admin_balance,
            description=f"Deposit by Manager: {request.notes}",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id,
            to_user_id=admin_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Manager {current_user.email} deposited ${request.amount} to Admin {admin_user.email}")
        
        return {
            "success": True,
            "message": f"Successfully deposited ${request.amount} to {admin_user.name}",
            "new_balance": float(admin_user.admin_balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Deposit to admin failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process deposit"
        )


@router.post("/manager/withdraw-admin", status_code=status.HTTP_200_OK)
async def manager_withdraw_from_admin(
    request: DepositWithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Manager withdraws money from admin account"""
    try:
        admin_user = db.query(User).filter(
            User.id == request.target_user_id,
            User.role == UserRole.ADMIN
        ).first()
        
        if not admin_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin user not found"
            )
        
        old_balance = admin_user.admin_balance or Decimal('0.0')
        
        if old_balance < request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Admin has ${old_balance}"
            )
        
        admin_user.admin_balance = old_balance - request.amount
        
        transaction = Transaction(
            user_id=admin_user.id,
            account_id=None,
            transaction_type=TransactionType.WITHDRAW,
            amount=request.amount,
            balance_before=old_balance,
            balance_after=admin_user.admin_balance,
            description=f"Withdrawal by Manager: {request.notes}",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id,
            from_user_id=admin_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Manager {current_user.email} withdrew ${request.amount} from Admin {admin_user.email}")
        
        return {
            "success": True,
            "message": f"Successfully withdrew ${request.amount} from {admin_user.name}",
            "new_balance": float(admin_user.admin_balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Withdrawal from admin failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process withdrawal"
        )


@router.post("/manager/deposit-client", status_code=status.HTTP_200_OK)
async def manager_deposit_to_client(
    request: DepositWithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Manager deposits money directly to client trading balance"""
    try:
        client_user = db.query(User).filter(
            User.id == request.target_user_id,
            User.role == UserRole.CLIENT
        ).first()
        
        if not client_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client user not found"
            )
        
        account = db.query(Account).filter(Account.user_id == client_user.id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client account not found"
            )
        
        old_balance = account.trading_balance
        account.trading_balance = old_balance + request.amount
        account.balance = account.wallet_balance + account.trading_balance
        
        transaction = Transaction(
            user_id=client_user.id,
            account_id=account.id,
            transaction_type=TransactionType.DEPOSIT,
            amount=request.amount,
            balance_before=old_balance,
            balance_after=account.trading_balance,
            description=f"Deposit by Manager: {request.notes}",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id,
            to_user_id=client_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Manager {current_user.email} deposited ${request.amount} to Client {client_user.email}")
        
        return {
            "success": True,
            "message": f"Successfully deposited ${request.amount} to {client_user.name}",
            "new_trading_balance": float(account.trading_balance),
            "new_total_balance": float(account.balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Deposit to client failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process deposit"
        )


@router.post("/manager/withdraw-client", status_code=status.HTTP_200_OK)
async def manager_withdraw_from_client(
    request: DepositWithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    """Manager withdraws money from client wallet balance"""
    try:
        client_user = db.query(User).filter(
            User.id == request.target_user_id,
            User.role == UserRole.CLIENT
        ).first()
        
        if not client_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client user not found"
            )
        
        account = db.query(Account).filter(Account.user_id == client_user.id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client account not found"
            )
        
        old_balance = account.wallet_balance
        
        if old_balance < request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient wallet balance. Client has ${old_balance}"
            )
        
        account.wallet_balance = old_balance - request.amount
        account.balance = account.wallet_balance + account.trading_balance
        
        transaction = Transaction(
            user_id=client_user.id,
            account_id=account.id,
            transaction_type=TransactionType.WITHDRAW,
            amount=request.amount,
            balance_before=old_balance,
            balance_after=account.wallet_balance,
            description=f"Withdrawal by Manager: {request.notes}",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id,
            from_user_id=client_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Manager {current_user.email} withdrew ${request.amount} from Client {client_user.email}")
        
        return {
            "success": True,
            "message": f"Successfully withdrew ${request.amount} from {client_user.name}",
            "new_wallet_balance": float(account.wallet_balance),
            "new_total_balance": float(account.balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Withdrawal from client failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process withdrawal"
        )


# ==================== Admin Transaction Endpoints ====================

@router.post("/admin/deposit-client", status_code=status.HTTP_200_OK)
async def admin_deposit_to_client(
    request: DepositWithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin deposits money to client in their branch"""
    try:
        client_user = db.query(User).filter(
            User.id == request.target_user_id,
            User.role == UserRole.CLIENT,
            User.branch_id == current_user.branch_id
        ).first()
        
        if not client_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found in your branch"
            )
        
        account = db.query(Account).filter(Account.user_id == client_user.id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client account not found"
            )
        
        old_balance = account.trading_balance
        account.trading_balance = old_balance + request.amount
        account.balance = account.wallet_balance + account.trading_balance
        
        transaction = Transaction(
            user_id=client_user.id,
            account_id=account.id,
            transaction_type=TransactionType.DEPOSIT,
            amount=request.amount,
            balance_before=old_balance,
            balance_after=account.trading_balance,
            description=f"Deposit by Admin: {request.notes}",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id,
            to_user_id=client_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Admin {current_user.email} deposited ${request.amount} to Client {client_user.email}")
        
        return {
            "success": True,
            "message": f"Successfully deposited ${request.amount} to {client_user.name}",
            "new_trading_balance": float(account.trading_balance),
            "new_total_balance": float(account.balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Admin deposit failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process deposit"
        )


@router.post("/admin/withdraw-client", status_code=status.HTTP_200_OK)
async def admin_withdraw_from_client(
    request: DepositWithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin withdraws money from client in their branch"""
    try:
        client_user = db.query(User).filter(
            User.id == request.target_user_id,
            User.role == UserRole.CLIENT,
            User.branch_id == current_user.branch_id
        ).first()
        
        if not client_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found in your branch"
            )
        
        account = db.query(Account).filter(Account.user_id == client_user.id).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client account not found"
            )
        
        old_balance = account.wallet_balance
        
        if old_balance < request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient wallet balance. Client has ${old_balance}"
            )
        
        account.wallet_balance = old_balance - request.amount
        account.balance = account.wallet_balance + account.trading_balance
        
        transaction = Transaction(
            user_id=client_user.id,
            account_id=account.id,
            transaction_type=TransactionType.WITHDRAW,
            amount=request.amount,
            balance_before=old_balance,
            balance_after=account.wallet_balance,
            description=f"Withdrawal by Admin: {request.notes}",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id,
            from_user_id=client_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Admin {current_user.email} withdrew ${request.amount} from Client {client_user.email}")
        
        return {
            "success": True,
            "message": f"Successfully withdrew ${request.amount} from {client_user.name}",
            "new_wallet_balance": float(account.wallet_balance),
            "new_total_balance": float(account.balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Admin withdrawal failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process withdrawal"
        )


# ==================== Transaction Request Endpoints ====================

@router.get("/requests", response_model=List[TransactionRequestResponse])
async def get_transaction_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transaction requests based on user role"""
    try:
        if current_user.role == UserRole.MANAGER:
            query = db.query(TransactionRequest).join(User, TransactionRequest.user_id == User.id)
        elif current_user.role == UserRole.ADMIN:
            query = db.query(TransactionRequest).join(User, TransactionRequest.user_id == User.id).filter(
                User.branch_id == current_user.branch_id
            )
        else:  # CLIENT
            query = db.query(TransactionRequest).filter(TransactionRequest.user_id == current_user.id)
        
        if status_filter:
            query = query.filter(TransactionRequest.status == status_filter)
        
        requests = query.order_by(TransactionRequest.created_at.desc()).all()
        
        result = []
        for req in requests:
            approved_by_name = None
            if req.approved_by_id:
                approver = db.query(User).filter(User.id == req.approved_by_id).first()
                if approver:
                    approved_by_name = approver.name
            
            result.append(TransactionRequestResponse(
                id=req.id,
                user_id=req.user_id,
                user_name=req.user.name,
                user_email=req.user.email,
                request_type=req.request_type.value,
                requested_amount=req.requested_amount,
                approved_amount=req.approved_amount,
                status=req.status.value,
                client_notes=req.client_notes,
                admin_notes=req.admin_notes,
                approved_by_id=req.approved_by_id,
                approved_by_name=approved_by_name,
                approved_at=req.approved_at,
                created_at=req.created_at,
                updated_at=req.updated_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to fetch transaction requests: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transaction requests"
        )


@router.post("/request", status_code=status.HTTP_201_CREATED)
async def create_transaction_request(
    request: TransactionRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    """Client creates a deposit or withdrawal request"""
    try:
        trans_request = TransactionRequest(
            user_id=current_user.id,
            request_type=request.request_type,
            requested_amount=request.requested_amount,
            client_notes=request.client_notes,
            status=RequestStatus.PENDING
        )
        
        db.add(trans_request)
        db.commit()
        db.refresh(trans_request)
        
        logger.info(f"Client {current_user.email} requested {request.request_type} of ${request.requested_amount}")
        
        return {
            "success": True,
            "message": f"{request.request_type.capitalize()} request submitted successfully",
            "request_id": trans_request.id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create transaction request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create request"
        )


@router.post("/approve-request", status_code=status.HTTP_200_OK)
async def approve_transaction_request(
    request: TransactionRequestApprove,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin/Manager approves or rejects a transaction request"""
    try:
        if current_user.role not in [UserRole.MANAGER, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only managers and admins can approve requests"
            )
        
        trans_request = db.query(TransactionRequest).filter(
            TransactionRequest.id == request.request_id
        ).first()
        
        if not trans_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction request not found"
            )
        
        # Admin can only approve requests from their branch
        if current_user.role == UserRole.ADMIN:
            client_user = db.query(User).filter(User.id == trans_request.user_id).first()
            if client_user.branch_id != current_user.branch_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only approve requests from your branch"
                )
        
        if trans_request.status != RequestStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Request is already {trans_request.status.value}"
            )
        
        if request.action == 'reject':
            trans_request.status = RequestStatus.REJECTED
            trans_request.approved_by_id = current_user.id
            trans_request.approved_at = datetime.utcnow()
            trans_request.admin_notes = request.admin_notes
            db.commit()
            
            return {
                "success": True,
                "message": "Request rejected successfully"
            }
        
        approved_amount = request.approved_amount or trans_request.requested_amount
        
        client_user = db.query(User).filter(User.id == trans_request.user_id).first()
        account = db.query(Account).filter(Account.user_id == client_user.id).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client account not found"
            )
        
        if trans_request.request_type.value == 'deposit':
            old_balance = account.trading_balance
            account.trading_balance = old_balance + approved_amount
            account.balance = account.wallet_balance + account.trading_balance
            
            transaction = Transaction(
                user_id=client_user.id,
                account_id=account.id,
                transaction_type=TransactionType.DEPOSIT,
                amount=approved_amount,
                balance_before=old_balance,
                balance_after=account.trading_balance,
                description=f"Approved deposit request. Notes: {request.admin_notes or 'N/A'}",
                status=TransactionStatus.COMPLETED,
                performed_by_id=current_user.id,
                to_user_id=client_user.id
            )
        else:
            old_balance = account.wallet_balance
            
            if old_balance < approved_amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient wallet balance. Client has ${old_balance}"
                )
            
            account.wallet_balance = old_balance - approved_amount
            account.balance = account.wallet_balance + account.trading_balance
            
            transaction = Transaction(
                user_id=client_user.id,
                account_id=account.id,
                transaction_type=TransactionType.WITHDRAW,
                amount=approved_amount,
                balance_before=old_balance,
                balance_after=account.wallet_balance,
                description=f"Approved withdrawal request. Notes: {request.admin_notes or 'N/A'}",
                status=TransactionStatus.COMPLETED,
                performed_by_id=current_user.id,
                from_user_id=client_user.id
            )
        
        db.add(transaction)
        db.flush()
        
        trans_request.status = RequestStatus.APPROVED
        trans_request.approved_amount = approved_amount
        trans_request.approved_by_id = current_user.id
        trans_request.approved_at = datetime.utcnow()
        trans_request.admin_notes = request.admin_notes
        trans_request.transaction_id = transaction.id
        
        db.commit()
        
        logger.info(f"{current_user.role.value} {current_user.email} approved {trans_request.request_type.value} request of ${approved_amount}")
        
        return {
            "success": True,
            "message": f"Request approved. ${approved_amount} {trans_request.request_type.value}ed",
            "transaction_id": transaction.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to approve request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process request approval"
        )


# ==================== Client Endpoints ====================

@router.post("/transfer-profit", status_code=status.HTTP_200_OK)
async def transfer_profit_to_wallet(
    request: ProfitTransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client)
):
    """Client transfers profit from trading balance to wallet balance"""
    try:
        account = db.query(Account).filter(Account.user_id == current_user.id).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found"
            )
        
        if account.trading_balance < request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient trading balance. You have ${account.trading_balance}"
            )
        
        old_trading = account.trading_balance
        old_wallet = account.wallet_balance
        
        account.trading_balance = old_trading - request.amount
        account.wallet_balance = old_wallet + request.amount
        
        transaction = Transaction(
            user_id=current_user.id,
            account_id=account.id,
            transaction_type=TransactionType.TRANSFER,
            amount=request.amount,
            balance_before=old_trading,
            balance_after=account.trading_balance,
            description="Profit transfer from trading balance to wallet balance",
            status=TransactionStatus.COMPLETED,
            performed_by_id=current_user.id
        )
        
        db.add(transaction)
        db.commit()
        
        logger.info(f"Client {current_user.email} transferred ${request.amount} to wallet")
        
        return {
            "success": True,
            "message": f"Successfully transferred ${request.amount} to wallet",
            "new_trading_balance": float(account.trading_balance),
            "new_wallet_balance": float(account.wallet_balance)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Profit transfer failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to transfer profit"
        )


@router.get("/history", response_model=List[TransactionHistoryResponse])
async def get_transaction_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transaction history for current user"""
    try:
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).order_by(Transaction.created_at.desc()).limit(limit).all()
        
        result = []
        for trans in transactions:
            performed_by_name = None
            if trans.performed_by_id:
                performer = db.query(User).filter(User.id == trans.performed_by_id).first()
                if performer:
                    performed_by_name = performer.name
            
            result.append(TransactionHistoryResponse(
                id=trans.id,
                transaction_type=trans.transaction_type.value,
                amount=trans.amount,
                balance_before=trans.balance_before,
                balance_after=trans.balance_after,
                description=trans.description,
                status=trans.status.value,
                performed_by_name=performed_by_name,
                created_at=trans.created_at
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to fetch transaction history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transaction history"
        )
