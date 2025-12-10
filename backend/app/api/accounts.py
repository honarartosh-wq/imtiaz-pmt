from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Account
from app.middleware.auth import get_current_user
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("/me")
async def get_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's account information"""
    try:
        account = db.query(Account).filter(Account.user_id == current_user.id).first()
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found"
            )
        
        return {
            "id": account.id,
            "account_number": account.account_number,
            "balance": float(account.balance),
            "wallet_balance": float(account.wallet_balance),
            "trading_balance": float(account.trading_balance),
            "leverage": account.leverage,
            "currency": account.currency,
            "status": account.status.value,
            "created_at": account.created_at,
            "last_activity": account.last_activity
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch account"
        )
