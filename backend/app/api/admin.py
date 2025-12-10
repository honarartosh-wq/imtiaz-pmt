from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Account, Branch, UserRole
from app.middleware.auth import get_current_user
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin Operations"])


def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency to ensure user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )
    return current_user


@router.get("/branch-clients")
async def get_branch_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all clients in admin's branch."""
    
    if not current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin is not assigned to a branch"
        )
    
    clients = db.query(User).filter(
        User.role == UserRole.CLIENT,
        User.branch_id == current_user.branch_id
    ).all()
    
    result = []
    for client in clients:
        account = db.query(Account).filter(Account.user_id == client.id).first()
        
        result.append({
            "id": client.id,
            "name": client.name,
            "email": client.email,
            "account_number": client.account_number,
            "balance": float(account.balance if account else 0),
            "wallet_balance": float(account.wallet_balance if account else 0),
            "trading_balance": float(account.trading_balance if account else 0),
            "is_active": client.is_active,
            "created_at": client.created_at
        })
    
    return result


@router.get("/branch-info")
async def get_branch_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get admin's branch information."""
    
    if not current_user.branch_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin is not assigned to a branch"
        )
    
    branch = db.query(Branch).filter(Branch.id == current_user.branch_id).first()
    
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found"
        )
    
    # Count clients in branch
    client_count = db.query(User).filter(
        User.role == UserRole.CLIENT,
        User.branch_id == current_user.branch_id
    ).count()
    
    return {
        "id": branch.id,
        "name": branch.name,
        "code": branch.code,
        "client_count": client_count,
        "commission_per_lot": float(branch.commission_per_lot),
        "leverage": branch.leverage,
        "admin_balance": float(current_user.admin_balance or 0)
    }
